import { create } from "zustand";

const useUIStore = create((set, get) => ({
  toast: { message: "", type: "info", id: 0 },

  showToast: (message, type = "info") =>
    set((state) => ({
      toast: { message, type, id: state.toast.id + 1 },
    })),

  hideToast: () => set((state) => ({ toast: { ...state.toast, message: "" } })),

  confirmState: null,

  confirm: (options = {}) =>
    new Promise((resolve) => {
      const current = get().confirmState;

      if (current?.resolve) current.resolve(false);

      set({
        confirmState: {
          title: options.title || "مطمئنی؟",
          message: options.message || "",
          confirmText: options.confirmText || "بله",
          cancelText: options.cancelText || "انصراف",
          danger: options.danger !== false,
          resolve,
        },
      });
    }),

  resolveConfirm: (result) => {
    const current = get().confirmState;

    set({ confirmState: null });
    current?.resolve?.(result);
  },

  notificationPromptOpen: false,
  setNotificationPromptOpen: (open) => set({ notificationPromptOpen: open }),
}));

export default useUIStore;
