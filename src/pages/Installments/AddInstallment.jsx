import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  User,
  Phone,
  Wallet,
  Hash,
  CalendarDays,
  FileText,
  Plus,
  Calculator,
  CircleCheck,
} from "lucide-react";

import PersianDateInput from "../../components/forms/PersianDateInput";

import useInstallmentStore from "../../store/installmentStore";


function formatMoney(value) {
  return Number(value || 0).toLocaleString("fa-IR");
}

export default function AddInstallment() {
  const navigate = useNavigate();

  const addInstallment = useInstallmentStore((state) => state.addInstallment);

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    personName: "",
    phone: "",
    totalAmount: "",
    installmentCount: "",
    installmentAmount: "",
    startDate: today,
    firstDueDate: "",
    description: "",
  });

  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setError("");

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const totalAmount = Number(form.totalAmount || 0);

  const installmentCount = Number(form.installmentCount || 0);

  const calculatedInstallment =
    installmentCount > 0 ? Math.floor(totalAmount / installmentCount) : 0;

  const manualInstallmentAmount = Number(form.installmentAmount || 0);

  const finalInstallmentAmount =
    manualInstallmentAmount > 0
      ? manualInstallmentAmount
      : calculatedInstallment;

  const remainingFromCalculation = Math.max(
    totalAmount - finalInstallmentAmount * Math.max(installmentCount - 1, 0),
    0,
  );

  const isFormReady = useMemo(() => {
    return (
      form.personName.trim() &&
      totalAmount > 0 &&
      installmentCount > 0 &&
      form.firstDueDate
    );
  }, [form.personName, totalAmount, installmentCount, form.firstDueDate]);

  const handleSubmit = (event) => {
    event.preventDefault();

    setError("");

    if (!form.personName.trim()) {
      setError("لطفاً نام شخص را وارد کنید.");
      return;
    }

    if (totalAmount <= 0) {
      setError("لطفاً مبلغ کل را وارد کنید.");
      return;
    }

    if (installmentCount <= 0) {
      setError("لطفاً تعداد اقساط را وارد کنید.");
      return;
    }

    if (!form.firstDueDate) {
      setError("لطفاً تاریخ اولین سررسید را انتخاب کنید.");
      return;
    }

    if (
      form.startDate &&
      form.firstDueDate &&
      form.firstDueDate < form.startDate
    ) {
      setError("تاریخ اولین سررسید نمی‌تواند قبل از تاریخ شروع باشد.");
      return;
    }

    if (manualInstallmentAmount < 0) {
      setError("مبلغ هر قسط نمی‌تواند منفی باشد.");
      return;
    }

    const newInstallment = addInstallment({
      personName: form.personName.trim(),
      phone: form.phone.trim(),

      totalAmount,
      installmentCount,

      installmentAmount: finalInstallmentAmount,

      startDate: form.startDate,
      firstDueDate: form.firstDueDate,

      description: form.description.trim(),
    });

    if (!newInstallment) {
      setError("ثبت اطلاعات انجام نشد. اطلاعات واردشده را بررسی کنید.");
      return;
    }

    navigate("/installments");
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-6 pb-12 text-slate-900 dark:text-white"
    >
      <div className="mx-auto max-w-3xl">
        {/* Header */}

        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/installments")}
            className="rounded-xl bg-slate-100 dark:bg-slate-800 p-3 transition hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <ArrowRight size={20} />
          </button>

          <div>
            <h1 className="text-2xl font-bold">ثبت پول دستی</h1>

            <p className="mt-1 text-sm text-slate-400">
              اطلاعات شخص و برنامه اقساط را وارد کنید
            </p>
          </div>
        </div>

        {/* Error */}

        {error && (
          <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-medium text-red-400">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Person */}

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xl">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-500/10 text-green-400">
                <User size={21} />
              </div>

              <div>
                <h2 className="font-bold">اطلاعات شخص</h2>

                <p className="mt-1 text-xs text-slate-500">
                  مشخصات فرد دریافت‌کننده یا پرداخت‌کننده
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Name */}

              <div>
                <label className="mb-2 block text-sm text-slate-400">
                  نام شخص
                  <span className="mr-1 text-red-400">*</span>
                </label>

                <div className="relative">
                  <User
                    size={18}
                    className="absolute right-3 top-3.5 text-slate-500"
                  />

                  <input
                    name="personName"
                    value={form.personName}
                    onChange={handleChange}
                    placeholder="مثلاً علی رضایی"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 py-3 pr-10 pl-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
                  />
                </div>
              </div>

              {/* Phone */}

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
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="0912..."
                    dir="ltr"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 py-3 pr-10 pl-3 text-right outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Financial */}

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xl">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                <Wallet size={21} />
              </div>

              <div>
                <h2 className="font-bold">اطلاعات مالی</h2>

                <p className="mt-1 text-xs text-slate-500">
                  مبلغ و تعداد اقساط
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Total */}

              <div>
                <label className="mb-2 block text-sm text-slate-400">
                  مبلغ کل
                  <span className="mr-1 text-red-400">*</span>
                </label>

                <div className="relative">
                  <Wallet
                    size={18}
                    className="absolute right-3 top-3.5 text-slate-500"
                  />

                  <input
                    type="number"
                    min="0"
                    name="totalAmount"
                    value={form.totalAmount}
                    onChange={handleChange}
                    placeholder="10000000"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 py-3 pr-10 pl-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
                  />
                </div>

                {totalAmount > 0 && (
                  <p className="mt-2 text-xs text-green-400">
                    {formatMoney(totalAmount)} تومان
                  </p>
                )}
              </div>

              {/* Count */}

              <div>
                <label className="mb-2 block text-sm text-slate-400">
                  تعداد اقساط
                  <span className="mr-1 text-red-400">*</span>
                </label>

                <div className="relative">
                  <Hash
                    size={18}
                    className="absolute right-3 top-3.5 text-slate-500"
                  />

                  <input
                    type="number"
                    min="1"
                    name="installmentCount"
                    value={form.installmentCount}
                    onChange={handleChange}
                    placeholder="10"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 py-3 pr-10 pl-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
                  />
                </div>
              </div>

              {/* Installment amount */}

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-slate-400">
                  مبلغ هر قسط
                </label>

                <input
                  type="number"
                  min="0"
                  name="installmentAmount"
                  value={form.installmentAmount}
                  onChange={handleChange}
                  placeholder={
                    calculatedInstallment
                      ? `${calculatedInstallment}`
                      : "خودکار محاسبه می‌شود"
                  }
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
                />

                <p className="mt-2 text-xs text-slate-500">
                  اگر خالی بگذارید، مبلغ هر قسط به‌صورت خودکار محاسبه می‌شود.
                </p>
              </div>
            </div>
          </div>

          {/* Calculation */}

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-green-500/10 bg-green-500/10 p-5">
              <div className="flex items-center gap-2 text-green-300">
                <Wallet size={17} />
                <p className="text-sm">مبلغ کل</p>
              </div>

              <p className="mt-2 text-xl font-bold">
                {formatMoney(totalAmount)}
              </p>

              <p className="mt-1 text-xs text-green-400">تومان</p>
            </div>

            <div className="rounded-2xl border border-blue-500/10 bg-blue-500/10 p-5">
              <div className="flex items-center gap-2 text-blue-300">
                <Calculator size={17} />
                <p className="text-sm">مبلغ هر قسط</p>
              </div>

              <p className="mt-2 text-xl font-bold">
                {formatMoney(finalInstallmentAmount)}
              </p>

              <p className="mt-1 text-xs text-blue-400">تومان</p>
            </div>

            <div className="rounded-2xl border border-purple-500/10 bg-purple-500/10 p-5">
              <div className="flex items-center gap-2 text-purple-300">
                <Hash size={17} />
                <p className="text-sm">تعداد اقساط</p>
              </div>

              <p className="mt-2 text-xl font-bold">
                {installmentCount.toLocaleString("fa-IR")}
              </p>

              <p className="mt-1 text-xs text-purple-400">قسط</p>
            </div>
          </div>

          {/* Dates */}

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-5 shadow-xl">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400">
                <CalendarDays size={22} />
              </div>

              <div>
                <h2 className="font-bold">برنامه زمانی اقساط</h2>

                <p className="mt-1 text-xs text-slate-500">
                  تاریخ هر قسط از اولین سررسید محاسبه می‌شود
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Start */}

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-800/40 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500/10 text-green-400">
                    <CalendarDays size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-bold">تاریخ شروع</p>

                    <p className="text-[11px] text-slate-500">شروع قرارداد</p>
                  </div>
                </div>

                <PersianDateInput
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                />
              </div>

              {/* First due */}

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-800/40 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    <CalendarDays size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-bold">
                      اولین سررسید
                      <span className="mr-1 text-red-400">*</span>
                    </p>

                    <p className="text-[11px] text-slate-500">
                      سررسید اولین قسط
                    </p>
                  </div>
                </div>

                <PersianDateInput
                  name="firstDueDate"
                  value={form.firstDueDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950/50 px-4 py-3">
              <span>💡</span>

              <p className="text-xs leading-6 text-slate-500">
                اولین سررسید مبنای ساخت تاریخ تمام اقساط بعدی است. مثلاً اگر
                اولین سررسید ۲ مهر باشد، قسط بعدی یک ماه بعد محاسبه می‌شود.
              </p>
            </div>
          </div>

          {/* Preview */}

          {isFormReady && (
            <div className="rounded-3xl border border-green-500/20 bg-green-500/5 p-5">
              <div className="mb-4 flex items-center gap-3">
                <CircleCheck size={22} className="text-green-400" />

                <h2 className="font-bold text-green-400">خلاصه ثبت</h2>
              </div>

              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-xl bg-slate-900/70 p-3">
                  <span className="text-slate-500">شخص:</span>

                  <span className="mr-2 font-bold">{form.personName}</span>
                </div>

                <div className="rounded-xl bg-slate-900/70 p-3">
                  <span className="text-slate-500">مبلغ:</span>

                  <span className="mr-2 font-bold">
                    {formatMoney(totalAmount)} تومان
                  </span>
                </div>

                <div className="rounded-xl bg-slate-900/70 p-3">
                  <span className="text-slate-500">تعداد:</span>

                  <span className="mr-2 font-bold">
                    {installmentCount.toLocaleString("fa-IR")} قسط
                  </span>
                </div>

                <div className="rounded-xl bg-slate-900/70 p-3">
                  <span className="text-slate-500">هر قسط:</span>

                  <span className="mr-2 font-bold">
                    {formatMoney(finalInstallmentAmount)} تومان
                  </span>
                </div>
              </div>

              {manualInstallmentAmount > 0 &&
                remainingFromCalculation !== totalAmount && (
                  <p className="mt-4 rounded-xl bg-orange-500/10 p-3 text-xs leading-6 text-orange-400">
                    مبلغ قسط به‌صورت دستی تعیین شده است؛ مبلغ قسط آخر ممکن است
                    برای هماهنگ شدن با مبلغ کل متفاوت باشد.
                  </p>
                )}
            </div>
          )}

          {/* Description */}

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
                <FileText size={21} />
              </div>

              <div>
                <h2 className="font-bold">توضیحات</h2>

                <p className="mt-1 text-xs text-slate-500">توضیحات اختیاری</p>
              </div>
            </div>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="مثلاً توافق شد مبلغ در ۱۰ قسط پرداخت شود..."
              className="w-full resize-none rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-4 leading-7 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
            />
          </div>

          {/* Submit */}

          <button
            type="submit"
            disabled={!isFormReady}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-bold transition active:scale-[0.99] ${
              isFormReady
                ? "bg-green-600 hover:bg-green-500"
                : "cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-500"
            }`}
          >
            <Plus size={20} />
            ثبت پول دستی
          </button>
        </form>
      </div>
    </div>
  );
}
