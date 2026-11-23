import { Capacitor } from "@capacitor/core";

import useSettingsStore from "../store/settingsStore";
import useUIStore from "../store/uiStore";

const isNative = Capacitor.isNativePlatform();

const CHANNEL_ID = "reminders";
const TEST_NOTIFICATION_ID = 999999999;
const OVERDUE_NOTIFICATION_ID = 900000001;

let LocalNotifications = null;
let channelReady = false;

async function getPlugin() {
  if (!isNative) return null;

  if (!LocalNotifications) {
    const mod = await import("@capacitor/local-notifications");
    LocalNotifications = mod.LocalNotifications;
  }

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
      // the channel already exists
    }

    channelReady = true;
  }

  return LocalNotifications;
}

// Notification ids must be plain 32-bit integers. Each kind has its own
// leading digit so two kinds can never collide with each other.
const ID_PREFIX = {
  cheque: 1,
  installment: 2,
  chequeDue: 3,
  installmentDue: 4,
};

function toNotificationId(kind, rawId) {
  const tail = Math.abs(Number(rawId)) % 100000000;

  return Number(`${ID_PREFIX[kind]}${String(tail).padStart(8, "0")}`);
}

function getReminderHour() {
  const hour = useSettingsStore.getState().reminderHour;

  return Number.isInteger(hour) && hour >= 0 && hour <= 23 ? hour : 9;
}

function getReminderDays() {
  const days = useSettingsStore.getState().reminderDays;

  return Number.isFinite(days) ? days : 1;
}

function parseDate(dateString) {
  if (!dateString) return null;

  const [year, month, day] = String(dateString).split("-").map(Number);

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day, getReminderHour(), 0, 0);
}

