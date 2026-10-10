import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  User,
  Phone,
  Wallet,
  CalendarDays,
  FileText,
  CheckCircle2,
  Clock3,
  RotateCcw,
  AlertTriangle,
  Pencil,
} from "lucide-react";

import useInstallmentStore from "../../store/installmentStore";

function parseDate(dateString) {
  if (!dateString) return null;

  const [year, month, day] = dateString.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function formatDate(dateString) {
  if (!dateString) {
    return "تعیین نشده";
  }

  const date = parseDate(dateString);

  if (!date) {
    return "تعیین نشده";
  }

  return date.toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getToday() {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return today;
}

function getLateDays(dateString) {
  const dueDate = parseDate(dateString);

  if (!dueDate) {
    return 0;
  }

  dueDate.setHours(0, 0, 0, 0);

  const today = getToday();

  if (dueDate >= today) {
    return 0;
  }

  return Math.floor(
    (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
  );
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString("fa-IR");
}

export default function InstallmentDetails() {
  const navigate = useNavigate();

  const { id } = useParams();

  const installment = useInstallmentStore((state) =>
    state.getInstallmentById(id),
  );

  const payInstallment = useInstallmentStore((state) => state.payInstallment);

  const undoInstallmentPayment = useInstallmentStore(
    (state) => state.undoInstallmentPayment,
  );

  /* =========================
     اطلاعات پیدا نشد
  ========================= */

  if (!installment) {
    return (
      <div
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 text-slate-900 dark:text-white"
      >
        <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-2xl">
            ⚠️
          </div>

          <h1 className="text-xl font-bold">اطلاعات پیدا نشد</h1>

          <p className="mt-2 text-sm text-slate-500">
            این مورد وجود ندارد یا حذف شده است.
          </p>

          <button
            type="button"
            onClick={() => navigate("/installments")}
            className="mt-6 rounded-xl bg-green-600 px-5 py-3 font-bold transition hover:bg-green-500"
          >
            بازگشت به لیست
          </button>
        </div>
      </div>
    );
  }

  /* =========================
     اطلاعات اصلی
  ========================= */

  const schedule = Array.isArray(installment.schedule)
    ? installment.schedule
    : [];

  const totalAmount = Number(installment.totalAmount || 0);

  const paidInstallments = Number(installment.paidInstallments || 0);

  /*
   * مبلغ واقعی پرداخت شده
   * از خود schedule محاسبه می‌شود
   * تا با مبالغ متفاوت اقساط هم درست باشد.
   */

  const paidAmount = schedule
    .filter((item) => item.paid)
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const remainingAmount = Math.max(totalAmount - paidAmount, 0);

  const progress =
    totalAmount > 0
      ? Math.min(Math.round((paidAmount / totalAmount) * 100), 100)
      : 0;

  /* =========================
     دیرکرد
  ========================= */

  const lateInstallments = schedule.filter(
    (item) => !item.paid && getLateDays(item.dueDate) > 0,
  );

  const totalLateDays = lateInstallments.reduce(
    (sum, item) => sum + getLateDays(item.dueDate),
    0,
  );

  /* =========================
     قسط بعدی
  ========================= */

  const nextInstallment = schedule.find((item) => !item.paid);

  /* =========================
     پرداخت
  ========================= */

  const handlePay = (number) => {
    payInstallment(installment.id, number);
  };

  /* =========================
     برگشت پرداخت
  ========================= */

  const handleUndo = (number) => {
    const confirmed = window.confirm(
      "آیا می‌خواهید پرداخت این قسط را برگشت بزنید؟",
    );

    if (!confirmed) {
      return;
    }

    undoInstallmentPayment(installment.id, number);
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-6 pb-12 text-slate-900 dark:text-white"
    >
      <div className="mx-auto max-w-5xl">
        {/* ==================================
            HEADER
        ================================== */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/installments")}
              className="rounded-xl bg-slate-100 dark:bg-slate-800 p-3 transition hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <ArrowRight size={20} />
            </button>

            <div>
              <h1 className="text-2xl font-bold">جزئیات اقساط</h1>

              <p className="mt-1 text-sm text-slate-500">
                {installment.personName || "بدون نام"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {installment.status === "completed" ? (
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-green-500/10 px-4 py-2 text-sm font-bold text-green-400">
                <CheckCircle2 size={17} />
                تکمیل شده
              </span>
            ) : (
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-orange-500/10 px-4 py-2 text-sm font-bold text-orange-400">
                <Clock3 size={17} />
                در حال پرداخت
              </span>
            )}

            <button
              type="button"
              onClick={() => navigate(`/installments/edit/${installment.id}`)}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2.5 text-sm font-bold transition hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <Pencil size={16} />
              ویرایش
            </button>
          </div>
        </div>

        {/* ==================================
            PERSON
        ================================== */}

        <div className="mb-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-green-500/10 text-green-400">
              <User size={30} />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                {installment.personName || "بدون نام"}
              </h2>

              {installment.phone && (
                <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                  <Phone size={15} />

                  <span dir="ltr">{installment.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ==================================
            FINANCIAL
        ================================== */}

        <div className="mb-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
              <Wallet size={21} />
            </div>

            <div>
              <h2 className="font-bold">وضعیت مالی</h2>

              <p className="mt-1 text-xs text-slate-500">خلاصه وضعیت پرداخت</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* کل */}

            <div className="rounded-2xl bg-blue-500/5 p-5">
              <p className="text-sm text-slate-400">مبلغ کل</p>

              <p className="mt-2 text-xl font-bold">
                {formatMoney(totalAmount)}
              </p>

              <p className="mt-1 text-xs text-slate-500">تومان</p>
            </div>

            {/* پرداخت شده */}

            <div className="rounded-2xl bg-green-500/5 p-5">
              <p className="text-sm text-slate-400">پرداخت شده</p>

              <p className="mt-2 text-xl font-bold text-green-400">
                {formatMoney(paidAmount)}
              </p>

              <p className="mt-1 text-xs text-slate-500">تومان</p>
            </div>

            {/* باقی مانده */}

            <div className="rounded-2xl bg-orange-500/5 p-5">
              <p className="text-sm text-slate-400">باقی‌مانده</p>

              <p className="mt-2 text-xl font-bold text-orange-400">
                {formatMoney(remainingAmount)}
              </p>

              <p className="mt-1 text-xs text-slate-500">تومان</p>
            </div>
          </div>

          {/* Progress */}

          <div className="mt-5 rounded-2xl bg-slate-800/40 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-slate-400">میزان پرداخت</span>

              <span className="font-bold text-green-400">
                {progress.toLocaleString("fa-IR")}٪
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-l from-green-500 to-emerald-400 transition-all duration-500"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* ==================================
            LATE SUMMARY
        ================================== */}

        {lateInstallments.length > 0 && (
          <div className="mb-5 rounded-3xl border border-red-500/20 bg-red-500/5 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
                <AlertTriangle size={23} />
              </div>

              <div>
                <h2 className="font-bold text-red-400">اقساط دارای دیرکرد</h2>

                <p className="mt-2 text-sm text-slate-400">
                  {lateInstallments.length.toLocaleString("fa-IR")} قسط پرداخت
                  نشده و سررسید آن گذشته است.
                </p>

                <p className="mt-1 text-xs text-red-400">
                  مجموع روزهای دیرکرد: {totalLateDays.toLocaleString("fa-IR")}{" "}
                  روز
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==================================
            INSTALLMENTS
        ================================== */}

        <div className="mb-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400">
                <CalendarDays size={21} />
              </div>

              <div>
                <h2 className="font-bold">برنامه اقساط</h2>

                <p className="mt-1 text-xs text-slate-500">
                  تاریخ و وضعیت تمام اقساط
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs text-slate-400">
              {paidInstallments.toLocaleString("fa-IR")}

              {" از "}

              {Number(installment.installmentCount || 0).toLocaleString(
                "fa-IR",
              )}

              {" پرداخت شده"}
            </div>
          </div>

          {/* Schedule */}

          {schedule.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-sm text-slate-500">
              برنامه‌ای برای اقساط ثبت نشده است.
            </div>
          ) : (
            <div className="space-y-3">
              {schedule.map((item) => {
                const lateDays = !item.paid ? getLateDays(item.dueDate) : 0;

                const isNext = nextInstallment?.number === item.number;

                return (
                  <div
                    key={item.number}
                    className={`rounded-2xl border p-4 transition ${
                      item.paid
                        ? "border-green-500/20 bg-green-500/5"
                        : lateDays > 0
                          ? "border-red-500/20 bg-red-500/5"
                          : isNext
                            ? "border-orange-500/20 bg-orange-500/5"
                            : "border-slate-200 dark:border-slate-800 bg-slate-800/30"
                    }`}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      {/* Number */}

                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold ${
                            item.paid
                              ? "bg-green-500/10 text-green-400"
                              : lateDays > 0
                                ? "bg-red-500/10 text-red-400"
                                : "bg-orange-500/10 text-orange-400"
                          }`}
                        >
                          {Number(item.number).toLocaleString("fa-IR")}
                        </div>

                        <div>
                          <p className="font-bold">
                            قسط {Number(item.number).toLocaleString("fa-IR")}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {formatMoney(item.amount)} تومان
                          </p>
                        </div>
                      </div>

                      {/* Date */}

                      <div>
                        <p className="text-xs text-slate-500">تاریخ سررسید</p>

                        <div className="mt-1 flex items-center gap-2">
                          <CalendarDays size={15} className="text-slate-500" />

                          <p className="font-bold">
                            {formatDate(item.dueDate)}
                          </p>
                        </div>
                      </div>

                      {/* Status */}

                      <div>
                        {item.paid ? (
                          <span className="inline-flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-2 text-xs font-bold text-green-400">
                            <CheckCircle2 size={15} />
                            پرداخت شده
                          </span>
                        ) : lateDays > 0 ? (
                          <span className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-2 text-xs font-bold text-red-400">
                            <AlertTriangle size={15} />
                            {lateDays.toLocaleString("fa-IR")} روز دیرکرد
                          </span>
                        ) : isNext ? (
                          <span className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-3 py-2 text-xs font-bold text-orange-400">
                            <Clock3 size={15} />
                            قسط بعدی
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-400">
                            در انتظار
                          </span>
                        )}
                      </div>

                      {/* Action */}

                      <div className="lg:min-w-[145px]">
                        {item.paid ? (
                          <button
                            type="button"
                            onClick={() => handleUndo(item.number)}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                          >
                            <RotateCcw size={16} />
                            برگشت پرداخت
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={!isNext}
                            onClick={() => handlePay(item.number)}
                            className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
                              isNext
                                ? "bg-green-600 text-slate-900 dark:text-white hover:bg-green-500"
                                : "cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600"
                            }`}
                          >
                            <CheckCircle2 size={17} />
                            پرداخت قسط
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Paid At */}

                    {item.paid && item.paidAt && (
                      <div className="mt-3 border-t border-green-500/10 pt-3 text-xs text-green-400">
                        تاریخ پرداخت:{" "}
                        {new Date(item.paidAt).toLocaleDateString("fa-IR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ==================================
            DATES
        ================================== */}

        <div className="mb-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-800/40 p-4">
              <p className="text-xs text-slate-500">تاریخ شروع</p>

              <p className="mt-2 font-bold">
                {formatDate(installment.startDate)}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-800/40 p-4">
              <p className="text-xs text-slate-500">اولین سررسید</p>

              <p className="mt-2 font-bold">
                {formatDate(installment.firstDueDate)}
              </p>
            </div>
          </div>
        </div>

        {/* ==================================
            DESCRIPTION
        ================================== */}

        {installment.description && (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
            <div className="mb-4 flex items-center gap-3">
              <FileText size={20} className="text-orange-400" />

              <h2 className="font-bold">توضیحات</h2>
            </div>

            <p className="rounded-2xl bg-slate-800/40 p-4 text-sm leading-7 text-slate-700 dark:text-slate-300">
              {installment.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
