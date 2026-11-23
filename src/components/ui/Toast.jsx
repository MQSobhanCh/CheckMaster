import { useEffect } from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

import useUIStore from "../../store/uiStore";

const styles = {
  success: { icon: CheckCircle2, color: "text-green-500", ring: "border-green-500/30" },
  error: { icon: AlertTriangle, color: "text-red-500", ring: "border-red-500/30" },
  warning: { icon: AlertTriangle, color: "text-amber-500", ring: "border-amber-500/30" },
  info: { icon: Info, color: "text-sky-500", ring: "border-sky-500/30" },
};

export default function Toast() {
  const { message, type, id } = useUIStore((state) => state.toast);
  const hideToast = useUIStore((state) => state.hideToast);

  useEffect(() => {
    if (!message) return undefined;

    const timer = setTimeout(hideToast, 3500);

    return () => clearTimeout(timer);
  }, [message, id, hideToast]);

  if (!message) return null;

  const style = styles[type] || styles.info;
  const Icon = style.icon;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-24 z-[9999] flex justify-center px-4"
    >
      <div
        className={`pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border bg-white p-4 shadow-2xl dark:bg-slate-900 ${style.ring}`}
      >
        <Icon className={`shrink-0 ${style.color}`} size={22} />

        <p className="flex-1 text-sm font-semibold leading-6 text-slate-800 dark:text-slate-100">
          {message}
        </p>

        <button
          type="button"
          onClick={hideToast}
          aria-label="بستن"
          className="shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
