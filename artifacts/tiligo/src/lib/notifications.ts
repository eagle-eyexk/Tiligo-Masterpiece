export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;

  const permission = await Notification.requestPermission();
  return permission === "granted";
}

export function sendNotification(title: string, body: string, options?: NotificationOptions) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  const n = new Notification(title, {
    body,
    icon: "/favicon.svg",
    badge: "/favicon.svg",
    vibrate: [200, 100, 200],
    ...options,
  });

  setTimeout(() => n.close(), 8000);
  return n;
}

const STATUS_LABELS: Record<string, { title: string; body: string; emoji: string }> = {
  pranuar:          { emoji: "✅", title: "Porosia u pranua!",        body: "Biznesi konfirmoi porosinë tuaj." },
  ne_pergatitje:    { emoji: "👨‍🍳", title: "Po përgatitet!",          body: "Ushqimi juaj është duke u përgatitur." },
  gati_per_dorezim: { emoji: "📦", title: "Gati për dërgim!",         body: "Porosia juaj është gati dhe po pret kurrierin." },
  ne_rruge:         { emoji: "🛵", title: "Kurrieri është në rrugë!", body: "Porosia juaj po vjen drejt jush!" },
  dorezuar:         { emoji: "🎉", title: "Dorëzuar me sukses!",       body: "Porosia juaj u dorëzua. Ju bëftë mirë!" },
  anuluar:          { emoji: "❌", title: "Porosia u anulua",          body: "Na vjen keq, porosia juaj u anulua." },
};

export function notifyStatusChange(status: string) {
  const info = STATUS_LABELS[status];
  if (!info) return;
  sendNotification(`${info.emoji} ${info.title}`, info.body, { tag: `order-status-${status}` });
}