function todayIso() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${now.getFullYear()}-${month}-${day}`;
}

function describeDays(days) {
  return days === 1 ? "فردا" : `${days.toLocaleString("fa-IR")} روز دیگر`;
}

const nextUnpaid = (installment) =>
  (installment.schedule || []).find((item) => !item.paid);

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

export async function getExactAlarmStatus() {
  const plugin = await getPlugin();

  if (!plugin?.checkExactNotificationSetting) return "unknown";

  try {
    const result = await plugin.checkExactNotificationSetting();

    return result?.exact_alarm || "unknown";
  } catch {
    return "unknown";
  }
}

export async function openExactAlarmSettings() {
  const plugin = await getPlugin();

  if (!plugin?.changeExactNotificationSetting) return;

  try {
    await plugin.changeExactNotificationSetting();
  } catch {
    // the system screen could not be opened
  }
}

export async function getNotificationStatus() {
  const supported = isNotificationSupported();

  if (!supported) {
    return {
      supported: false,
      permission: "unsupported",
      exactAlarm: "unknown",
      pendingCount: 0,
      nextAt: null,
    };
  }

  const plugin = await getPlugin();
  const permission = await getNotificationPermission();
  const exactAlarm = await getExactAlarmStatus();

  let pendingCount = 0;
  let nextAt = null;

  try {
    const { notifications = [] } = await plugin.getPending();
    const real = notifications.filter(
      (item) => item.id !== TEST_NOTIFICATION_ID,
    );

    pendingCount = real.length;

    const times = real
      .map((item) => (item.schedule?.at ? new Date(item.schedule.at).getTime() : NaN))
      .filter((time) => Number.isFinite(time) && time > Date.now());

    nextAt = times.length > 0 ? new Date(Math.min(...times)) : null;
  } catch {
    // pending list is not available
  }

  return { supported, permission, exactAlarm, pendingCount, nextAt };
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
    // nothing was scheduled with these ids
  }
}

// Builds up to two reminders for one due date:
//   1) `reminderDays` before the due date (skipped when set to "only on the due day")
//   2) on the due day itself
// A reminder whose time already passed is skipped, so nothing fires twice.
function buildReminders({ type, rawId, dueDate, title, beforeBody, dueBody, route }) {
  const due = parseDate(dueDate);

  if (!due) return [];

  const now = Date.now();
  const days = getReminderDays();
  const list = [];

  if (days > 0) {
    const before = new Date(due);
    before.setDate(before.getDate() - days);

    if (before.getTime() > now) {
      list.push({
        id: toNotificationId(type, rawId),
        title,
        body: beforeBody(days),
        channelId: CHANNEL_ID,
        extra: { route },
        schedule: { at: before, allowWhileIdle: true },
      });
    }
  }

  if (due.getTime() > now) {
    list.push({
      id: toNotificationId(`${type}Due`, rawId),
      title,
      body: dueBody,
      channelId: CHANNEL_ID,
      extra: { route },
      schedule: { at: due, allowWhileIdle: true },
    });
  }

  return list;
}

function buildChequeReminders(cheque) {
  if (!cheque?.dueDate) return [];

  const label = `چک ${cheque.chequeNumber || ""} به مبلغ ${Number(
    cheque.amount || 0,
  ).toLocaleString("fa-IR")} تومان`;

  return buildReminders({
    type: "cheque",
    rawId: cheque.id,
    dueDate: cheque.dueDate,
    title: "یادآوری چک",
    beforeBody: (days) => `${label} ${describeDays(days)} سررسید می‌شود.`,
    dueBody: `${label} امروز سررسید است.`,
    route: `/edit-cheque/${cheque.id}`,
  });
}

function buildInstallmentReminders(installment) {
  const next = nextUnpaid(installment);

  if (!next) return [];

  const label = `قسط شماره ${next.number} (${installment.personName || "بدون نام"})`;

  return buildReminders({
    type: "installment",
    rawId: installment.id,
    dueDate: next.dueDate,
    title: "یادآوری قسط",
    beforeBody: (days) => `${label} ${describeDays(days)} سررسید می‌شود.`,
    dueBody: `${label} امروز سررسید است.`,
    route: `/installments/${installment.id}`,
  });
}

async function isGranted(plugin) {
  try {
    const result = await plugin.checkPermissions();

    return result.display === "granted";
  } catch {
    return false;
  }
}

export async function scheduleChequeReminder(cheque) {
  const plugin = await getPlugin();

  if (!plugin || !cheque?.dueDate) return;

  await cancelNotification("cheque", cheque.id);

  if (!(await isGranted(plugin))) return;

  const notifications = buildChequeReminders(cheque);

  if (notifications.length > 0) {
    await plugin.schedule({ notifications });
  }
}

export async function scheduleInstallmentReminder(installment) {
  const plugin = await getPlugin();

  if (!plugin) return;

  await cancelNotification("installment", installment.id);

  if (!(await isGranted(plugin))) return;

  const notifications = buildInstallmentReminders(installment);

  if (notifications.length > 0) {
    await plugin.schedule({ notifications });
  }
}

function countOverdue(cheques, installments) {
  const today = todayIso();

  const chequeCount = (cheques || []).filter(
    (item) => item.status === "pending" && item.dueDate && item.dueDate < today,
  ).length;

  const installmentCount = (installments || []).filter((item) => {
    if (item.status === "completed") return false;

    const next = nextUnpaid(item);

    return next?.dueDate && next.dueDate < today;
  }).length;

  return { chequeCount, installmentCount };
}

// One daily reminder that sums up everything already overdue. It is removed
// as soon as nothing is overdue anymore.
export async function refreshOverdueSummary(cheques, installments) {
  const plugin = await getPlugin();

  if (!plugin) return;

  try {
    await plugin.cancel({ notifications: [{ id: OVERDUE_NOTIFICATION_ID }] });
  } catch {
    // nothing to cancel
  }

  if (!useSettingsStore.getState().notifications) return;
  if (!(await isGranted(plugin))) return;

  const { chequeCount, installmentCount } = countOverdue(cheques, installments);

  if (chequeCount + installmentCount === 0) return;

  const parts = [];

  if (chequeCount > 0) parts.push(`${chequeCount.toLocaleString("fa-IR")} چک`);
  if (installmentCount > 0) {
    parts.push(`${installmentCount.toLocaleString("fa-IR")} قسط`);
  }

  await plugin.schedule({
    notifications: [
      {
        id: OVERDUE_NOTIFICATION_ID,
        title: "سررسید گذشته",
        body: `${parts.join(" و ")} سررسید گذشته دارید.`,
        channelId: CHANNEL_ID,
        extra: { route: chequeCount > 0 ? "/cheques" : "/installments" },
        schedule: {
          on: { hour: getReminderHour(), minute: 0 },
          allowWhileIdle: true,
        },
      },
    ],
  });
}

// Re-syncs every reminder. It never asks for permission by itself — it only
// works when permission is already granted. Returns the permission state.
export async function syncAllReminders(cheques, installments) {
  const plugin = await getPlugin();

  if (!plugin) return "unsupported";

  const permission = await getNotificationPermission();

  if (permission !== "granted") return permission;

  const cancelList = [];
  const scheduleList = [];

  (cheques || []).forEach((cheque) => {
    cancelList.push(
      { id: toNotificationId("cheque", cheque.id) },
      { id: toNotificationId("chequeDue", cheque.id) },
    );

    if (cheque.status === "pending") {
      scheduleList.push(...buildChequeReminders(cheque));
    }
  });

  (installments || []).forEach((installment) => {
    cancelList.push(
      { id: toNotificationId("installment", installment.id) },
      { id: toNotificationId("installmentDue", installment.id) },
    );

    if (installment.status !== "completed") {
      scheduleList.push(...buildInstallmentReminders(installment));
    }
  });

  try {
    if (cancelList.length > 0) {
      await plugin.cancel({ notifications: cancelList });
    }

    if (scheduleList.length > 0) {
      await plugin.schedule({ notifications: scheduleList });
    }
  } catch (error) {
    console.error("Failed to sync reminders:", error);
  }

  await refreshOverdueSummary(cheques, installments);

  return "granted";
}

// Cancels every scheduled notification of this app.
export async function cancelAllReminders() {
  const plugin = await getPlugin();

  if (!plugin) return;

  try {
    const { notifications = [] } = await plugin.getPending();

    if (notifications.length > 0) {
      await plugin.cancel({ notifications });
    }
  } catch {
    // nothing is pending
  }
}

// Shows a notification about 5 seconds from now so the user can check that
// notifications work on this phone. Returns "ok" or the reason it failed.
export async function sendTestNotification() {
  const plugin = await getPlugin();

  if (!plugin) return "unsupported";

  const granted = await requestNotificationPermission();

  if (!granted) return "denied";

  await plugin.schedule({
    notifications: [
      {
        id: TEST_NOTIFICATION_ID,
        title: "CheckMaster",
        body: "اعلان‌ها روی این گوشی درست کار می‌کنند.",
        channelId: CHANNEL_ID,
        schedule: { at: new Date(Date.now() + 5000), allowWhileIdle: true },
      },
    ],
  });

  return "ok";
}

// Opens the explanation dialog once, at a useful moment (right after the
// user saved something with a due date), instead of at app start.
export async function promptNotificationsIfNeeded() {
  if (!isNative) return;

  const { notifications, notificationPromptDismissed } =
    useSettingsStore.getState();

  if (!notifications || notificationPromptDismissed) return;

  try {
    const permission = await getNotificationPermission();

    if (permission === "prompt" || permission === "prompt-with-rationale") {
      useUIStore.getState().setNotificationPromptOpen(true);
    }
  } catch {
    // permission state is not available
  }
}

// Opens the right page when the user taps a notification.
export async function registerNotificationTapHandler(navigate) {
  const plugin = await getPlugin();

  if (!plugin) return () => {};

  const handle = await plugin.addListener(
    "localNotificationActionPerformed",
    (event) => {
      const route = event?.notification?.extra?.route;

      if (typeof route === "string" && route.startsWith("/")) {
        navigate(route);
      }
    },
  );

  return () => handle.remove();
}
