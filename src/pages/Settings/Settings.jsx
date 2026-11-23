import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Clock,
  Info,
  Moon,
  Phone,
  RefreshCw,
  Save,
  ShieldCheck,
  Sun,
  Trash2,
  User,
} from "lucide-react";

import useSettingsStore from "../../store/settingsStore";
import useChequeStore from "../../store/chequeStore";
import useInstallmentStore from "../../store/installmentStore";
import useUIStore from "../../store/uiStore";
import {
  cancelAllReminders,
  getNotificationPermission,
  getNotificationStatus,
  isNotificationSupported,
  openExactAlarmSettings,
  requestNotificationPermission,
  sendTestNotification,
} from "../../services/notificationService";
import { APP_VERSION } from "../../config/app";

const hourOptions = Array.from({ length: 17 }, (_, index) => index + 6);

const permissionText = {
  granted: { text: "فعال", color: "text-green-500" },
  denied: { text: "غیرفعال (رد شده)", color: "text-red-500" },
  prompt: { text: "هنوز اجازه گرفته نشده", color: "text-amber-500" },
  "prompt-with-rationale": { text: "هنوز اجازه گرفته نشده", color: "text-amber-500" },
  unsupported: { text: "فقط در اپ موبایل", color: "text-slate-400" },
};

const exactText = {
  granted: { text: "مجاز", color: "text-green-500" },
  denied: { text: "غیرفعال؛ ممکن است اعلان‌ها دیر برسند", color: "text-amber-500" },
  unknown: { text: "نامشخص", color: "text-slate-400" },
};

function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      {children}
    </div>
  );
}

function CardTitle({ icon, color, title, subtitle }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}
      >
        {icon}
      </div>

      <div>
        <h2 className="font-bold">{title}</h2>
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-8 w-14 shrink-0 rounded-full transition ${
        checked ? "bg-green-600" : "bg-slate-300 dark:bg-slate-600"
      }`}
    >
      <span
        className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${
          checked ? "right-1" : "left-1"
        }`}
      />
    </button>
  );
}

const rowClass =
  "flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-100 p-4 dark:border-slate-800 dark:bg-slate-800/40";

const selectClass =
  "rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-900";

