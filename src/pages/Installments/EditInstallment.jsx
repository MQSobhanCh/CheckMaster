import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  User,
  Phone,
  FileText,
  Save,
  Info,
} from "lucide-react";

import useInstallmentStore from "../../store/installmentStore";

export default function EditInstallment() {
  const navigate = useNavigate();
  const { id } = useParams();

  const installment = useInstallmentStore((state) =>
    state.getInstallmentById(id),
  );

  const updateInstallment = useInstallmentStore(
    (state) => state.updateInstallment,
  );

  const [form, setForm] = useState({
    personName: "",
    phone: "",
    description: "",
  });

  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (installment) {
      setForm({
        personName: installment.personName || "",
        phone: installment.phone || "",
        description: installment.description || "",
      });
    }
  }, [installment]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setError("");
    setSaved(false);

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.personName.trim()) {
      setError("لطفاً نام شخص را وارد کنید.");
      return;
    }

    updateInstallment(id, {
      personName: form.personName.trim(),
      phone: form.phone.trim(),
      description: form.description.trim(),
    });

    setSaved(true);

    setTimeout(() => {
      navigate(`/installments/${id}`);
    }, 500);
  };

  /* =========================
     اطلاعات پیدا نشد
  ========================= */

  if (!installment) {
    return (
      <div
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 text-slate-900 dark:text-white"
      >
        <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-2xl">
            ⚠️
          </div>

          <h1 className="text-xl font-bold">اطلاعات پیدا نشد</h1>

          <p className="mt-2 text-sm text-slate-500">
            این مورد وجود ندارد یا حذف شده است.
          </p>

          <button
            type="button"
            onClick={() => navigate("/installments")}
            className="mt-6 rounded-xl bg-green-600 px-5 py-3 font-bold transition hover:bg-green-500"
          >
            بازگشت به لیست
          </button>
        </div>
      </div>
    );
  }

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
            onClick={() => navigate(`/installments/${id}`)}
            className="rounded-xl bg-slate-100 dark:bg-slate-800 p-3 transition hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <ArrowRight size={20} />
          </button>

          <div>
            <h1 className="text-2xl font-bold">ویرایش اطلاعات شخص</h1>

            <p className="mt-1 text-sm text-slate-400">
              {installment.personName || "بدون نام"}
            </p>
          </div>
        </div>

        {/* Info note */}

        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 text-sm text-blue-300">
          <Info size={18} className="mt-0.5 shrink-0" />
          <p>
            برای حفظ صحت اقساط پرداخت‌شده، فقط اطلاعات شخص (نام، شماره تماس و
            توضیحات) قابل ویرایش است. مبلغ، تعداد و زمان‌بندی اقساط بعد از
            ثبت قابل تغییر نیست.
          </p>
        </div>

        {/* Error */}

        {error && (
          <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-medium text-red-400">
            ⚠️ {error}
          </div>
        )}

        {saved && (
          <div className="mb-5 rounded-2xl border border-green-500/20 bg-green-500/10 p-4 text-sm font-medium text-green-400">
            ✅ تغییرات با موفقیت ذخیره شد.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
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
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 py-3 pr-10 pl-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm text-slate-400">
                توضیحات
              </label>

              <div className="relative">
                <FileText
                  size={18}
                  className="absolute right-3 top-3.5 text-slate-500"
                />

                <textarea
                  name="description"
                  rows="4"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="توضیحات دلخواه..."
                  className="w-full resize-none rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 py-3 pr-10 pl-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
                />
              </div>
            </div>
          </div>

          {/* Read-only summary of the plan */}

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-900/60 p-5">
            <h2 className="mb-4 font-bold text-slate-700 dark:text-slate-300">
              برنامه اقساط (غیرقابل ویرایش)
            </h2>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-slate-500">مبلغ کل</p>
                <p className="mt-1 font-bold">
                  {Number(installment.totalAmount || 0).toLocaleString(
                    "fa-IR",
                  )}{" "}
                  تومان
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">تعداد اقساط</p>
                <p className="mt-1 font-bold">
                  {Number(installment.installmentCount || 0).toLocaleString(
                    "fa-IR",
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">مبلغ هر قسط</p>
                <p className="mt-1 font-bold">
                  {Number(
                    installment.installmentAmount || 0,
                  ).toLocaleString("fa-IR")}{" "}
                  تومان
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-4 font-bold transition hover:bg-green-500"
          >
            <Save size={19} />
            ذخیره تغییرات
          </button>
        </form>
      </div>
    </div>
  );
}
