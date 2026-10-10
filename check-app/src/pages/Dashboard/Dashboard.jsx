import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import FloatingButton from "../../components/ui/FloatingButton";
import BottomNav from "../../components/layout/BottomNav";

import {
  FaWallet,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaFileInvoiceDollar,
  FaArrowLeft,
  FaPlus,
  FaChartLine,
} from "react-icons/fa";

import StatCard from "../../components/ui/StatCard";

import useChequeStore from "../../store/chequeStore";

function formatMoney(value) {
  return Number(value || 0).toLocaleString("fa-IR");
}

function formatDate(dateString) {
  if (!dateString) {
    return "تعیین نشده";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "تعیین نشده";
  }

  return new Intl.DateTimeFormat(
    "fa-IR-u-ca-persian",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  ).format(date);
}

function getDaysLate(dateString) {
  if (!dateString) {
    return 0;
  }

  const dueDate = new Date(dateString);

  if (Number.isNaN(dueDate.getTime())) {
    return 0;
  }

  dueDate.setHours(0, 0, 0, 0);

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const difference =
    today.getTime() -
    dueDate.getTime();

  if (difference <= 0) {
    return 0;
  }

  return Math.floor(
    difference /
      (1000 * 60 * 60 * 24)
  );
}

function getStatus(status) {
  switch (status) {
    case "paid":
      return {
        text: "وصول شده",
        className:
          "bg-green-100 text-green-700",
      };

    case "returned":
      return {
        text: "برگشتی",
        className:
          "bg-red-100 text-red-700",
      };

    default:
      return {
        text: "در انتظار",
        className:
          "bg-yellow-100 text-yellow-700",
      };
  }
}

