import { create } from "zustand";
import { persist } from "zustand/middleware";
import chequeService from "../services/chequeService";
import useSettingsStore from "./settingsStore";
import {
  scheduleChequeReminder,
  cancelNotification,
} from "../services/notificationService";

function notificationsEnabled() {
  return useSettingsStore.getState().notifications;
}

const useChequeStore = create(
  persist(
    (set, get) => ({
      // =========================================
      // State
      // =========================================

      cheques: [],

      // =========================================
      // Initialize
      // =========================================

      initialize: async () => {
        try {
          await chequeService.init?.();

          const data = await chequeService.getAll();

          if (Array.isArray(data)) {
            set({
              cheques: data,
            });
          }
        } catch (error) {
          console.error("Failed to initialize cheques:", error);
        }
      },

      // =========================================
      // Add
      // =========================================

      addCheque: async (cheque) => {
        try {
          const newCheque = {
            id: Date.now(),
            createdAt: new Date().toISOString(),

            status: "pending",

            ...cheque,

            amount: Number(cheque.amount || 0),
          };

          await chequeService.add(newCheque);

          set((state) => ({
            cheques: [...state.cheques, newCheque],
          }));

          if (notificationsEnabled() && newCheque.status === "pending") {
            scheduleChequeReminder(newCheque).catch(() => {});
          }

          return newCheque;
        } catch (error) {
          console.error("Failed to add cheque:", error);

          throw error;
        }
      },

      // =========================================
      // Remove
      // =========================================

      removeCheque: async (id) => {
        try {
          await chequeService.remove(id);

          set((state) => ({
            cheques: state.cheques.filter(
              (item) => Number(item.id) !== Number(id),
            ),
          }));

          cancelNotification("cheque", id).catch(() => {});
        } catch (error) {
          console.error("Failed to remove cheque:", error);

          throw error;
        }
      },

      // =========================================
      // Update
      // =========================================

      updateCheque: async (id, updatedData) => {
        try {
          const normalizedData = {
            ...updatedData,

            ...(updatedData.amount !== undefined && {
              amount: Number(updatedData.amount || 0),
            }),
          };

          await chequeService.update(id, normalizedData);

          set((state) => ({
            cheques: state.cheques.map((item) =>
              Number(item.id) === Number(id)
                ? {
                    ...item,
                    ...normalizedData,
                  }
                : item,
            ),
          }));

          const updated = get().cheques.find(
            (item) => Number(item.id) === Number(id),
          );

          if (updated?.status === "pending" && notificationsEnabled()) {
            scheduleChequeReminder(updated).catch(() => {});
          }
        } catch (error) {
          console.error("Failed to update cheque:", error);

          throw error;
        }
      },

      // =========================================
      // Change Status
      // =========================================

      updateChequeStatus: async (id, status) => {
        const allowedStatuses = ["pending", "paid", "returned"];

        if (!allowedStatuses.includes(status)) {
          console.error("Invalid cheque status:", status);

          return;
        }

        const currentCheque = get().cheques.find(
          (item) => Number(item.id) === Number(id),
        );

        if (!currentCheque) {
          return;
        }

        const updatedData = {
          status,
        };

        // تاریخ تغییر وضعیت
        if (status === "paid") {
          updatedData.paidAt = new Date().toISOString();
        } else {
          updatedData.paidAt = null;
        }

        try {
          await chequeService.update(id, updatedData);

          set((state) => ({
            cheques: state.cheques.map((item) =>
              Number(item.id) === Number(id)
                ? {
                    ...item,
                    ...updatedData,
                  }
                : item,
            ),
          }));

          if (status === "pending" && notificationsEnabled()) {
            scheduleChequeReminder({ ...currentCheque, ...updatedData }).catch(() => {});
          } else {
            cancelNotification("cheque", id).catch(() => {});
          }
        } catch (error) {
          console.error("Failed to update cheque status:", error);

          throw error;
        }
      },

      // =========================================
      // Mark as Paid
      // =========================================

      markAsPaid: async (id) => {
        await get().updateChequeStatus(id, "paid");
      },

      // =========================================
      // Mark as Returned
      // =========================================

      markAsReturned: async (id) => {
        await get().updateChequeStatus(id, "returned");
      },

      // =========================================
      // Mark as Pending
      // =========================================

      markAsPending: async (id) => {
        await get().updateChequeStatus(id, "pending");
      },

      // =========================================
      // Get By ID
      // =========================================

      getChequeById: (id) => {
        return get().cheques.find((item) => Number(item.id) === Number(id));
      },

      // =========================================
      // Total Amount
      // =========================================

      getTotalAmount: () => {
        return get().cheques.reduce(
          (sum, item) => sum + Number(item.amount || 0),
          0,
        );
      },

      // =========================================
      // Paid Amount
      // =========================================

      getPaidAmount: () => {
        return get()
          .cheques.filter((item) => item.status === "paid")
          .reduce((sum, item) => sum + Number(item.amount || 0), 0);
      },

      // =========================================
      // Pending Amount
      // =========================================

      getPendingAmount: () => {
        return get()
          .cheques.filter((item) => item.status === "pending")
          .reduce((sum, item) => sum + Number(item.amount || 0), 0);
      },

      // =========================================
      // Returned Amount
      // =========================================

      getReturnedAmount: () => {
        return get()
          .cheques.filter((item) => item.status === "returned")
          .reduce((sum, item) => sum + Number(item.amount || 0), 0);
      },

      // =========================================
      // Remaining Amount
      // =========================================

      getRemainingAmount: () => {
        return get()
          .cheques.filter((item) => item.status === "pending")
          .reduce((sum, item) => sum + Number(item.amount || 0), 0);
      },

      // =========================================
      // Counts
      // =========================================

      getPendingCount: () => {
        return get().cheques.filter((item) => item.status === "pending").length;
      },

      getPaidCount: () => {
        return get().cheques.filter((item) => item.status === "paid").length;
      },

      getReturnedCount: () => {
        return get().cheques.filter((item) => item.status === "returned")
          .length;
      },

      // =========================================
      // Search
      // =========================================

      searchCheques: (text) => {
        const value = String(text || "")
          .trim()
          .toLowerCase();

        if (!value) {
          return get().cheques;
        }

        return get().cheques.filter(
          (item) =>
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
              .includes(value),
        );
      },

      // =========================================
      // Filter By Status
      // =========================================

      getChequesByStatus: (status) => {
        if (status === "all") {
          return get().cheques;
        }

        return get().cheques.filter((item) => item.status === status);
      },

      // =========================================
      // Due Date
      // =========================================

      getOverdueCheques: () => {
        const today = new Date();

        today.setHours(0, 0, 0, 0);

        return get().cheques.filter((item) => {
          if (item.status !== "pending" || !item.dueDate) {
            return false;
          }

          const dueDate = new Date(item.dueDate);

          if (Number.isNaN(dueDate.getTime())) {
            return false;
          }

          dueDate.setHours(0, 0, 0, 0);

          return dueDate < today;
        });
      },

      // =========================================
      // Overdue Count
      // =========================================

      getOverdueCount: () => {
        return get().getOverdueCheques().length;
      },

      // =========================================
      // Overdue Amount
      // =========================================

      getOverdueAmount: () => {
        return get()
          .getOverdueCheques()
          .reduce((sum, item) => sum + Number(item.amount || 0), 0);
      },

      // =========================================
      // Days Late
      // =========================================

      getDaysLate: (cheque) => {
        if (!cheque || cheque.status !== "pending" || !cheque.dueDate) {
          return 0;
        }

        const today = new Date();

        today.setHours(0, 0, 0, 0);

        const dueDate = new Date(cheque.dueDate);

        if (Number.isNaN(dueDate.getTime())) {
          return 0;
        }

        dueDate.setHours(0, 0, 0, 0);

        const difference = today.getTime() - dueDate.getTime();

        if (difference <= 0) {
          return 0;
        }

        return Math.floor(difference / (1000 * 60 * 60 * 24));
      },
    }),
    {
      name: "checkmaster-storage",

      // فقط اطلاعات اصلی Store ذخیره شود
      partialize: (state) => ({
        cheques: state.cheques,
      }),
    },
  ),
);

export default useChequeStore;
