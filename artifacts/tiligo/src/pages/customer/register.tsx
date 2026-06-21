import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import logoImg from "@/assets/logo.jpeg";
import { User, Mail, Phone, Lock, MapPin } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(2, "Emri duhet të ketë së paku 2 karaktere"),
  email: z.string().email("Email i pavlefshëm"),
  phone: z.string().min(8, "Numri i telefonit duhet të ketë së paku 8 karaktere"),
  address: z.string().optional(),
  password: z.string().min(6, "Fjalëkalimi duhet të ketë së paku 6 karaktere"),
  confirm_password: z.string(),
}).refine(d => d.password === d.confirm_password, {
  message: "Fjalëkalimet nuk përputhen",
  path: ["confirm_password"],
});

export default function CustomerRegister() {
  const [, setLocation] = useLocation();
  const { loginCustomer } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", phone: "", address: "", password: "", confirm_password: "" },
  });

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    try {
      const { confirm_password, ...body } = values;
      const res = await fetch("/api/customers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gabim në regjistrim");
      }
      const { token, ...customer } = await res.json();
      loginCustomer(customer, token);
      toast({ title: "Llogaria u krijua!", description: `Mirë se erdhe, ${customer.name}!` });
      setLocation("/profili");
    } catch (e: any) {
      toast({ title: "Gabim", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center tiligo-mesh p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <img src={logoImg} alt="TiliGo" className="h-16 w-16 rounded-2xl object-cover shadow-xl mx-auto mb-3 ring-4 ring-white" />
          <h1 className="text-2xl font-black">
            <span className="text-sky-500">Tili</span><span className="text-green-500">Go</span>
          </h1>
        </div>

        <Card className="glass border-white/60 shadow-2xl shadow-sky-100/40">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-bold">Krijo llogari falas</CardTitle>
            <CardDescription>Bashkohu me mijëra klientë në Kosovë</CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-sky-500" /> Emri i plotë</FormLabel>
                      <FormControl><Input placeholder="Filan Fisteku" className="glass border-sky-200/70" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5 text-xs"><Mail className="h-3 w-3 text-sky-500" /> Email</FormLabel>
                        <FormControl><Input placeholder="email@email.com" type="email" className="glass border-sky-200/70" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5 text-xs"><Phone className="h-3 w-3 text-sky-500" /> Telefoni</FormLabel>
                        <FormControl><Input placeholder="04X XXX XXX" className="glass border-sky-200/70" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-green-500" /> Adresa (opsionale)</FormLabel>
                      <FormControl><Input placeholder="Rruga, Lagjja, Qyteti..." className="glass border-sky-200/70" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5 text-xs"><Lock className="h-3 w-3 text-sky-500" /> Fjalëkalimi</FormLabel>
                        <FormControl><Input type="password" placeholder="••••••••" className="glass border-sky-200/70" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirm_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5 text-xs"><Lock className="h-3 w-3 text-green-500" /> Konfirmo</FormLabel>
                        <FormControl><Input type="password" placeholder="••••••••" className="glass border-sky-200/70" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-bold tiligo-gradient border-0 shadow-lg shadow-sky-300/40 hover:opacity-90 transition-opacity mt-2"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Po regjistrohet..." : "Krijo Llogarinë"}
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 border-t border-white/40 pt-4">
            <p className="text-sm text-muted-foreground text-center">
              Keni llogari?{" "}
              <Link href="/kycu" className="text-sky-600 font-semibold hover:underline">Kyçu këtu</Link>
            </p>
            <p className="text-xs text-muted-foreground text-center">
              <Link href="/" className="hover:text-sky-600 transition-colors">← Kthehu në kryefaqe</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