export default function Dashboard() {
  const navigate = useNavigate();

  const cheques = useChequeStore(
    (state) => state.cheques
  );

  const totalAmount = useChequeStore(
    (state) => state.getTotalAmount()
  );

  const pending = useChequeStore(
    (state) => state.getPendingCount()
  );

  const paid = useChequeStore(
    (state) => state.getPaidCount()
  );

  const returned = useChequeStore(
    (state) => state.getReturnedCount()
  );

  const paidAmount = useChequeStore(
    (state) => state.getPaidAmount()
  );

  const pendingAmount = useChequeStore(
    (state) => state.getPendingAmount()
  );

  const returnedAmount =
    useChequeStore(
      (state) =>
        state.getReturnedAmount()
    );

  const overdueCheques = useMemo(() => {
    return cheques.filter(
      (item) =>
        item.status === "pending" &&
        getDaysLate(item.dueDate) > 0
    );
  }, [cheques]);

  const recentCheques = useMemo(() => {
    return [...cheques]
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      )
      .slice(0, 5);
  }, [cheques]);

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-28 pt-6 text-slate-900 dark:text-white"
    >
      <div className="mx-auto max-w-7xl p-5">

        {/* Welcome */}

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            داشبورد مالی
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            خلاصه وضعیت چک‌ها و امور مالی شما
          </p>
        </div>

        {/* Main Stats */}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

          <StatCard
            title="مجموع مبالغ"
            value={`${formatMoney(
              totalAmount
            )} تومان`}
            icon={<FaWallet />}
            gradient="bg-gradient-to-r from-blue-600 to-cyan-500"
          />

          <StatCard
            title="در انتظار"
            value={`${formatMoney(
              pendingAmount
            )} تومان`}
            icon={<FaClock />}
            gradient="bg-gradient-to-r from-orange-500 to-yellow-400"
          />

          <StatCard
            title="وصول شده"
            value={`${formatMoney(
              paidAmount
            )} تومان`}
            icon={<FaCheckCircle />}
            gradient="bg-gradient-to-r from-emerald-500 to-green-400"
          />

          <StatCard
            title="برگشتی"
            value={`${formatMoney(
              returnedAmount
            )} تومان`}
            icon={<FaExclamationTriangle />}
            gradient="bg-gradient-to-r from-rose-500 to-pink-500"
          />

        </div>

        {/* Status Overview */}

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  چک‌های در انتظار
                </p>

                <p className="mt-2 text-3xl font-bold text-orange-500">
                  {pending.toLocaleString(
                    "fa-IR"
                  )}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  فقره چک
                </p>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                <FaClock size={24} />
              </div>

            </div>

          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  چک‌های وصول شده
                </p>

                <p className="mt-2 text-3xl font-bold text-green-600">
                  {paid.toLocaleString(
                    "fa-IR"
                  )}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  فقره چک
                </p>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                <FaCheckCircle size={24} />
              </div>

            </div>

          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  سررسید گذشته
                </p>

                <p className="mt-2 text-3xl font-bold text-red-600">
                  {overdueCheques.length.toLocaleString(
                    "fa-IR"
                  )}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  نیازمند پیگیری
                </p>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <FaExclamationTriangle
                  size={24}
                />
              </div>

            </div>

          </div>

        </div>

        {/* Overdue Alert */}

        {overdueCheques.length > 0 && (
          <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-5">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                  <FaExclamationTriangle />
                </div>

                <div>
                  <h2 className="font-bold text-red-700">
                    توجه به چک‌های سررسید گذشته
                  </h2>

                  <p className="mt-1 text-sm text-red-600">
                    {overdueCheques.length.toLocaleString(
                      "fa-IR"
                    )}{" "}
                    چک نیاز به پیگیری دارد.
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={() =>
                  navigate("/cheques")
                }
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-slate-900 dark:text-white transition hover:bg-red-500"
              >
                مشاهده چک‌ها
              </button>

            </div>

          </div>
        )}

        {/* Quick Actions */}

        <div className="mt-6">

          <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">
            دسترسی سریع
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

            <button
              type="button"
              onClick={() =>
                navigate("/add-cheque")
              }
              className="flex items-center justify-between rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 text-right transition hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-700"
            >

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                  <FaPlus />
                </div>

                <div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    ثبت چک جدید
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    اضافه کردن چک
                  </p>
                </div>

              </div>

              <FaArrowLeft className="text-slate-400" />

            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/cheques")
              }
              className="flex items-center justify-between rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 text-right transition hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-700"
            >

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <FaFileInvoiceDollar />
                </div>

                <div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    مدیریت چک‌ها
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    مشاهده تمام چک‌ها
                  </p>
                </div>

              </div>

              <FaArrowLeft className="text-slate-400" />

            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/reports")
              }
              className="flex items-center justify-between rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 text-right transition hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-700"
            >

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                  <FaChartLine />
                </div>

                <div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    گزارش‌ها
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    بررسی وضعیت مالی
                  </p>
                </div>

              </div>

              <FaArrowLeft className="text-slate-400" />

            </button>

          </div>

        </div>

        {/* Recent Cheques */}

        <div className="mt-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">

          <div className="mb-5 flex items-center justify-between">

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                آخرین چک‌ها
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                آخرین چک‌های ثبت‌شده
              </p>
            </div>

            {cheques.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  navigate("/cheques")
                }
                className="flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-blue-400"
              >
                مشاهده همه
                <FaArrowLeft />
              </button>
            )}

          </div>

          {recentCheques.length === 0 ? (
            <div className="py-10 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400">
                <FaFileInvoiceDollar
                  size={26}
                />
              </div>

              <p className="mt-4 font-bold text-slate-700 dark:text-slate-300">
                هنوز هیچ چکی ثبت نشده است
              </p>

              <p className="mt-1 text-sm text-slate-400">
                اولین چک خود را ثبت کنید.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/add-cheque")
                }
                className="mt-5 rounded-xl bg-white dark:bg-slate-900 px-5 py-3 text-sm font-bold text-slate-900 dark:text-white"
              >
                ثبت اولین چک
              </button>

            </div>
          ) : (
            <div className="space-y-3">

              {recentCheques.map(
                (item) => {
                  const status =
                    getStatus(
                      item.status
                    );

                  const daysLate =
                    item.status ===
                    "pending"
                      ? getDaysLate(
                          item.dueDate
                        )
                      : 0;

                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                    >

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white">
                            {item.receiver ||
                              "بدون گیرنده"}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {item.bank ||
                              "بانک نامشخص"}
                          </p>

                          <p className="mt-2 text-xs text-slate-400">
                            سررسید:{" "}
                            {formatDate(
                              item.dueDate
                            )}
                          </p>
                        </div>

                        <div className="sm:text-left">

                          <p className="font-bold text-blue-400">
                            {formatMoney(
                              item.amount
                            )}{" "}
                            تومان
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-2">

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${status.className}`}
                            >
                              {status.text}
                            </span>

                            {daysLate >
                              0 && (
                              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-600">
                                {daysLate.toLocaleString(
                                  "fa-IR"
                                )}{" "}
                                روز دیرکرد
                              </span>
                            )}

                          </div>

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </div>

        {/* Total Footer */}

        <div className="mt-6 rounded-3xl bg-white dark:bg-slate-900 p-6 text-slate-900 dark:text-white shadow-lg">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-sm text-slate-400">
                خلاصه چک‌ها
              </p>

              <p className="mt-2 text-2xl font-bold">
                {cheques.length.toLocaleString(
                  "fa-IR"
                )}{" "}
                چک ثبت شده
              </p>
            </div>

            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">

              <div>
                <p className="text-xs text-slate-400">
                  کل مبلغ
                </p>

                <p className="mt-1 font-bold">
                  {formatMoney(
                    totalAmount
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  وصول شده
                </p>

                <p className="mt-1 font-bold text-green-400">
                  {formatMoney(
                    paidAmount
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  برگشتی
                </p>

                <p className="mt-1 font-bold text-red-400">
                  {formatMoney(
                    returnedAmount
                  )}
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>

      <FloatingButton />

      <BottomNav />
    </div>
  );
}