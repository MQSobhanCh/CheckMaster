import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Plus,
  Search,
  Trash2,
  Eye,
  Wallet,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  LayoutDashboard,
} from "lucide-react";

import BottomNav from "../../components/layout/BottomNav";
import useInstallmentStore from "../../store/installmentStore";

function parseDate(dateString) {
  if (!dateString) return null;

  const [year, month, day] = dateString.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function getLateDays(dateString) {
  const dueDate = parseDate(dateString);

  if (!dueDate) return 0;

  dueDate.setHours(0, 0, 0, 0);

  const today = new Date();

  today.setHours(0, 0, 0, 0);

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

export default function InstallmentList() {
  const navigate = useNavigate();

  const installments = useInstallmentStore((state) => state.installments);

  const removeInstallment = useInstallmentStore(
    (state) => state.removeInstallment,
  );

  const [search, setSearch] = useState("");

  const filteredInstallments = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return installments;
    }

    return installments.filter((item) =>
      `${item.personName || ""} ${item.phone || ""} ${item.description || ""}`
        .toLowerCase()
        .includes(value),
    );
  }, [installments, search]);

  const totalAmount = installments.reduce(
    (sum, item) => sum + Number(item.totalAmount || 0),
    0,
  );

  const paidAmount = installments.reduce(
    (sum, item) => sum + Number(item.paidAmount || 0),
    0,
  );

  const remainingAmount = installments.reduce(
    (sum, item) => sum + Number(item.remainingAmount ?? item.totalAmount ?? 0),
    0,
  );

  const completedCount = installments.filter(
    (item) => item.status === "completed",
  ).length;

  const activeCount = installments.filter(
    (item) => item.status === "active",
  ).length;

  const lateCount = installments.reduce((count, item) => {
    const lateItems = (item.schedule || []).filter(
      (installment) =>
        !installment.paid && getLateDays(installment.dueDate) > 0,
    );

    return count + lateItems.length;
  }, 0);

  const handleDelete = (id, name) => {
    const confirmed = window.confirm(
      `آیا از حذف اطلاعات ${name || "این شخص"} مطمئن هستید؟`,
    );

    if (!confirmed) {
      return;
    }

    removeInstallment(id);
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-6 pb-24 text-slate-900 dark:text-white"
    >
      <div className="mx-auto max-w-6xl">
        {/* ================= HEADER ================= */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-xl bg-slate-100 dark:bg-slate-800 p-3 transition hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <ArrowRight size={20} />
            </button>

            <div>
              <h1 className="text-2xl font-bold">اقساط / پول دستی</h1>

              <p className="mt-1 text-sm text-slate-400">
                مدیریت پول‌های دستی و اقساط
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/installments-dashboard")}
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-3 font-bold transition hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <LayoutDashboard size={18} />
              داشبورد
            </button>

            <button
              type="button"
              onClick={() => navigate("/installments/add")}
              className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-bold transition hover:bg-green-500"
            >
              <Plus size={20} />
              ثبت پول دستی
            </button>
          </div>
        </div>

        {/* ================= STATS ================= */}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* Total */}

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-slate-400">کل پول</span>

              <Wallet size={20} className="text-green-400" />
            </div>

            <p className="text-xl font-bold">{formatMoney(totalAmount)}</p>

            <p className="mt-1 text-xs text-slate-500">تومان</p>
          </div>

          {/* Paid */}

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-slate-400">پرداخت شده</span>

              <CheckCircle2 size={20} className="text-blue-400" />
            </div>

            <p className="text-xl font-bold text-blue-400">
              {formatMoney(paidAmount)}
            </p>

            <p className="mt-1 text-xs text-slate-500">تومان</p>
          </div>

          {/* Remaining */}

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-slate-400">باقی‌مانده</span>

              <Clock3 size={20} className="text-orange-400" />
            </div>

            <p className="text-xl font-bold text-orange-400">
              {formatMoney(remainingAmount)}
            </p>

            <p className="mt-1 text-xs text-slate-500">تومان</p>
          </div>

          {/* Late */}

          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-slate-400">دیرکرد</span>

              <AlertTriangle size={20} className="text-red-400" />
            </div>

            <p className="text-xl font-bold text-red-400">
              {lateCount.toLocaleString("fa-IR")}
            </p>

            <p className="mt-1 text-xs text-slate-500">قسط دیرکرد</p>
          </div>

          {/* Status */}

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-slate-400">وضعیت</span>

              <span className="text-xs text-slate-500">
                {installments.length.toLocaleString("fa-IR")} مورد
              </span>
            </div>

            <div className="flex gap-3 text-sm">
              <span className="text-green-400">
                فعال: {activeCount.toLocaleString("fa-IR")}
              </span>

              <span className="text-blue-400">
                کامل: {completedCount.toLocaleString("fa-IR")}
              </span>
            </div>
          </div>
        </div>

        {/* ================= SEARCH ================= */}

        <div className="mb-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="relative">
            <Search
              size={20}
              className="absolute right-3 top-3.5 text-slate-500"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="جستجو بر اساس نام، شماره تماس یا توضیحات..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 py-3 pr-11 pl-4 text-slate-900 dark:text-white outline-none transition placeholder:text-slate-500 focus:border-green-500"
            />
          </div>
        </div>

        {/* ================= EMPTY ================= */}

        {filteredInstallments.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-12 text-center">
            <Wallet size={48} className="mx-auto mb-4 text-slate-400 dark:text-slate-600" />

            <h2 className="text-lg font-bold">
              {search ? "موردی پیدا نشد" : "هنوز پول دستی ثبت نشده"}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {search
                ? "عبارت جستجو را تغییر دهید."
                : "برای شروع، یک مورد جدید ثبت کنید."}
            </p>

            {!search && (
              <button
                type="button"
                onClick={() => navigate("/installments/add")}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-bold hover:bg-green-500"
              >
                <Plus size={18} />
                ثبت اولین مورد
              </button>
            )}
          </div>
        )}

        {/* ================= LIST ================= */}

        <div className="space-y-4">
          {filteredInstallments.map((item) => {
            const schedule = item.schedule || [];

            const lateInstallments = schedule.filter(
              (installment) =>
                !installment.paid && getLateDays(installment.dueDate) > 0,
            );

            const maxLateDays =
              lateInstallments.length > 0
                ? Math.max(
                    ...lateInstallments.map((installment) =>
                      getLateDays(installment.dueDate),
                    ),
                  )
                : 0;

            const paid = Number(item.paidAmount || 0);

            const remaining = Math.max(
              Number(item.remainingAmount ?? item.totalAmount ?? 0),
              0,
            );

            const installmentCount = Number(item.installmentCount || 0);

            const paidInstallments = Number(item.paidInstallments || 0);

            const progress =
              installmentCount > 0
                ? Math.min(
                    Math.round((paidInstallments / installmentCount) * 100),
                    100,
                  )
                : 0;

            return (
              <div
                key={item.id}
                className={`rounded-2xl border p-5 transition ${
                  lateInstallments.length > 0
                    ? "border-red-500/20 bg-white dark:bg-slate-900"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                }`}
              >
                {/* Top */}

                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  {/* Person */}

                  <div className="min-w-[200px]">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl font-bold ${
                          lateInstallments.length > 0
                            ? "bg-red-500/10 text-red-400"
                            : "bg-green-500/10 text-green-400"
                        }`}
                      >
                        {item.personName?.charAt(0)?.toUpperCase() || "؟"}
                      </div>

                      <div>
                        <h2 className="font-bold">
                          {item.personName || "بدون نام"}
                        </h2>

                        {item.phone && (
                          <p className="mt-1 text-xs text-slate-500">
                            {item.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Amounts */}

                  <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-slate-500">مبلغ کل</p>

                      <p className="mt-1 font-bold">
                        {formatMoney(item.totalAmount)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">پرداخت شده</p>

                      <p className="mt-1 font-bold text-blue-400">
                        {formatMoney(paid)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">باقی‌مانده</p>

                      <p className="mt-1 font-bold text-orange-400">
                        {formatMoney(remaining)}
                      </p>
                    </div>
                  </div>

                  {/* Status */}

                  <div>
                    <span
                      className={
                        item.status === "completed"
                          ? "inline-flex rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400"
                          : "inline-flex rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-400"
                      }
                    >
                      {item.status === "completed"
                        ? "تکمیل شده"
                        : "در حال پرداخت"}
                    </span>
                  </div>

                  {/* Late */}

                  {lateInstallments.length > 0 && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2 text-red-400">
                        <AlertTriangle size={16} />

                        <span className="text-xs font-bold">دیرکرد</span>
                      </div>

                      <p className="mt-1 text-xs text-red-300">
                        {lateInstallments.length.toLocaleString("fa-IR")} قسط
                      </p>

                      <p className="mt-1 text-[10px] text-red-400">
                        {maxLateDays.toLocaleString("fa-IR")} روز
                      </p>
                    </div>
                  )}

                  {/* Actions */}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/installments/${item.id}`)}
                      className="flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2.5 text-sm font-bold transition hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      <Eye size={17} />
                      جزئیات
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id, item.personName)}
                      className="rounded-xl bg-red-500/10 p-2.5 text-red-400 transition hover:bg-red-500/20"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Progress */}

                <div className="mt-5 border-t border-slate-200 dark:border-slate-800 pt-4">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="text-slate-500">پیشرفت پرداخت</span>

                    <span className="text-slate-400">
                      {paidInstallments.toLocaleString("fa-IR")}
                      {" / "}
                      {installmentCount.toLocaleString("fa-IR")}
                      {" قسط"}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full transition-all ${
                        item.status === "completed"
                          ? "bg-green-500"
                          : "bg-blue-500"
                      }`}
                      style={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>

                  <div className="mt-2 text-left text-xs text-slate-500">
                    {progress.toLocaleString("fa-IR")}٪
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
