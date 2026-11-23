import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import AppRouter from "./routes/AppRouter";
import BottomNav from "./components/layout/BottomNav";
import ConfirmDialog from "./components/ui/ConfirmDialog";
import NotificationPrompt from "./components/ui/NotificationPrompt";
import Toast from "./components/ui/Toast";
import useAndroidBackButton from "./hooks/useAndroidBackButton";
import {
  cancelAllReminders,
  refreshOverdueSummary,
  registerNotificationTapHandler,
  syncAllReminders,
} from "./services/notificationService";
import useChequeStore from "./store/chequeStore";
import useInstallmentStore from "./store/installmentStore";
import useSettingsStore from "./store/settingsStore";

const NAV_PATHS = [
  "/dashboard",
  "/cheques",
  "/installments",
  "/installments-dashboard",
  "/reports",
  "/settings",
];

function App() {
  useAndroidBackButton();

  const navigate = useNavigate();
  const location = useLocation();

  const darkMode = useSettingsStore((state) => state.darkMode);
  const notifications = useSettingsStore((state) => state.notifications);
  const reminderDays = useSettingsStore((state) => state.reminderDays);
  const reminderHour = useSettingsStore((state) => state.reminderHour);

  const cheques = useChequeStore((state) => state.cheques);
  const installments = useInstallmentStore((state) => state.installments);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Re-sync reminders when the app starts and whenever a reminder setting
  // changes. This never shows a permission prompt by itself.
  useEffect(() => {
    if (!notifications) {
      cancelAllReminders().catch(() => {});
      return;
    }

    syncAllReminders(
      useChequeStore.getState().cheques,
      useInstallmentStore.getState().installments,
    ).catch(() => {});
  }, [notifications, reminderDays, reminderHour]);

  // Keep the daily "overdue" reminder in line with the data.
  useEffect(() => {
    const timer = setTimeout(() => {
      refreshOverdueSummary(cheques, installments).catch(() => {});
    }, 1000);

    return () => clearTimeout(timer);
  }, [cheques, installments]);

  useEffect(() => {
    let remove = () => {};
    let cancelled = false;

    registerNotificationTapHandler(navigate)
      .then((fn) => {
        if (cancelled) fn();
        else remove = fn;
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      remove();
    };
  }, [navigate]);

  const showNav = NAV_PATHS.includes(location.pathname);

  return (
    <>
      <AppRouter />

      {showNav && <BottomNav />}

      <Toast />
      <ConfirmDialog />
      <NotificationPrompt />
    </>
  );
}

export default App;
