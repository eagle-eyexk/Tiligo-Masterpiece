import { Router } from "express";
import { db } from "@workspace/db";
import { customersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import * as zod from "zod";
import crypto from "crypto";

const router = Router();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set — required for customer token signing");
}
const SECRET = crypto
  .createHmac("sha256", process.env.DATABASE_URL)
  .update("tiligo-customer-token-v1")
  .digest("hex");

async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.scrypt(password, salt, 64, (err, derived) => {
      if (err) reject(err);
      else resolve(`${salt}:${derived.toString("hex")}`);
    });
  });
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const parts = hash.split(":");
    if (parts.length !== 2) return resolve(false);
    const [salt, key] = parts;
    crypto.scrypt(password, salt, 64, (err, derived) => {
      if (err) reject(err);
      else {
        try {
          resolve(crypto.timingSafeEqual(Buffer.from(key, "hex"), derived));
        } catch {
          resolve(false);
        }
      }
    });
  });
}

function generateToken(customerId: number): string {
  const payload = `${customerId}:${Date.now()}`;
  const hmac = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}:${hmac}`).toString("base64url");
}

function verifyToken(token: string): number | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString();
    const lastColon = decoded.lastIndexOf(":");
    if (lastColon < 0) return null;
    const sig = decoded.slice(lastColon + 1);
    const payload = decoded.slice(0, lastColon);
    const expected = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
    if (sig.length !== expected.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))) return null;
    const firstColon = payload.indexOf(":");
    const id = Number(payload.slice(0, firstColon));
    const ts = Number(payload.slice(firstColon + 1));
    if (!id || !ts) return null;
    if (Date.now() - ts > 30 * 24 * 60 * 60 * 1000) return null;
    return id;
  } catch {
    return null;
  }
}

function requireCustomerAuth(req: any, res: any, next: any) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Authentication required" });
  const customerId = verifyToken(auth.slice(7));
  if (!customerId) return res.status(401).json({ error: "Invalid or expired token" });
  if (req.params.id && Number(req.params.id) !== customerId) {
    return res.status(403).json({ error: "Access denied" });
  }
  req.customerId = customerId;
  next();
}

const CreateCustomerBody = zod.object({
  name: zod.string().min(2),
  email: zod.string().email(),
  phone: zod.string().min(8),
  address: zod.string().optional(),
  password: zod.string().min(6),
});

const LoginCustomerBody = zod.object({
  email: zod.string().email(),
  password: zod.string(),
});

const UpdateCustomerBody = zod.object({
  name: zod.string().optional(),
  email: zod.string().email().optional(),
  phone: zod.string().optional(),
  address: zod.string().optional(),
});

router.post("/customers/register", async (req, res) => {
  try {
    const body = CreateCustomerBody.parse(req.body);
    const existing = await db.select().from(customersTable).where(eq(customersTable.email, body.email));
    if (existing.length > 0) {
      return res.status(409).json({ error: "Ky email është i regjistruar tashmë" });
    }
    const passwordHash = await hashPassword(body.password);
    const [row] = await db
      .insert(customersTable)
      .values({
        name: body.name,
        email: body.email,
        phone: body.phone,
        address: body.address,
        password_hash: passwordHash,
      })
      .returning();
    const { password_hash, ...result } = row;
    const token = generateToken(result.id);
    res.status(201).json({ ...result, token });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/customers/login", async (req, res) => {
  try {
    const { email, password } = LoginCustomerBody.parse(req.body);
    const [row] = await db
      .select()
      .from(customersTable)
      .where(eq(customersTable.email, email));
    if (!row) {
      return res.status(401).json({ error: "Email ose fjalëkalim i pasaktë" });
    }
    const valid = await verifyPassword(password, row.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Email ose fjalëkalim i pasaktë" });
    }
    const { password_hash, ...result } = row;
    const token = generateToken(result.id);
    res.json({ ...result, token });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/customers/:id", requireCustomerAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [row] = await db.select().from(customersTable).where(eq(customersTable.id, id));
    if (!row) return res.status(404).json({ error: "Not found" });
    const { password_hash, ...result } = row;
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.patch("/customers/:id", requireCustomerAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = UpdateCustomerBody.parse(req.body);
    const [row] = await db
      .update(customersTable)
      .set(body)
      .where(eq(customersTable.id, id))
      .returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    const { password_hash, ...result } = row;
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
