import { AlertTriangle } from "lucide-react";

import useUIStore from "../../store/uiStore";

export default function ConfirmDialog() {
  const state = useUIStore((s) => s.confirmState);
  const resolveConfirm = useUIStore((s) => s.resolveConfirm);

  if (!state) return null;

  const { title, message, confirmText, cancelText, danger } = state;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 px-5 backdrop-blur-sm"
      onClick={() => resolveConfirm(false)}
    >
      <div
        className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${
            danger ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"
          }`}
        >
          <AlertTriangle size={26} />
        </div>

        <h2 className="mt-4 text-lg font-black text-slate-900 dark:text-white">
          {title}
        </h2>

        {message && (
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {message}
          </p>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => resolveConfirm(false)}
            className="rounded-2xl bg-slate-100 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={() => resolveConfirm(true)}
            className={`rounded-2xl py-3 text-sm font-black text-white transition active:scale-95 ${
              danger ? "bg-red-500 hover:bg-red-400" : "bg-green-600 hover:bg-green-500"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
