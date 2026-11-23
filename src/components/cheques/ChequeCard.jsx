import { motion } from "framer-motion";
import {
  HiOutlinePencilSquare,
  HiOutlineTrash,
} from "react-icons/hi2";

import { typeLabels } from "../../constants/cheque";
import { formatPersianDate } from "../../utils/dates";

export default function ChequeCard({
  cheque,
  status,
  onEdit,
  onDelete,
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -4,
        scale: 1.01,
      }}
      transition={{ duration: .25 }}
      className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl p-5 mb-5 text-slate-900 dark:text-white"
    >
      <div className="flex justify-between items-start">

        <div>

          <h2 className="text-xl font-bold">
            {cheque.issuer || `چک شماره ${cheque.chequeNumber || ""}`}
          </h2>

          <p className="text-slate-500 mt-1">
            {cheque.bank || "بانک نامشخص"}
          </p>

        </div>

        <div className="flex flex-col items-end gap-2">
          <span
            className={`px-4 py-1 rounded-full text-sm font-semibold ${status.className}`}
          >
            {status.text}
          </span>

          {typeLabels[cheque.type] && (
            <span
              className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                cheque.type === "received"
                  ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                  : "bg-violet-500/10 text-violet-600 dark:text-violet-400"
              }`}
            >
              {typeLabels[cheque.type]}
            </span>
          )}
        </div>

      </div>

      <div className="grid grid-cols-2 gap-5 mt-6">

        <div>

          <p className="text-slate-500 text-sm">
            شماره چک
          </p>

          <p className="font-bold mt-1">
            {cheque.chequeNumber}
          </p>

        </div>

        <div>

          <p className="text-slate-500 text-sm">
            مبلغ
          </p>

          <p className="font-bold text-green-400 mt-1">
            {Number(
              cheque.amount
            ).toLocaleString("fa-IR")} تومان
          </p>

        </div>

        <div>

          <p className="text-slate-500 text-sm">
            دریافت‌کننده
          </p>

          <p className="font-bold mt-1">
            {cheque.receiver || "-"}
          </p>

        </div>

        <div>

          <p className="text-slate-500 text-sm">
            سررسید
          </p>

          <p className="font-bold mt-1">
            {formatPersianDate(cheque.dueDate)}
          </p>

        </div>

      </div>

      <div className="flex gap-3 mt-7">

        <button
          onClick={onEdit}
          className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition text-slate-900 dark:text-white rounded-xl py-3 flex items-center justify-center gap-2"
        >
          <HiOutlinePencilSquare size={20} />
          ویرایش
        </button>

        <button
          onClick={onDelete}
          className="flex-1 bg-red-500 hover:bg-red-600 transition text-slate-900 dark:text-white rounded-xl py-3 flex items-center justify-center gap-2"
        >
          <HiOutlineTrash size={20} />
          حذف
        </button>

      </div>

    </motion.div>
  );
}