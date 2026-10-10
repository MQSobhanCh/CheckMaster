import { create } from "zustand";
import { persist } from "zustand/middleware";
import useSettingsStore from "./settingsStore";
import {
  scheduleInstallmentReminder,
  cancelNotification,
} from "../services/notificationService";

function notificationsEnabled() {
  return useSettingsStore.getState().notifications;
}

/* =========================
   تاریخ
========================= */

function parseDate(dateString) {
  if (!dateString) return null;

  const [year, month, day] = dateString.split("-").map(Number);

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/* =========================
   اضافه کردن ماه
========================= */

function addMonths(dateString, months) {
  const date = parseDate(dateString);

  if (!date) return "";

  const originalDay = date.getDate();

  date.setDate(1);
  date.setMonth(date.getMonth() + Number(months || 0));

  const lastDay = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
  ).getDate();

  date.setDate(Math.min(originalDay, lastDay));

  return formatDate(date);
}

/* =========================
   ساخت برنامه اقساط
========================= */

function createSchedule({
  totalAmount,
  installmentCount,
  installmentAmount,
  firstDueDate,
}) {
  const total = Number(totalAmount || 0);
  const count = Number(installmentCount || 0);
  const customAmount = Number(installmentAmount || 0);

  if (total <= 0 || count <= 0) {
    return [];
  }

  const baseAmount =
    customAmount > 0 ? customAmount : Math.floor(total / count);

  const remainder = customAmount > 0 ? 0 : total - baseAmount * count;

  return Array.from({ length: count }, (_, index) => {
    const isLast = index === count - 1;

    return {
      number: index + 1,

      amount: isLast ? baseAmount + remainder : baseAmount,

      dueDate: firstDueDate ? addMonths(firstDueDate, index) : "",

      paid: false,

      paidAt: null,
    };
  });
}

/* =========================
   Store
========================= */

