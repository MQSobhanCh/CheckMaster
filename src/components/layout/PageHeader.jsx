import { ArrowRight } from "lucide-react";

export default function PageHeader({ title, onBack }) {
  return (
    <div className="mb-8 flex items-center gap-3">
      <button
        type="button"
        onClick={onBack}
        aria-label="بازگشت"
        className="rounded-xl bg-slate-100 p-3 transition hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
      >
        <ArrowRight size={20} />
      </button>

      <h1 className="text-2xl font-black">{title}</h1>
    </div>
  );
}
