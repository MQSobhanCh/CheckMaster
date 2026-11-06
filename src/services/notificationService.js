import { Capacitor } from "@capacitor/core";

import useSettingsStore from "../store/settingsStore";

const isNative = Capacitor.isNativePlatform();

const CHANNEL_ID = "reminders";
const REMINDER_HOUR = 9; // reminders are shown at 9:00 AM
const TEST_NOTIFICATION_ID = 999999999;

let LocalNotifications = null;
let channelReady = false;

async function getPlugin() {
  if (!isNative) return null;

  if (!LocalNotifications) {
    const mod = await import("@capacitor/local-notifications");
    LocalNotifications = mod.LocalNotifications;
  }

  // Android 8+ needs a notification channel; creating it twice is harmless
  if (!channelReady) {
    try {
      await LocalNotifications.createChannel({
        id: CHANNEL_ID,
        name: "یادآور چک و اقساط",
        description: "یادآوری سررسید چک‌ها و اقساط",
        importance: 4,
        visibility: 1,
        vibration: true,
      });
    } catch {
      // channel already exists
    }
    channelReady = true;
  }

  return LocalNotifications;
}

// Local notifications need a plain 32-bit integer id.
// Each kind gets its own leading digit so ids can never collide:
//   1 = cheque (before due)   2 = installment (before due)
//   3 = cheque (due day)      4 = installment (due day)
const ID_PREFIX = {
  cheque: 1,
  installment: 2,
  chequeDue: 3,
  installmentDue: 4,
};

function toNotificationId(kind, rawId) {
  const tail = Math.abs(Number(rawId)) % 100000000; // last 8 digits, safely

  return Number(`${ID_PREFIX[kind]}${String(tail).padStart(8, "0")}`);
}

function parseDate(dateString) {
  if (!dateString) return null;

  const [year, month, day] = dateString.split("-").map(Number);

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day, REMINDER_HOUR, 0, 0);
}

function getReminderDays() {
  const days = useSettingsStore.getState().reminderDays;

  return Number.isFinite(days) ? days : 1;
}

function describeDays(days) {
  return days === 1
    ? "فردا"
    : `${days.toLocaleString("fa-IR")} روز دیگر`;
}

export function isNotificationSupported() {
  return isNative;
}

export async function getNotificationPermission() {
  const plugin = await getPlugin();

  if (!plugin) return "unsupported";

  const result = await plugin.checkPermissions();

  return result.display;
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

  const kinds =
    type === "cheque" ? ["cheque", "chequeDue"] : ["installment", "installmentDue"];

  try {
    await plugin.cancel({
      notifications: kinds.map((kind) => ({
        id: toNotificationId(kind, rawId),
      })),
    });
  } catch {
    // nothing was scheduled with these ids — safe to ignore
  }
}

// Schedules up to two reminders for one due date:
//   1) `reminderDays` before the due date (skipped when set to "only on the due day")
//   2) on the due day itself
// A reminder whose time has already passed is skipped (no repeat spam on every launch).
async function scheduleReminders({ plugin, type, rawId, dueDate, title, beforeBody, dueBody }) {
  const due = parseDate(dueDate);

  if (!due) return;

  const now = Date.now();
  const days = getReminderDays();
  const notifications = [];

  if (days > 0) {
    const before = new Date(due);
    before.setDate(before.getDate() - days);

    if (before.getTime() > now) {
      notifications.push({
        id: toNotificationId(type, rawId),
        title,
        body: beforeBody(days),
        channelId: CHANNEL_ID,
        schedule: { at: before, allowWhileIdle: true },
      });
    }
  }

  if (due.getTime() > now) {
    notifications.push({
      id: toNotificationId(`${type}Due`, rawId),
      title,
      body: dueBody,
      channelId: CHANNEL_ID,
      schedule: { at: due, allowWhileIdle: true },
    });
  }

  if (notifications.length > 0) {
    await plugin.schedule({ notifications });
  }
}

export async function scheduleChequeReminder(cheque) {
  const plugin = await getPlugin();

  if (!plugin || !cheque?.dueDate) return;

  await cancelNotification("cheque", cheque.id);

  const label = `چک ${cheque.chequeNumber || ""} به مبلغ ${Number(
    cheque.amount || 0,
  ).toLocaleString("fa-IR")} تومان`;

  await scheduleReminders({
    plugin,
    type: "cheque",
    rawId: cheque.id,
    dueDate: cheque.dueDate,
    title: "یادآوری چک",
    beforeBody: (days) => `${label} ${describeDays(days)} سررسید می‌شود.`,
    dueBody: `${label} امروز سررسید است.`,
  });
}

export async function scheduleInstallmentReminder(installment) {
  const plugin = await getPlugin();

  if (!plugin) return;

  await cancelNotification("installment", installment.id);

  const next = (installment.schedule || []).find((item) => !item.paid);

  if (!next) return; // fully paid — nothing to remind about

  const label = `قسط شماره ${next.number} (${installment.personName || "بدون نام"})`;

  await scheduleReminders({
    plugin,
    type: "installment",
    rawId: installment.id,
    dueDate: next.dueDate,
    title: "یادآوری قسط",
    beforeBody: (days) => `${label} ${describeDays(days)} سررسید می‌شود.`,
    dueBody: `${label} امروز سررسید است.`,
  });
}

// Re-syncs every pending reminder — call this once on app start (if the
// setting is on), right after the user turns notifications ON, and whenever
// the reminder lead time changes. Returns false when permission is missing.
export async function syncAllReminders(cheques, installments) {
  const plugin = await getPlugin();

  if (!plugin) return false;

  const granted = await requestNotificationPermission();

  if (!granted) return false;

  await Promise.all([
    ...(cheques || []).map((c) =>
      c.status === "pending"
        ? scheduleChequeReminder(c)
        : cancelNotification("cheque", c.id),
    ),
    ...(installments || []).map((i) =>
      i.status !== "completed"
        ? scheduleInstallmentReminder(i)
        : cancelNotification("installment", i.id),
    ),
  ]);

  return true;
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

// Shows a notification ~5 seconds from now so the user can check that
// notifications really work on this phone. Returns false without permission.
export async function sendTestNotification() {
  const plugin = await getPlugin();

  if (!plugin) return false;

  const granted = await requestNotificationPermission();

  if (!granted) return false;

  await plugin.schedule({
    notifications: [
      {
        id: TEST_NOTIFICATION_ID,
        title: "CheckMaster",
        body: "اعلان‌ها روی این گوشی درست کار می‌کنند ✅",
        channelId: CHANNEL_ID,
        schedule: { at: new Date(Date.now() + 5000), allowWhileIdle: true },
      },
    ],
  });

  return true;
}