const useInstallmentStore = create(
  persist(
    (set, get) => ({
      installments: [],

      /* =========================
         افزودن
      ========================= */

      addInstallment: (data) => {
        const personName = data.personName?.trim() || "";

        const phone = data.phone?.trim() || "";

        const description = data.description?.trim() || "";

        const totalAmount = Number(data.totalAmount || 0);

        const installmentCount = Number(data.installmentCount || 0);

        const installmentAmount = Number(data.installmentAmount || 0);

        if (!personName || totalAmount <= 0 || installmentCount <= 0) {
          return null;
        }

        const schedule = createSchedule({
          totalAmount,
          installmentCount,
          installmentAmount,
          firstDueDate: data.firstDueDate || "",
        });

        const newInstallment = {
          id: Date.now().toString(),

          personName,

          phone,

          totalAmount,

          installmentCount,

          installmentAmount:
            installmentAmount > 0
              ? installmentAmount
              : Math.floor(totalAmount / installmentCount),

          startDate: data.startDate || "",

          firstDueDate: data.firstDueDate || "",

          description,

          schedule,

          paidInstallments: 0,

          paidAmount: 0,

          remainingAmount: totalAmount,

          status: "active",

          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          installments: [...state.installments, newInstallment],
        }));

        if (notificationsEnabled()) {
          scheduleInstallmentReminder(newInstallment).catch(() => {});
        }

        return newInstallment;
      },

      /* =========================
         دریافت یک مورد
      ========================= */

      getInstallmentById: (id) => {
        return get().installments.find(
          (item) => String(item.id) === String(id),
        );
      },

      /* =========================
         پرداخت قسط
      ========================= */

      payInstallment: (id, installmentNumber) => {
        set((state) => ({
          installments: state.installments.map((item) => {
            if (String(item.id) !== String(id)) {
              return item;
            }

            const currentPaid = Number(item.paidInstallments || 0);

            /*
                فقط قسط بعدی قابل پرداخت است
              */

            if (Number(installmentNumber) !== currentPaid + 1) {
              return item;
            }

            const updatedSchedule = (item.schedule || []).map((installment) => {
              if (installment.number === Number(installmentNumber)) {
                return {
                  ...installment,

                  paid: true,

                  paidAt: new Date().toISOString(),
                };
              }

              return installment;
            });

            const paidAmount = updatedSchedule
              .filter((installment) => installment.paid)
              .reduce(
                (sum, installment) => sum + Number(installment.amount || 0),
                0,
              );

            const newPaidCount = currentPaid + 1;

            const totalAmount = Number(item.totalAmount || 0);

            const remainingAmount = Math.max(totalAmount - paidAmount, 0);

            const completed =
              newPaidCount >= Number(item.installmentCount || 0) &&
              Number(item.installmentCount || 0) > 0;

            return {
              ...item,

              schedule: updatedSchedule,

              paidInstallments: newPaidCount,

              paidAmount,

              remainingAmount,

              status: completed ? "completed" : "active",
            };
          }),
        }));

        if (notificationsEnabled()) {
          const updated = get().getInstallmentById(id);
          if (updated) scheduleInstallmentReminder(updated).catch(() => {});
        }
      },

      /* =========================
         برگشت پرداخت
      ========================= */

      undoInstallmentPayment: (id, installmentNumber) => {
        set((state) => ({
          installments: state.installments.map((item) => {
            if (String(item.id) !== String(id)) {
              return item;
            }

            const number = Number(installmentNumber);

            const currentPaid = Number(item.paidInstallments || 0);

            if (number <= 0 || number > currentPaid) {
              return item;
            }

            const updatedSchedule = (item.schedule || []).map((installment) => {
              if (installment.number === number) {
                return {
                  ...installment,

                  paid: false,

                  paidAt: null,
                };
              }

              return installment;
            });

            const paidAmount = updatedSchedule
              .filter((installment) => installment.paid)
              .reduce(
                (sum, installment) => sum + Number(installment.amount || 0),
                0,
              );

            const newPaidCount = updatedSchedule.filter(
              (installment) => installment.paid,
            ).length;

            const totalAmount = Number(item.totalAmount || 0);

            const remainingAmount = Math.max(totalAmount - paidAmount, 0);

            return {
              ...item,

              schedule: updatedSchedule,

              paidInstallments: newPaidCount,

              paidAmount,

              remainingAmount,

              status:
                newPaidCount >= Number(item.installmentCount || 0) &&
                Number(item.installmentCount || 0) > 0
                  ? "completed"
                  : "active",
            };
          }),
        }));

        if (notificationsEnabled()) {
          const updated = get().getInstallmentById(id);
          if (updated) scheduleInstallmentReminder(updated).catch(() => {});
        }
      },

      /* =========================
         ویرایش
      ========================= */

      updateInstallment: (id, data) => {
        set((state) => ({
          installments: state.installments.map((item) =>
            String(item.id) === String(id)
              ? {
                  ...item,
                  ...data,
                }
              : item,
          ),
        }));
      },

      /* =========================
         حذف
      ========================= */

      removeInstallment: (id) => {
        set((state) => ({
          installments: state.installments.filter(
            (item) => String(item.id) !== String(id),
          ),
        }));

        cancelNotification("installment", id).catch(() => {});
      },

      /* =========================
         حذف همه
      ========================= */

      clearInstallments: () => {
        set({
          installments: [],
        });
      },

      /* =========================
         آمار
      ========================= */

      getTotalAmount: () => {
        return get().installments.reduce(
          (sum, item) => sum + Number(item.totalAmount || 0),
          0,
        );
      },

      getPaidAmount: () => {
        return get().installments.reduce(
          (sum, item) => sum + Number(item.paidAmount || 0),
          0,
        );
      },

      getRemainingAmount: () => {
        return get().installments.reduce(
          (sum, item) =>
            sum + Number(item.remainingAmount ?? item.totalAmount ?? 0),
          0,
        );
      },

      getActiveCount: () => {
        return get().installments.filter((item) => item.status === "active")
          .length;
      },

      getCompletedCount: () => {
        return get().installments.filter((item) => item.status === "completed")
          .length;
      },

      /* =========================
         جستجو
      ========================= */

      searchInstallments: (text) => {
        const value = text?.trim().toLowerCase() || "";

        if (!value) {
          return get().installments;
        }

        return get().installments.filter(
          (item) =>
            item.personName?.toLowerCase().includes(value) ||
            item.phone?.toLowerCase().includes(value) ||
            item.description?.toLowerCase().includes(value),
        );
      },

      /* =========================
         اقساط دارای دیرکرد
      ========================= */

      getLateInstallments: () => {
        const today = new Date();

        today.setHours(0, 0, 0, 0);

        const result = [];

        get().installments.forEach((item) => {
          const lateItems = (item.schedule || []).filter((installment) => {
            if (installment.paid || !installment.dueDate) {
              return false;
            }

            const [year, month, day] = installment.dueDate
              .split("-")
              .map(Number);

            const dueDate = new Date(year, month - 1, day);

            dueDate.setHours(0, 0, 0, 0);

            return dueDate < today;
          });

          if (lateItems.length > 0) {
            result.push({
              ...item,

              lateInstallments: lateItems,
            });
          }
        });

        return result;
      },

      /* =========================
         تعداد دیرکرد
      ========================= */

      getLateCount: () => {
        return get().installments.reduce((count, item) => {
          return (
            count +
            (item.schedule || []).filter((installment) => {
              if (installment.paid || !installment.dueDate) {
                return false;
              }

              const [year, month, day] = installment.dueDate
                .split("-")
                .map(Number);

              const dueDate = new Date(year, month - 1, day);

              const today = new Date();

              dueDate.setHours(0, 0, 0, 0);

              today.setHours(0, 0, 0, 0);

              return dueDate < today;
            }).length
          );
        }, 0);
      },
    }),
    {
      name: "checkmaster-installments",
    },
  ),
);

export default useInstallmentStore;
