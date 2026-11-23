import { create } from "zustand";
import { persist } from "zustand/middleware";

const defaultProfile = {
  name: "کاربر",
  phone: "",
};

const defaults = {
  darkMode: true,
  notifications: true,
  reminderDays: 1,
  reminderHour: 9,
  notificationPromptDismissed: false,
};

const useSettingsStore = create(
  persist(
    (set) => ({
      profile: { ...defaultProfile },

      ...defaults,

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

      setNotifications: (enabled) => set({ notifications: Boolean(enabled) }),

      setReminderDays: (days) => set({ reminderDays: Number(days) }),

      setReminderHour: (hour) => {
        const value = Number(hour);

        if (Number.isInteger(value) && value >= 0 && value <= 23) {
          set({ reminderHour: value });
        }
      },

      dismissNotificationPrompt: () => set({ notificationPromptDismissed: true }),

      resetSettings: () =>
        set({
          profile: { ...defaultProfile },
          ...defaults,
        }),
    }),
    {
      name: "checkmaster-settings",

      version: 1,

      migrate: (persisted) => ({ ...defaults, ...(persisted || {}) }),
    },
  ),
);

export default useSettingsStore;
