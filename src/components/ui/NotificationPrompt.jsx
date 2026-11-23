import { BellRing } from "lucide-react";

import {
  requestNotificationPermission,
  syncAllReminders,
} from "../../services/notificationService";
import useChequeStore from "../../store/chequeStore";
import useInstallmentStore from "../../store/installmentStore";
import useSettingsStore from "../../store/settingsStore";
import useUIStore from "../../store/uiStore";

export default function NotificationPrompt() {
  const open = useUIStore((state) => state.notificationPromptOpen);
  const setOpen = useUIStore((state) => state.setNotificationPromptOpen);
  const showToast = useUIStore((state) => state.showToast);
  const dismiss = useSettingsStore((state) => state.dismissNotificationPrompt);

  if (!open) return null;

  const handleEnable = async () => {
    setOpen(false);

    const granted = await requestNotificationPermission();

    if (granted) {
      await syncAllReminders(
        useChequeStore.getState().cheques,
        useInstallmentStore.getState().installments,
      );

      showToast("یادآورها فعال شد.", "success");
    } else {
      dismiss();

      showToast(
        "اجازه‌ی اعلان داده نشد. از تنظیمات برنامه می‌توانی بعداً فعالش کنی.",
        "warning",
      );
    }
  };

  const handleLater = () => {
    dismiss();
    setOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9998] flex items-end justify-center bg-black/60 px-4 pb-6 backdrop-blur-sm sm:items-center"
    >
      <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/10 text-green-500">
          <BellRing size={26} />
        </div>

        <h2 className="mt-4 text-lg font-black text-slate-900 dark:text-white">
          یادآور سررسید فعال شود؟
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          برای اینکه سررسید چک‌ها و اقساط را فراموش نکنی، برنامه باید اجازه‌ی
          نمایش اعلان داشته باشد. فقط برای یادآوری سررسید استفاده می‌شود.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleLater}
            className="rounded-2xl bg-slate-100 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            بعداً
          </button>

          <button
            type="button"
            onClick={handleEnable}
            className="rounded-2xl bg-green-600 py-3 text-sm font-black text-white transition hover:bg-green-500 active:scale-95"
          >
            فعال‌سازی
          </button>
        </div>
      </div>
    </div>
  );
}
