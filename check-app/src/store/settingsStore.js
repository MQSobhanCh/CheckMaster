import { create } from "zustand";
import { persist } from "zustand/middleware";

const useSettingsStore = create(
  persist(
    (set) => ({
      profile: {
        name: "کاربر",
        phone: "",
      },

      darkMode: true,
      notifications: true,

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

      resetSettings: () =>
        set({
          profile: {
            name: "کاربر",
            phone: "",
          },

          darkMode: true,
          notifications: true,
        }),
    }),
    {
      name: "checkmaster-settings",
    },
  ),
);

export default useSettingsStore;