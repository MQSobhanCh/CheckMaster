import { Capacitor } from "@capacitor/core";

const isNative = Capacitor.isNativePlatform();

let LocalNotifications = null;

async function getPlugin() {
  if (!isNative) return null;

  if (!LocalNotifications) {
    const mod = await import("@capacitor/local-notifications");
    LocalNotifications = mod.LocalNotifications;
  }

  return LocalNotifications;
}

// Local notifications need a plain 32-bit integer id.
// type: "cheque" | "installment" -> keeps the two id spaces from colliding.
function toNotificationId(type, rawId) {
  const prefix = type === "cheque" ? 1 : 2;
  const tail = Math.abs(Number(rawId)) % 100000000; // last 8 digits, safely

  return Number(`${prefix}${String(tail).padStart(8, "0")}`);
}

function parseDate(dateString) {
  if (!dateString) return null;

  const [year, month, day] = dateString.split("-").map(Number);

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day, 9, 0, 0); // 9:00 AM reminder
}

export async function requestNotificationPermission() {
  const plugin = await getPlugin();

  if (!plugin) return false;

  const result = await plugin.requestPermissions();

  return result.display === "granted";
}

export async function cancelNotification(type, rawId) {
  const plugin = await getPlugin();

  if (!plugin) return;

  const id = toNotificationId(type, rawId);

  try {
    await plugin.cancel({ notifications: [{ id }] });
  } catch {
    // nothing was scheduled with this id — safe to ignore
  }
}

export async function scheduleChequeReminder(cheque) {
  const plugin = await getPlugin();

  if (!plugin || !cheque?.dueDate) return;

  await cancelNotification("cheque", cheque.id);

  const dueDate = parseDate(cheque.dueDate);

  if (!dueDate) return;

  // remind one day before the due date; if that's already past, remind now+1min
  const reminderAt = new Date(dueDate);
  reminderAt.setDate(reminderAt.getDate() - 1);

  const fireAt = reminderAt.getTime() > Date.now()
    ? reminderAt
    : new Date(Date.now() + 60 * 1000);

  await plugin.schedule({
    notifications: [
      {
        id: toNotificationId("cheque", cheque.id),
        title: "یادآوری چک",
        body: `چک ${cheque.chequeNumber || ""} به مبلغ ${Number(
          cheque.amount || 0,
        ).toLocaleString("fa-IR")} تومان فردا سررسید می‌شود.`,
        schedule: { at: fireAt },
      },
    ],
  });
}

export async function scheduleInstallmentReminder(installment) {
  const plugin = await getPlugin();

  if (!plugin) return;

  await cancelNotification("installment", installment.id);

  const next = (installment.schedule || []).find((item) => !item.paid);

  if (!next) return; // fully paid — nothing to remind about

  const dueDate = parseDate(next.dueDate);

  if (!dueDate) return;

  const reminderAt = new Date(dueDate);
  reminderAt.setDate(reminderAt.getDate() - 1);

  const fireAt = reminderAt.getTime() > Date.now()
    ? reminderAt
    : new Date(Date.now() + 60 * 1000);

  await plugin.schedule({
    notifications: [
      {
        id: toNotificationId("installment", installment.id),
        title: "یادآوری قسط",
        body: `قسط شماره ${next.number} (${installment.personName || "بدون نام"}) فردا سررسید می‌شود.`,
        schedule: { at: fireAt },
      },
    ],
  });
}

// Re-syncs every pending reminder — call this once on app start (if the
// setting is on) and right after the user turns notifications ON.
export async function syncAllReminders(cheques, installments) {
  const plugin = await getPlugin();

  if (!plugin) return;

  const granted = await requestNotificationPermission();

  if (!granted) return;

  await Promise.all([
    ...(cheques || [])
      .filter((c) => c.status === "pending")
      .map((c) => scheduleChequeReminder(c)),
    ...(installments || [])
      .filter((i) => i.status !== "completed")
      .map((i) => scheduleInstallmentReminder(i)),
  ]);
}

// Cancels everything — call this when the user turns notifications OFF.
export async function cancelAllReminders(cheques, installments) {
  const plugin = await getPlugin();

  if (!plugin) return;

  await Promise.all([
    ...(cheques || []).map((c) => cancelNotification("cheque", c.id)),
    ...(installments || []).map((i) => cancelNotification("installment", i.id)),
  ]);
}
