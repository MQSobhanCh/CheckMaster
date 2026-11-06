import { create } from "zustand";
import { persist } from "zustand/middleware";

const defaultProfile = {
  name: "کاربر",
  phone: "",
};

const useSettingsStore = create(
  persist(
    (set) => ({
      profile: { ...defaultProfile },

      darkMode: true,
      notifications: true,

      // how many days before the due date the reminder is shown (0 = only on the due day)
      reminderDays: 1,

      updateProfile: (data) =>
        set((state) => ({
          profile: {
            ...state.profile,
            ...data,
          },
        })),

      toggleTheme: () =>
        set((state) => ({
          darkMode: !state.darkMode,
        })),

      toggleNotifications: () =>
        set((state) => ({
          notifications: !state.notifications,
        })),

      setReminderDays: (days) => set({ reminderDays: Number(days) }),

      resetSettings: () =>
        set({
          profile: { ...defaultProfile },
          darkMode: true,
          notifications: true,
          reminderDays: 1,
        }),
    }),
    {
      name: "checkmaster-settings",
    },
  ),
);

export default useSettingsStore;
