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
} from "../../services/notificationService";

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

  const handleToggleNotifications = () => {
    const turningOn = !notifications;

    toggleNotifications();

    if (turningOn) {
      syncAllReminders(cheques, installments).catch(() => {});
    } else {
      cancelAllReminders(cheques, installments).catch(() => {});
    }
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

  const handleBackup = () => {
    const data = {
      profile,
      cheques,
      installments,
      createdAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "checkmaster-backup.json";

    link.click();

    URL.revokeObjectURL(url);

    setShowBackup(false);
  };

  const handleRestore = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        JSON.parse(e.target.result);

        alert(
          "فایل بکاپ معتبر است.\nبازیابی کامل در نسخه SQLite فعال خواهد شد.",
        );
      } catch {
        alert("فایل انتخاب شده معتبر نیست.");
      }
    };

    reader.readAsText(file);
  };

  const handleDeleteAll = () => {
    clearInstallments();

    resetSettings();

    setShowDelete(false);

    alert("اطلاعات تنظیمات و اقساط پاک شد.");
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
                  accept=".json"
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
              حذف تمام اقساط
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

                <span className="text-slate-900 dark:text-white">1.0.0 (build 3)</span>
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
              تمام اقساط ثبت‌شده حذف خواهند شد و این عملیات قابل بازگشت نیست.
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
              اطلاعات چک‌ها، اقساط و پروفایل در یک فایل JSON ذخیره می‌شود.
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
                دانلود بکاپ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
