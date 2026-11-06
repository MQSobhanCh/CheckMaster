import { AnimatePresence, motion } from "framer-motion";

export default function DeleteModal({
  open,
  onClose,
  onConfirm,
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{
              scale: 0.8,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            exit={{
              scale: 0.8,
              opacity: 0,
            }}
            transition={{
              duration: 0.2,
            }}
            className="w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl text-slate-900 dark:text-white"
          >
            <h2 className="text-xl font-bold text-center">
              حذف چک
            </h2>

            <p className="mt-4 text-center text-slate-400">
              آیا از حذف این چک مطمئن هستید؟
            </p>

            <div className="mt-8 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 py-3 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                انصراف
              </button>

              <button
                onClick={onConfirm}
                className="flex-1 rounded-xl bg-red-600 py-3 font-semibold text-slate-900 dark:text-white hover:bg-red-700 transition"
              >
                حذف
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
