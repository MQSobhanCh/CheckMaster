import { HiOutlineDocumentText } from "react-icons/hi2";

export default function EmptyState() {
  return (
    <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl p-12 text-center text-slate-900 dark:text-white">

      <div className="flex justify-center mb-5">
        <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
          <HiOutlineDocumentText
            size={42}
            className="text-green-400"
          />
        </div>
      </div>

      <h2 className="text-2xl font-bold">
        هیچ چکی ثبت نشده است
      </h2>

      <p className="text-slate-500 mt-3">
        اولین چک خود را ثبت کنید.
      </p>

    </div>
  );
}
