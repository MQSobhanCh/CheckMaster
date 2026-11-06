import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  User,
  Phone,
  Bell,
  Moon,
  Sun,
  Save,
  Trash2,
  RotateCcw,
  ShieldCheck,
  Database,
  Info,
  CheckCircle2,
  Download,
  Upload,
  AlertTriangle,
} from "lucide-react";

import useSettingsStore from "../../store/settingsStore";
import useChequeStore from "../../store/chequeStore";
import useInstallmentStore from "../../store/installmentStore";
import {
  syncAllReminders,
  cancelAllReminders,
  requestNotificationPermission,
  sendTestNotification,
  isNotificationSupported,
} from "../../services/notificationService";
import {
  buildBackup,
  exportBackup,
  parseBackup,
} from "../../services/backupService";
import { APP_VERSION } from "../../config/app";

export default function Settings() {
  const navigate = useNavigate();

  const profile = useSettingsStore((state) => state.profile);
  const darkMode = useSettingsStore((state) => state.darkMode);
  const notifications = useSettingsStore((state) => state.notifications);

  const updateProfile = useSettingsStore((state) => state.updateProfile);

  const toggleTheme = useSettingsStore((state) => state.toggleTheme);

  const toggleNotifications = useSettingsStore(
    (state) => state.toggleNotifications,
  );

  const resetSettings = useSettingsStore((state) => state.resetSettings);

  const cheques = useChequeStore((state) => state.cheques);
  const installments = useInstallmentStore((state) => state.installments);

  const reminderDays = useSettingsStore((state) => state.reminderDays);
  const setReminderDays = useSettingsStore((state) => state.setReminderDays);

  const clearCheques = useChequeStore((state) => state.clearCheques);
  const restoreCheques = useChequeStore((state) => state.restoreCheques);
  const restoreInstallments = useInstallmentStore(
    (state) => state.restoreInstallments,
  );

  const handleToggleNotifications = async () => {
    // turning OFF
    if (notifications) {
      toggleNotifications();
      cancelAllReminders(cheques, installments).catch(() => {});
      return;
    }

    // turning ON — on the phone the system permission must be granted first
    if (isNotificationSupported()) {
      const granted = await requestNotificationPermission();

      if (!granted) {
        alert(
          "مجوز اعلان داده نشد.\nبرای فعال‌سازی: تنظیمات گوشی ← برنامه‌ها ← CheckMaster ← اعلان‌ها را روشن کن.",
        );
        return;
      }
    }

    toggleNotifications();
    syncAllReminders(cheques, installments).catch(() => {});
  };

  const handleReminderDaysChange = (event) => {
    setReminderDays(Number(event.target.value));
    syncAllReminders(cheques, installments).catch(() => {});
  };

  const handleTestNotification = async () => {
    if (!isNotificationSupported()) {
      alert("اعلان آزمایشی فقط روی اپ اندروید کار می‌کند.");
      return;
    }

    const sent = await sendTestNotification();

    alert(
      sent
        ? "تا ۵ ثانیه‌ی دیگر یک اعلان آزمایشی می‌آید.\nبرنامه را ببند یا به پس‌زمینه ببر تا اعلان را ببینی."
        : "مجوز اعلان داده نشد. آن را از تنظیمات گوشی روشن کن.",
    );
  };

  const clearInstallments = useInstallmentStore(
    (state) => state.clearInstallments,
  );

  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);

  const [saved, setSaved] = useState(false);

  const [showDelete, setShowDelete] = useState(false);

  const [showBackup, setShowBackup] = useState(false);

  useEffect(() => {
    setName(profile.name);
    setPhone(profile.phone);
  }, [profile]);

  const handleSaveProfile = () => {
    updateProfile({
      name: name.trim() || "کاربر",
      phone: phone.trim(),
    });

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const handleBackup = async () => {
    try {
      await exportBackup(buildBackup({ profile, cheques, installments }));
      setShowBackup(false);
    } catch (error) {
      // closing the share sheet without choosing anything is not an error
      if (!/cancel/i.test(String(error?.message || error))) {
        console.error("Backup failed:", error);
        alert("ساخت فایل پشتیبان ناموفق بود.");
      }
    }
  };

  const handleRestore = (event) => {
    const input = event.target;
    const file = input.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = parseBackup(e.target.result);

        const confirmed = window.confirm(
          `این فایل شامل ${data.cheques.length} چک و ${data.installments.length} پرونده اقساط است.\nبا بازیابی، اطلاعات فعلی جایگزین می‌شود. ادامه می‌دهی؟`,
        );

        if (!confirmed) return;

        restoreCheques(data.cheques);
        restoreInstallments(data.installments);

        if (data.profile && typeof data.profile === "object") {
          updateProfile({
            name: data.profile.name || "کاربر",
            phone: data.profile.phone || "",
          });
        }

        if (notifications) {
          syncAllReminders(data.cheques, data.installments).catch(() => {});
        }

        alert("اطلاعات با موفقیت بازیابی شد.");
      } catch {
        alert("فایل انتخاب‌شده یک پشتیبان معتبر CheckMaster نیست.");
      } finally {
        input.value = "";
      }
    };

    reader.readAsText(file);
  };

  const handleDeleteAll = () => {
    cancelAllReminders(cheques, installments).catch(() => {});

    clearCheques();
    clearInstallments();
    resetSettings();

    setShowDelete(false);

    alert("همه‌ی اطلاعات پاک شد.");
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-6 pb-24 text-slate-900 dark:text-white"
    >
      <div className="mx-auto max-w-4xl">
        {/* HEADER */}

        <div className="mb-8 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-xl bg-slate-100 dark:bg-slate-800 p-3 transition hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <ArrowRight size={20} />
          </button>

          <div>
            <h1 className="text-2xl font-bold">تنظیمات</h1>

            <p className="mt-1 text-sm text-slate-400">
              مدیریت اطلاعات و تنظیمات برنامه
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* PROFILE */}

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10 text-green-400">
                <User size={23} />
              </div>

              <div>
                <h2 className="font-bold">اطلاعات کاربر</h2>

                <p className="mt-1 text-xs text-slate-500">
                  مشخصات نمایش داده شده داخل برنامه
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-slate-400">نام</label>

                <div className="relative">
                  <User
                    size={18}
                    className="absolute right-3 top-3.5 text-slate-500"
                  />

                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="نام شما"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 py-3 pr-10 pl-3 outline-none transition focus:border-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-400">
                  شماره تماس
                </label>

                <div className="relative">
                  <Phone
                    size={18}
                    className="absolute right-3 top-3.5 text-slate-500"
                  />

                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912..."
                    dir="ltr"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 py-3 pr-10 pl-3 text-right outline-none transition focus:border-green-500"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              className="mt-5 flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-bold transition hover:bg-green-500"
            >
              <Save size={18} />
              ذخیره اطلاعات
            </button>

            {saved && (
              <div className="mt-4 flex items-center gap-2 text-sm text-green-400">
                <CheckCircle2 size={18} />
                اطلاعات با موفقیت ذخیره شد.
              </div>
            )}
          </div>

          {/* APP SETTINGS */}

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                <ShieldCheck size={23} />
              </div>

              <div>
                <h2 className="font-bold">تنظیمات برنامه</h2>

                <p className="mt-1 text-xs text-slate-500">
                  شخصی‌سازی ظاهر و اعلان‌ها
                </p>
              </div>
            </div>

            {/* THEME */}

            <div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-800/40 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-purple-500/10 p-3 text-purple-400">
                  {darkMode ? <Moon size={20} /> : <Sun size={20} />}
                </div>

                <div>
                  <h3 className="font-medium">حالت تاریک</h3>

                  <p className="mt-1 text-xs text-slate-500">
                    تغییر ظاهر برنامه
                  </p>
                </div>
              </div>

              <button
                onClick={toggleTheme}
                className={`relative h-8 w-14 rounded-full transition ${
                  darkMode ? "bg-green-600" : "bg-slate-300 dark:bg-slate-600"
                }`}
              >
                <div
                  className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${
                    darkMode ? "right-1" : "left-1"
                  }`}
                />
              </button>
            </div>

            {/* NOTIFICATION */}

            <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-800/40 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-orange-500/10 p-3 text-orange-400">
                  <Bell size={20} />
                </div>

                <div>
                  <h3 className="font-medium">اعلان‌ها</h3>

                  <p className="mt-1 text-xs text-slate-500">
                    یادآوری سررسید اقساط
                  </p>
                </div>
              </div>

              <button
                onClick={handleToggleNotifications}
                className={`relative h-8 w-14 rounded-full transition ${
                  notifications ? "bg-green-600" : "bg-slate-300 dark:bg-slate-600"
                }`}
              >
                <div
                  className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${
                    notifications ? "right-1" : "left-1"
                  }`}
                />
              </button>
            </div>

            {notifications && (
              <div className="mt-3 space-y-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-medium">زمان یادآوری</h3>

                    <p className="mt-1 text-xs text-slate-500">
                      چند روز قبل از سررسید اعلان بیاید
                    </p>
                  </div>

                  <select
                    value={reminderDays}
                    onChange={handleReminderDaysChange}
                    className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm outline-none focus:border-green-500"
                  >
                    <option value={0}>فقط روز سررسید</option>
                    <option value={1}>۱ روز قبل</option>
                    <option value={3}>۳ روز قبل</option>
                    <option value={7}>۷ روز قبل</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleTestNotification}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-3 text-sm font-bold text-orange-400 transition hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <Bell size={18} />
                  ارسال اعلان آزمایشی
                </button>

                {!isNotificationSupported() && (
                  <p className="text-xs text-orange-400">
                    اعلان‌ها فقط در نسخه‌ی موبایل (اپ اندروید) کار می‌کنند.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* BACKUP */}

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
                <Database size={23} />
              </div>

              <div>
                <h2 className="font-bold">پشتیبان‌گیری</h2>

                <p className="mt-1 text-xs text-slate-500">
                  ذخیره اطلاعات روی فایل
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <button
                onClick={() => setShowBackup(true)}
                className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 font-bold transition hover:bg-blue-500"
              >
                <Download size={20} />
                ایجاد بکاپ
              </button>

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 py-4 font-bold transition hover:bg-slate-200 dark:hover:bg-slate-700">
                <Upload size={20} />
                بازیابی بکاپ
                <input
                  type="file"
                  accept=".json,application/json,text/plain"
                  onChange={handleRestore}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* DANGER */}

          <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
                <AlertTriangle size={23} />
              </div>

              <div>
                <h2 className="font-bold text-red-400">بخش خطر</h2>

                <p className="mt-1 text-xs text-slate-500">
                  عملیات غیرقابل بازگشت
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowDelete(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 py-4 font-bold transition hover:bg-red-500"
            >
              <Trash2 size={20} />
              حذف همه‌ی اطلاعات
            </button>
          </div>

          {/* ABOUT */}

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
            <div className="mb-4 flex items-center gap-3">
              <Info size={22} className="text-green-400" />

              <h2 className="font-bold">درباره برنامه</h2>
            </div>

            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex justify-between">
                <span>نام برنامه</span>

                <span className="text-slate-900 dark:text-white">CheckMaster</span>
              </div>

              <div className="flex justify-between">
                <span>نسخه</span>

                <span className="text-slate-900 dark:text-white">{APP_VERSION}</span>
              </div>

              <div className="flex justify-between">
                <span>تعداد چک‌ها</span>

                <span className="text-slate-900 dark:text-white">{cheques.length}</span>
              </div>

              <div className="flex justify-between">
                <span>تعداد پرونده اقساط</span>

                <span className="text-slate-900 dark:text-white">{installments.length}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/about")}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 py-3 font-bold text-green-400 transition hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <Info size={18} />
              درباره ما
            </button>
          </div>
        </div>
      </div>

      {/* DELETE MODAL */}

      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-red-500/10 p-4 text-red-400">
                <Trash2 size={32} />
              </div>
            </div>

            <h2 className="text-center text-xl font-bold">حذف همه اطلاعات؟</h2>

            <p className="mt-3 text-center text-sm leading-6 text-slate-400">
              تمام چک‌ها، اقساط و تنظیمات حذف می‌شوند و این عملیات قابل بازگشت نیست. قبل از آن حتماً بکاپ بگیر.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowDelete(false)}
                className="flex-1 rounded-xl bg-slate-100 dark:bg-slate-800 py-3 font-bold"
              >
                انصراف
              </button>

              <button
                onClick={handleDeleteAll}
                className="flex-1 rounded-xl bg-red-600 py-3 font-bold hover:bg-red-500"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BACKUP MODAL */}

      {showBackup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-blue-500/10 p-4 text-blue-400">
                <Database size={30} />
              </div>
            </div>

            <h2 className="text-center text-xl font-bold">
              ایجاد نسخه پشتیبان
            </h2>

            <p className="mt-3 text-center text-sm leading-6 text-slate-400">
              اطلاعات چک‌ها، اقساط و پروفایل در یک فایل ساخته می‌شود. بعدش می‌توانی آن را در فایل‌های گوشی ذخیره کنی یا برای خودت (مثلاً در Saved Messages تلگرام) بفرستی.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowBackup(false)}
                className="flex-1 rounded-xl bg-slate-100 dark:bg-slate-800 py-3 font-bold"
              >
                انصراف
              </button>

              <button
                onClick={handleBackup}
                className="flex-1 rounded-xl bg-blue-600 py-3 font-bold hover:bg-blue-500"
              >
                ذخیره / ارسال بکاپ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
