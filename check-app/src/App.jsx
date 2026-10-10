import { useEffect } from "react";

import AppRouter from "./routes/AppRouter";
import useSettingsStore from "./store/settingsStore";
import useChequeStore from "./store/chequeStore";
import useInstallmentStore from "./store/installmentStore";
import { syncAllReminders } from "./services/notificationService";

function App() {
  const darkMode = useSettingsStore((state) => state.darkMode);
  const notifications = useSettingsStore((state) => state.notifications);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (!notifications) return;

    const cheques = useChequeStore.getState().cheques;
    const installments = useInstallmentStore.getState().installments;

    syncAllReminders(cheques, installments).catch(() => {});
    // only re-sync once on app start — stores already reschedule
    // individually whenever a cheque/installment changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <AppRouter />;
}

export default App;