export default function Settings() {
  const navigate = useNavigate();

  const profile = useSettingsStore((state) => state.profile);
  const darkMode = useSettingsStore((state) => state.darkMode);
  const notifications = useSettingsStore((state) => state.notifications);
  const reminderDays = useSettingsStore((state) => state.reminderDays);
  const reminderHour = useSettingsStore((state) => state.reminderHour);

  const updateProfile = useSettingsStore((state) => state.updateProfile);
  const toggleTheme = useSettingsStore((state) => state.toggleTheme);
  const setNotifications = useSettingsStore((state) => state.setNotifications);
  const setReminderDays = useSettingsStore((state) => state.setReminderDays);
  const setReminderHour = useSettingsStore((state) => state.setReminderHour);
  const resetSettings = useSettingsStore((state) => state.resetSettings);

  const cheques = useChequeStore((state) => state.cheques);
  const clearCheques = useChequeStore((state) => state.clearCheques);

  const installments = useInstallmentStore((state) => state.installments);
  const clearInstallments = useInstallmentStore(
    (state) => state.clearInstallments,
  );

  const showToast = useUIStore((state) => state.showToast);
  const confirmDialog = useUIStore((state) => state.confirm);

  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [status, setStatus] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const supported = isNotificationSupported();

  useEffect(() => {
    setName(profile.name);
    setPhone(profile.phone);
  }, [profile]);

  const refreshStatus = useCallback(async () => {
    setRefreshing(true);

    try {
      setStatus(await getNotificationStatus());
    } catch {
      setStatus(null);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (notifications) refreshStatus();
  }, [notifications, reminderDays, reminderHour, refreshStatus]);

  const handleSaveProfile = () => {
    updateProfile({
      name: name.trim() || "کاربر",
      phone: phone.trim(),
    });

    showToast("اطلاعات ذخیره شد.", "success");
  };

  const handleToggleNotifications = async () => {
    if (notifications) {
      setNotifications(false);
      return;
    }

    if (supported) {
      let permission = await getNotificationPermission();

      if (permission !== "granted" && permission !== "denied") {
        const granted = await requestNotificationPermission();
        permission = granted ? "granted" : "denied";
      }

      if (permission !== "granted") {
        showToast(
          "اجازه‌ی اعلان داده نشده. تنظیمات گوشی ← برنامه‌ها ← CheckMaster ← اعلان‌ها را روشن کن.",
          "warning",
        );
        return;
      }
    }

    setNotifications(true);
  };

  const handleEnablePermission = async () => {
    const granted = await requestNotificationPermission();

    if (!granted) {
      showToast(
        "اجازه‌ی اعلان داده نشد. از تنظیمات گوشی ← برنامه‌ها ← CheckMaster ← اعلان‌ها روشنش کن.",
        "warning",
      );
    }

    refreshStatus();
  };

  const handleTestNotification = async () => {
    if (!supported) {
      showToast("اعلان آزمایشی فقط روی اپ اندروید کار می‌کند.", "info");
      return;
    }

    const result = await sendTestNotification();

    if (result === "ok") {
      showToast(
        "تا ۵ ثانیه‌ی دیگر اعلان آزمایشی می‌آید. برنامه را به پس‌زمینه ببر.",
        "success",
      );
    } else {
      showToast("اجازه‌ی اعلان داده نشده است.", "warning");
    }

    refreshStatus();
  };

  const handleDeleteAll = async () => {
    const confirmed = await confirmDialog({
      title: "حذف همه‌ی اطلاعات؟",
      message:
        "تمام چک‌ها، اقساط و تنظیمات پاک می‌شوند. چون اطلاعات فقط روی همین گوشی است، بازگشتی ندارد.",
      confirmText: "حذف همه",
    });

    if (!confirmed) return;

    cancelAllReminders().catch(() => {});

    clearCheques();
    clearInstallments();
    resetSettings();

    showToast("همه‌ی اطلاعات پاک شد.", "success");
  };

  const permission = status ? permissionText[status.permission] : null;
  const exact = status ? exactText[status.exactAlarm] || exactText.unknown : null;

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-50 px-4 py-6 pb-24 text-slate-900 dark:bg-slate-950 dark:text-white"
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="بازگشت"
            className="rounded-xl bg-slate-100 p-3 transition hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
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
          <Card className="shadow-xl">
            <CardTitle
              icon={<User size={23} />}
              color="bg-green-500/10 text-green-500"
              title="اطلاعات کاربر"
              subtitle="مشخصات نمایش داده شده داخل برنامه"
            />

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
                    onChange={(event) => setName(event.target.value)}
                    placeholder="نام شما"
                    className="w-full rounded-xl border border-slate-300 bg-slate-100 py-3 pl-3 pr-10 outline-none transition focus:border-green-500 dark:border-slate-700 dark:bg-slate-800"
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
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="0912..."
                    dir="ltr"
                    inputMode="tel"
                    className="w-full rounded-xl border border-slate-300 bg-slate-100 py-3 pl-3 pr-10 text-right outline-none transition focus:border-green-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveProfile}
              className="mt-5 flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-bold text-white transition hover:bg-green-500"
            >
              <Save size={18} />
              ذخیره اطلاعات
            </button>
          </Card>

          <Card>
            <CardTitle
              icon={<ShieldCheck size={23} />}
              color="bg-blue-500/10 text-blue-500"
              title="تنظیمات برنامه"
              subtitle="شخصی‌سازی ظاهر و اعلان‌ها"
            />

            <div className={rowClass}>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-purple-500/10 p-3 text-purple-500">
                  {darkMode ? <Moon size={20} /> : <Sun size={20} />}
                </div>

                <div>
                  <h3 className="font-medium">حالت تاریک</h3>
                  <p className="mt-1 text-xs text-slate-500">تغییر ظاهر برنامه</p>
                </div>
              </div>

              <Toggle
                checked={darkMode}
                onChange={toggleTheme}
                label="حالت تاریک"
              />
            </div>

            <div className={`mt-4 ${rowClass}`}>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-orange-500/10 p-3 text-orange-500">
                  <Bell size={20} />
                </div>

                <div>
                  <h3 className="font-medium">اعلان‌ها</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    یادآوری سررسید چک‌ها و اقساط
                  </p>
                </div>
              </div>

              <Toggle
                checked={notifications}
                onChange={handleToggleNotifications}
                label="اعلان‌ها"
              />
            </div>

            {notifications && (
              <div className="mt-3 space-y-4 rounded-2xl border border-slate-200 bg-slate-100 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-medium">چند روز قبل</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      اعلان قبل از سررسید
                    </p>
                  </div>

                  <select
                    value={reminderDays}
                    onChange={(event) =>
                      setReminderDays(Number(event.target.value))
                    }
                    className={selectClass}
                  >
                    <option value={0}>فقط روز سررسید</option>
                    <option value={1}>۱ روز قبل</option>
                    <option value={3}>۳ روز قبل</option>
                    <option value={7}>۷ روز قبل</option>
                  </select>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="flex items-center gap-2 font-medium">
                      <Clock size={16} />
                      ساعت یادآوری
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      اعلان‌ها در این ساعت نمایش داده می‌شوند
                    </p>
                  </div>

                  <select
                    value={reminderHour}
                    onChange={(event) => setReminderHour(event.target.value)}
                    className={selectClass}
                  >
                    {hourOptions.map((hour) => (
                      <option key={hour} value={hour}>
                        {hour.toLocaleString("fa-IR")}:۰۰
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rounded-xl border border-slate-300 bg-white p-4 text-sm dark:border-slate-700 dark:bg-slate-900">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-bold">وضعیت اعلان‌ها</h3>

                    <button
                      type="button"
                      onClick={refreshStatus}
                      disabled={refreshing}
                      aria-label="بروزرسانی وضعیت"
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <RefreshCw
                        size={16}
                        className={refreshing ? "animate-spin" : ""}
                      />
                    </button>
                  </div>

                  {status ? (
                    <dl className="space-y-2 text-xs">
                      <div className="flex justify-between gap-3">
                        <dt className="text-slate-500">اجازه‌ی اعلان</dt>
                        <dd className={`font-bold ${permission?.color}`}>
                          {permission?.text}
                        </dd>
                      </div>

                      {status.supported && (
                        <>
                          <div className="flex justify-between gap-3">
                            <dt className="text-slate-500">زمان‌بندی دقیق</dt>
                            <dd className={`font-bold ${exact?.color}`}>
                              {exact?.text}
                            </dd>
                          </div>

                          <div className="flex justify-between gap-3">
                            <dt className="text-slate-500">اعلان‌های زمان‌بندی‌شده</dt>
                            <dd className="font-bold">
                              {status.pendingCount.toLocaleString("fa-IR")}
                            </dd>
                          </div>

                          <div className="flex justify-between gap-3">
                            <dt className="text-slate-500">اعلان بعدی</dt>
                            <dd className="font-bold">
                              {status.nextAt
                                ? status.nextAt.toLocaleString("fa-IR", {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                  })
                                : "ندارد"}
                            </dd>
                          </div>
                        </>
                      )}
                    </dl>
                  ) : (
                    <p className="text-xs text-slate-500">در حال بررسی...</p>
                  )}

                  {!supported && (
                    <p className="mt-3 text-xs text-orange-500">
                      اعلان‌ها فقط در نسخه‌ی موبایل (اپ اندروید) کار می‌کنند.
                    </p>
                  )}

                  {status?.supported && status.permission !== "granted" && (
                    <button
                      type="button"
                      onClick={handleEnablePermission}
                      className="mt-4 w-full rounded-xl bg-green-600 py-3 text-sm font-bold text-white transition hover:bg-green-500"
                    >
                      درخواست اجازه‌ی اعلان
                    </button>
                  )}

                  {status?.supported && status.exactAlarm === "denied" && (
                    <button
                      type="button"
                      onClick={openExactAlarmSettings}
                      className="mt-3 w-full rounded-xl border border-amber-500/40 py-3 text-sm font-bold text-amber-500 transition hover:bg-amber-500/10"
                    >
                      فعال‌سازی زمان‌بندی دقیق
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleTestNotification}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-3 text-sm font-bold text-orange-500 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                >
                  <Bell size={18} />
                  ارسال اعلان آزمایشی
                </button>

                <details className="text-xs leading-6 text-slate-500">
                  <summary className="cursor-pointer font-bold">
                    اعلان نمی‌آید؟
                  </summary>

                  <p className="mt-2">
                    در بعضی گوشی‌ها (شیائومی، هوآوی، سامسونگ، اوپو) سیستم برنامه‌های
                    بسته‌شده را متوقف می‌کند. در تنظیمات گوشی برای CheckMaster گزینه‌ی
                    «بدون محدودیت باتری» و «شروع خودکار» را روشن کن.
                  </p>
                </details>
              </div>
            )}
          </Card>

          <Card className="border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/5">
            <div className="flex gap-3">
              <Info size={22} className="mt-0.5 shrink-0 text-amber-500" />

              <div>
                <h2 className="font-bold">ذخیره‌ی اطلاعات</h2>
                <p className="mt-1 text-sm leading-7 text-slate-500 dark:text-slate-400">
                  اطلاعات چک‌ها و اقساط فقط روی همین گوشی ذخیره می‌شود. اگر برنامه را
                  حذف کنی یا اطلاعات برنامه را از تنظیمات گوشی پاک کنی، اطلاعات از بین
                  می‌رود.
                </p>
              </div>
            </div>
          </Card>

          <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6">
            <CardTitle
              icon={<AlertTriangle size={23} />}
              color="bg-red-500/10 text-red-500"
              title="بخش خطر"
              subtitle="عملیات غیرقابل بازگشت"
            />

            <button
              type="button"
              onClick={handleDeleteAll}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 py-4 font-bold text-white transition hover:bg-red-500"
            >
              <Trash2 size={20} />
              حذف همه‌ی اطلاعات
            </button>
          </div>

          <Card>
            <div className="mb-4 flex items-center gap-3">
              <Info size={22} className="text-green-500" />
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
                <span className="text-slate-900 dark:text-white">
                  {cheques.length.toLocaleString("fa-IR")}
                </span>
              </div>

              <div className="flex justify-between">
                <span>تعداد پرونده اقساط</span>
                <span className="text-slate-900 dark:text-white">
                  {installments.length.toLocaleString("fa-IR")}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/about")}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 py-3 font-bold text-green-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-green-400 dark:hover:bg-slate-700"
            >
              <Info size={18} />
              درباره ما
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}
