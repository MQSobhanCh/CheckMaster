import { useNavigate } from "react-router-dom";
import { CalendarClock, ChevronLeft } from "lucide-react";

import useChequeStore from "../../store/chequeStore";
import useInstallmentStore from "../../store/installmentStore";

const DAYS_AHEAD = 7;
const MAX_ITEMS = 5;

function parseDate(dateString) {
  if (!dateString) return null;

  const [year, month, day] = dateString.split("-").map(Number);

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

// 0 = today, 1 = tomorrow ... (null when the date is invalid)
function getDaysLeft(dateString) {
  const due = parseDate(dateString);

  if (!due) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Math.round((due.getTime() - today.getTime()) / 86400000);
}

function getBadge(daysLeft) {
  if (daysLeft === 0) {
    return { text: "امروز", className: "bg-red-500/10 text-red-400" };
  }

  if (daysLeft === 1) {
    return { text: "فردا", className: "bg-orange-500/10 text-orange-400" };
  }

  return {
    text: `${daysLeft.toLocaleString("fa-IR")} روز دیگر`,
    className: "bg-green-500/10 text-green-400",
  };
}

// "Due in the next 7 days" — pending cheques + the next unpaid installment of each plan
export default function UpcomingDue() {
  const navigate = useNavigate();

  const cheques = useChequeStore((state) => state.cheques);
  const installments = useInstallmentStore((state) => state.installments);

  const items = [];

  (cheques || []).forEach((cheque) => {
    const daysLeft = getDaysLeft(cheque.dueDate);

    if (
      cheque.status === "pending" &&
      daysLeft !== null &&
      daysLeft >= 0 &&
      daysLeft <= DAYS_AHEAD
    ) {
      items.push({
        key: `cheque-${cheque.id}`,
        title: `چک ${cheque.chequeNumber || ""}`.trim(),
        subtitle: cheque.bank || cheque.receiver || "",
        amount: cheque.amount,
        daysLeft,
        path: "/cheques",
      });
    }
  });

  (installments || []).forEach((installment) => {
    const next = (installment.schedule || []).find((item) => !item.paid);

    if (!next) return;

    const daysLeft = getDaysLeft(next.dueDate);

    if (daysLeft !== null && daysLeft >= 0 && daysLeft <= DAYS_AHEAD) {
      items.push({
        key: `installment-${installment.id}`,
        title: installment.personName || "بدون نام",
        subtitle: `قسط شماره ${Number(next.number).toLocaleString("fa-IR")}`,
        amount: next.amount,
        daysLeft,
        path: `/installments/${installment.id}`,
      });
    }
  });

  items.sort((a, b) => a.daysLeft - b.daysLeft);

  const visible = items.slice(0, MAX_ITEMS);

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
          <CalendarClock size={20} className="text-green-400" />
          سررسیدهای ۷ روز آینده
        </h2>

        {items.length > MAX_ITEMS && (
          <span className="text-xs text-slate-500">
            و {(items.length - MAX_ITEMS).toLocaleString("fa-IR")} مورد دیگر
          </span>
        )}
      </div>

      {visible.length === 0 ? (
        <p className="py-4 text-center text-sm text-slate-500">
          تا ۷ روز آینده سررسیدی نداری ✅
        </p>
      ) : (
        <div className="space-y-3">
          {visible.map((item) => {
            const badge = getBadge(item.daysLeft);

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => navigate(item.path)}
                className="flex w-full items-center justify-between gap-3 rounded-2xl bg-slate-100 dark:bg-slate-800 px-4 py-3 text-right transition hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </p>

                  <p className="mt-1 truncate text-xs text-slate-500">
                    {item.subtitle}
                    {item.subtitle && " · "}
                    {Number(item.amount || 0).toLocaleString("fa-IR")} تومان
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${badge.className}`}
                  >
                    {badge.text}
                  </span>

                  <ChevronLeft size={16} className="text-slate-500" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
