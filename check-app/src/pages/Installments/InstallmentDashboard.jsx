import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Wallet,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  Users,
  Eye,
} from "lucide-react";

import BottomNav from "../../components/layout/BottomNav";
import useInstallmentStore from "../../store/installmentStore";

function formatMoney(value) {
  return Number(value || 0).toLocaleString("fa-IR");
}

function parseDate(dateString) {
  if (!dateString) return null;

  const [year, month, day] = dateString.split("-").map(Number);

  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) return null;

  return date;
}

function formatDate(dateString) {
  const date = parseDate(dateString);

  if (!date) return "تعیین نشده";

  return date.toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getLateDays(dateString) {
  const dueDate = parseDate(dateString);

  if (!dueDate) return 0;

  dueDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (dueDate >= today) return 0;

  return Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
}

export default function InstallmentDashboard() {
  const navigate = useNavigate();

  const installments = useInstallmentStore((state) => state.installments);
  const getTotalAmount = useInstallmentStore((state) => state.getTotalAmount);
  const getPaidAmount = useInstallmentStore((state) => state.getPaidAmount);
  const getRemainingAmount = useInstallmentStore((state) => state.getRemainingAmount);
  const getActiveCount = useInstallmentStore((state) => state.getActiveCount);
  const getCompletedCount = useInstallmentStore((state) => state.getCompletedCount);
  const getLateInstallments = useInstallmentStore((state) => state.getLateInstallments);
  const getLateCount = useInstallmentStore((state) => state.getLateCount);

  const totalAmount = getTotalAmount();
  const paidAmount = getPaidAmount();
  const remainingAmount = getRemainingAmount();
  const activeCount = getActiveCount();
  const completedCount = getCompletedCount();
  const lateCount = getLateCount();
  const lateInstallments = getLateInstallments();

  const progress =
    totalAmount > 0 ? Math.min(Math.round((paidAmount / totalAmount) * 100), 100) : 0;

  const upcomingInstallments = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const list = [];

    installments.forEach((item) => {
      const next = (item.schedule || []).find((installment) => !installment.paid);

      if (next) {
        list.push({
          personId: item.id,
          personName: item.personName,
          number: next.number,
          amount: next.amount,
          dueDate: next.dueDate,
        });
      }
    });

    return list
      .filter((item) => item.dueDate)
      .sort((a, b) => (a.dueDate > b.dueDate ? 1 : -1))
      .slice(0, 5);
  }, [installments]);

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-6 pb-24 text-slate-900 dark:text-white">
      <div className="mx-auto max-w-5xl">
        {/* Header */}

        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/installments")}
            className="rounded-xl bg-slate-100 dark:bg-slate-800 p-3 transition hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <ArrowRight size={20} />
          </button>

          <div>
            <h1 className="text-2xl font-bold">داشبورد اقساط</h1>
            <p className="mt-1 text-sm text-slate-400">
              نمای کلی وضعیت پرداخت‌های اقساطی
            </p>
          </div>
        </div>

        {/* Stats */}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-slate-400">کل مبلغ</span>
              <Wallet size={20} className="text-green-400" />
            </div>
            <p className="text-xl font-bold">{formatMoney(totalAmount)}</p>
            <p className="mt-1 text-xs text-slate-500">تومان</p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-slate-400">پرداخت شده</span>
              <CheckCircle2 size={20} className="text-blue-400" />
            </div>
            <p className="text-xl font-bold text-blue-400">{formatMoney(paidAmount)}</p>
            <p className="mt-1 text-xs text-slate-500">تومان</p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-slate-400">باقی‌مانده</span>
              <Clock3 size={20} className="text-orange-400" />
            </div>
            <p className="text-xl font-bold text-orange-400">{formatMoney(remainingAmount)}</p>
            <p className="mt-1 text-xs text-slate-500">تومان</p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-slate-400">در حال پرداخت</span>
              <Users size={20} className="text-slate-700 dark:text-slate-300" />
            </div>
            <p className="text-xl font-bold">{activeCount.toLocaleString("fa-IR")}</p>
            <p className="mt-1 text-xs text-slate-500">نفر</p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-slate-400">تکمیل شده</span>
              <CheckCircle2 size={20} className="text-green-400" />
            </div>
            <p className="text-xl font-bold text-green-400">{completedCount.toLocaleString("fa-IR")}</p>
            <p className="mt-1 text-xs text-slate-500">نفر</p>
          </div>

          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-slate-400">دیرکرد</span>
              <AlertTriangle size={20} className="text-red-400" />
            </div>
            <p className="text-xl font-bold text-red-400">{lateCount.toLocaleString("fa-IR")}</p>
            <p className="mt-1 text-xs text-slate-500">قسط</p>
          </div>
        </div>

        {/* Overall progress */}

        <div className="mb-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-slate-400">پیشرفت کلی پرداخت</span>
            <span className="text-slate-700 dark:text-slate-300 font-bold">{progress.toLocaleString("fa-IR")}٪</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-green-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Late installments */}

        <div className="mb-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-red-400">
            <AlertTriangle size={18} />
            اقساط دارای دیرکرد
          </h2>

          {lateInstallments.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-500">
              هیچ قسط عقب‌افتاده‌ای وجود ندارد 🎉
            </p>
          ) : (
            <div className="space-y-3">
              {lateInstallments.map((item) => {
                const worst = item.lateInstallments.reduce(
                  (max, cur) => Math.max(max, getLateDays(cur.dueDate)),
                  0,
                );

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigate(`/installments/${item.id}`)}
                    className="flex w-full items-center justify-between rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-3 text-right transition hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    <div>
                      <p className="font-bold">{item.personName || "بدون نام"}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {item.lateInstallments.length.toLocaleString("fa-IR")} قسط معوق
                      </p>
                    </div>

                    <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-400">
                      {worst.toLocaleString("fa-IR")} روز تأخیر
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming installments */}

        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-200 dark:text-slate-800 dark:text-slate-200">
            <Clock3 size={18} className="text-green-400" />
            نزدیک‌ترین سررسیدها
          </h2>

          {upcomingInstallments.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-500">
              موردی برای نمایش وجود ندارد.
            </p>
          ) : (
            <div className="space-y-3">
              {upcomingInstallments.map((item) => (
                <button
                  key={`${item.personId}-${item.number}`}
                  type="button"
                  onClick={() => navigate(`/installments/${item.personId}`)}
                  className="flex w-full items-center justify-between rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-3 text-right transition hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <div className="flex items-center gap-2">
                    <Eye size={15} className="text-slate-500" />
                    <div>
                      <p className="font-bold">{item.personName || "بدون نام"}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        قسط شماره {item.number.toLocaleString("fa-IR")} · {formatDate(item.dueDate)}
                      </p>
                    </div>
                  </div>

                  <span className="text-sm font-bold text-green-400">
                    {formatMoney(item.amount)} تومان
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
