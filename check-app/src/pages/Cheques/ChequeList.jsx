import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  CheckCircle2,
  Clock3,
  RotateCcw,
  AlertTriangle,
  Wallet,
  TrendingUp,
  Undo2,
  Trash2,
} from "lucide-react";

import BottomNav from "../../components/layout/BottomNav";

import useChequeStore from "../../store/chequeStore";

import ChequeCard from "../../components/cheques/ChequeCard";
import DeleteModal from "../../components/cheques/DeleteModal";
import SearchBar from "../../components/cheques/SearchBar";
import FilterBar from "../../components/cheques/FilterBar";
import EmptyState from "../../components/cheques/EmptyState";

function formatMoney(value) {
  return Number(value || 0).toLocaleString("fa-IR");
}

function formatPersianDate(dateString) {
  if (!dateString) {
    return "تعیین نشده";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "تعیین نشده";
  }

  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
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

  const difference = today.getTime() - dueDate.getTime();

  if (difference <= 0) {
    return 0;
  }

  return Math.floor(difference / (1000 * 60 * 60 * 24));
}

export default function ChequeList() {
  const navigate = useNavigate();

  const cheques = useChequeStore((state) => state.cheques);

  const removeCheque = useChequeStore((state) => state.removeCheque);

  const updateChequeStatus = useChequeStore(
    (state) => state.updateChequeStatus,
  );

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("all");

  const [deleteId, setDeleteId] = useState(null);

  const [updatingId, setUpdatingId] = useState(null);

  const filteredCheques = useMemo(() => {
    let list = [...cheques];

    if (filter !== "all") {
      list = list.filter((item) => item.status === filter);
    }

    if (search.trim()) {
      const value = search.trim().toLowerCase();

      list = list.filter((item) => {
        return (
          String(item.chequeNumber || "")
            .toLowerCase()
            .includes(value) ||
          String(item.bank || "")
            .toLowerCase()
            .includes(value) ||
          String(item.issuer || "")
            .toLowerCase()
            .includes(value) ||
          String(item.receiver || "")
            .toLowerCase()
            .includes(value)
        );
      });
    }

    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [cheques, search, filter]);

  const totalAmount = useMemo(() => {
    return cheques.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [cheques]);

  const paidAmount = useMemo(() => {
    return cheques
      .filter((item) => item.status === "paid")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [cheques]);

  const pendingAmount = useMemo(() => {
    return cheques
      .filter((item) => item.status === "pending")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [cheques]);

  const returnedAmount = useMemo(() => {
    return cheques
      .filter((item) => item.status === "returned")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [cheques]);

  const pendingCount = cheques.filter(
    (item) => item.status === "pending",
  ).length;

  const paidCount = cheques.filter((item) => item.status === "paid").length;

  const returnedCount = cheques.filter(
    (item) => item.status === "returned",
  ).length;

  const overdueCheques = cheques.filter(
    (item) => item.status === "pending" && getDaysLate(item.dueDate) > 0,
  );

  async function handleStatusChange(id, status) {
    try {
      setUpdatingId(id);

      await updateChequeStatus(id, status);
    } catch (error) {
      console.error("Status update failed:", error);
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete() {
    if (!deleteId) {
      return;
    }

    try {
      await removeCheque(deleteId);

      setDeleteId(null);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  }

  function getStatus(status) {
    switch (status) {
      case "paid":
        return {
          text: "وصول شده",
          className: "bg-green-500/10 text-green-400 border border-green-500/30",
        };

      case "returned":
        return {
          text: "برگشتی",
          className: "bg-red-500/10 text-red-400 border border-red-500/30",
        };

      default:
        return {
          text: "در انتظار",
          className: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
        };
    }
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-28 text-slate-900 dark:text-white">
      <div className="mx-auto max-w-6xl p-5">
        {/* Header */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">لیست چک‌ها</h1>

            <p className="mt-2 text-sm text-slate-500">
              مدیریت و پیگیری تمام چک‌ها
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/add-cheque")}
            className="rounded-2xl bg-white dark:bg-slate-900 px-5 py-3 font-bold text-slate-900 dark:text-white shadow-sm transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            + ثبت چک جدید
          </button>
        </div>

        {/* Statistics */}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">مبلغ کل</p>

                <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                  {formatMoney(totalAmount)}
                </p>

                <p className="mt-1 text-xs text-slate-400">تومان</p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Wallet size={23} />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">وصول شده</p>

                <p className="mt-2 text-xl font-bold text-green-600">
                  {formatMoney(paidAmount)}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {paidCount.toLocaleString("fa-IR")} چک
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                <CheckCircle2 size={23} />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">در انتظار</p>

                <p className="mt-2 text-xl font-bold text-yellow-600">
                  {formatMoney(pendingAmount)}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {pendingCount.toLocaleString("fa-IR")} چک
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-600">
                <Clock3 size={23} />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">برگشتی</p>

                <p className="mt-2 text-xl font-bold text-red-600">
                  {formatMoney(returnedAmount)}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {returnedCount.toLocaleString("fa-IR")} چک
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <RotateCcw size={23} />
              </div>
            </div>
          </div>
        </div>

        {/* Overdue */}

        {overdueCheques.length > 0 && (
          <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                <AlertTriangle size={23} />
              </div>

              <div>
                <h2 className="font-bold text-red-700">چک‌های سررسید گذشته</h2>

                <p className="mt-1 text-sm text-red-600">
                  {overdueCheques.length.toLocaleString("fa-IR")} چک دارای
                  سررسید گذشته است.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search */}

        <div className="mb-4">
          <SearchBar value={search} onChange={setSearch} />
        </div>

        {/* Filter */}

        <div className="mb-6">
          <FilterBar value={filter} onChange={setFilter} />
        </div>

        {/* Result */}

        {filteredCheques.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {filteredCheques.map((item) => {
              const status = getStatus(item.status);

              const daysLate =
                item.status === "pending" ? getDaysLate(item.dueDate) : 0;

              const isUpdating = updatingId === item.id;

              return (
                <div
                  key={item.id}
                  className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4"
                >
                  <ChequeCard
                    cheque={item}
                    status={status}
                    onEdit={() => navigate(`/edit-cheque/${item.id}`)}
                    onDelete={() => setDeleteId(item.id)}
                  />

                  {/* Extra Information */}

                  <div className="mt-4 grid gap-3 border-t border-slate-300 dark:border-slate-100 pt-4 sm:grid-cols-3">
                    <div className="rounded-2xl bg-slate-100 dark:bg-slate-800 p-3">
                      <p className="text-xs text-slate-400">مبلغ</p>

                      <p className="mt-1 font-bold text-slate-200 dark:text-slate-800">
                        {formatMoney(item.amount)} تومان
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-100 dark:bg-slate-800 p-3">
                      <p className="text-xs text-slate-400">سررسید</p>

                      <p className="mt-1 font-bold text-slate-200 dark:text-slate-800">
                        {formatPersianDate(item.dueDate)}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-100 dark:bg-slate-800 p-3">
                      <p className="text-xs text-slate-400">وضعیت سررسید</p>

                      {daysLate > 0 ? (
                        <p className="mt-1 font-bold text-red-600">
                          {daysLate.toLocaleString("fa-IR")} روز دیرکرد
                        </p>
                      ) : item.status === "paid" ? (
                        <p className="mt-1 font-bold text-green-600">
                          وصول شده
                        </p>
                      ) : (
                        <p className="mt-1 font-bold text-green-600">
                          سررسید نشده
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status Actions */}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={isUpdating || item.status === "paid"}
                      onClick={() => handleStatusChange(item.id, "paid")}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
                        item.status === "paid"
                          ? "cursor-default bg-green-100 text-green-700"
                          : "bg-green-600 text-slate-900 dark:text-white hover:bg-green-500"
                      }`}
                    >
                      <CheckCircle2 size={16} />
                      وصول شد
                    </button>

                    <button
                      type="button"
                      disabled={isUpdating || item.status === "returned"}
                      onClick={() => handleStatusChange(item.id, "returned")}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
                        item.status === "returned"
                          ? "cursor-default bg-red-100 text-red-700"
                          : "bg-red-600 text-slate-900 dark:text-white hover:bg-red-500"
                      }`}
                    >
                      <RotateCcw size={16} />
                      برگشتی
                    </button>

                    <button
                      type="button"
                      disabled={isUpdating || item.status === "pending"}
                      onClick={() => handleStatusChange(item.id, "pending")}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
                        item.status === "pending"
                          ? "cursor-default bg-yellow-100 text-yellow-700"
                          : "bg-yellow-500 text-slate-900 dark:text-white hover:bg-yellow-400"
                      }`}
                    >
                      <Undo2 size={16} />
                      در انتظار
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteId(item.id)}
                      className="mr-auto flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100"
                    >
                      <Trash2 size={16} />
                      حذف
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <DeleteModal
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />

      <BottomNav />
    </div>
  );
}
