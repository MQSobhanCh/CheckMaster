import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import TextInput from "../../components/forms/TextInput";
import DateInput from "../../components/forms/DateInput";
import SelectInput from "../../components/forms/SelectInput";
import useChequeStore from "../../store/chequeStore";

const bankOptions = [
  { label: "بانک ملی ایران", value: "بانک ملی ایران" },
  { label: "بانک سپه", value: "بانک سپه" },
  { label: "بانک صادرات ایران", value: "بانک صادرات ایران" },
  { label: "بانک تجارت", value: "بانک تجارت" },
  { label: "بانک ملت", value: "بانک ملت" },
  { label: "بانک رفاه کارگران", value: "بانک رفاه کارگران" },
  { label: "بانک کشاورزی", value: "بانک کشاورزی" },
  { label: "بانک مسکن", value: "بانک مسکن" },
  { label: "بانک صنعت و معدن", value: "بانک صنعت و معدن" },
  { label: "بانک توسعه صادرات ایران", value: "بانک توسعه صادرات ایران" },
  { label: "بانک توسعه تعاون", value: "بانک توسعه تعاون" },
  { label: "پست بانک ایران", value: "پست بانک ایران" },
  { label: "بانک پارسیان", value: "بانک پارسیان" },
  { label: "بانک پاسارگاد", value: "بانک پاسارگاد" },
  { label: "بانک اقتصاد نوین", value: "بانک اقتصاد نوین" },
  { label: "بانک سامان", value: "بانک سامان" },
  { label: "بانک سینا", value: "بانک سینا" },
  { label: "بانک شهر", value: "بانک شهر" },
  { label: "بانک دی", value: "بانک دی" },
  { label: "بانک آینده", value: "بانک آینده" },
  { label: "بانک کارآفرین", value: "بانک کارآفرین" },
  { label: "بانک خاورمیانه", value: "بانک خاورمیانه" },
  { label: "بانک گردشگری", value: "بانک گردشگری" },
  { label: "بانک ایران زمین", value: "بانک ایران زمین" },
  { label: "بانک کوثر", value: "بانک کوثر" },
  { label: "بانک مهر ایران", value: "بانک مهر ایران" },
  { label: "بانک قرض‌الحسنه رسالت", value: "بانک قرض‌الحسنه رسالت" },
  { label: "موسسه اعتباری ملل (عسکریه)", value: "موسسه اعتباری ملل (عسکریه)" },
  { label: "سایر", value: "سایر" },
];

const statusOptions = [
  { label: "در انتظار", value: "pending" },
  { label: "وصول شده", value: "paid" },
  { label: "برگشتی", value: "returned" },
];

export default function EditCheque() {
  const { id } = useParams();
  const navigate = useNavigate();

  const getChequeById = useChequeStore((state) => state.getChequeById);
  const updateCheque = useChequeStore((state) => state.updateCheque);

  const cheque = getChequeById(id);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    chequeNumber: "",
    amount: "",
    bank: "",
    issuer: "",
    receiver: "",
    issueDate: "",
    dueDate: "",
    status: "pending",
    description: "",
  });

  useEffect(() => {
    if (cheque) {
      setForm(cheque);
    }
  }, [cheque]);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);

    await updateCheque(id, form);

    setLoading(false);

    alert("اطلاعات چک با موفقیت ویرایش شد.");

    navigate("/cheques");
  }

  if (!cheque) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <h2 className="text-2xl font-bold text-red-400">
          چک پیدا نشد
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-5 text-slate-900 dark:text-white">

      <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-8">

        <div className="mb-8 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/cheques")}
            className="rounded-xl bg-slate-100 dark:bg-slate-800 p-3 transition hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <ArrowRight size={20} />
          </button>

          <h1 className="text-3xl font-bold">
            ویرایش چک
          </h1>
        </div>

        <form onSubmit={handleSubmit}>

          <TextInput
            label="شماره چک"
            name="chequeNumber"
            value={form.chequeNumber}
            onChange={handleChange}
          />

          <TextInput
            label="مبلغ"
            name="amount"
            type="number"
            value={form.amount}
            onChange={handleChange}
          />

          <SelectInput
            label="بانک"
            name="bank"
            value={form.bank}
            onChange={handleChange}
            options={bankOptions}
          />

          <TextInput
            label="صادرکننده"
            name="issuer"
            value={form.issuer}
            onChange={handleChange}
          />

          <TextInput
            label="دریافت‌کننده"
            name="receiver"
            value={form.receiver}
            onChange={handleChange}
          />

          <DateInput
            label="تاریخ صدور"
            name="issueDate"
            value={form.issueDate}
            onChange={handleChange}
          />

          <DateInput
            label="تاریخ سررسید"
            name="dueDate"
            value={form.dueDate}
            onChange={handleChange}
          />

          <SelectInput
            label="وضعیت"
            name="status"
            value={form.status}
            onChange={handleChange}
            options={statusOptions}
          />

          <div className="mb-5">
            <label className="block mb-2 font-semibold">
              توضیحات
            </label>

            <textarea
              name="description"
              rows="4"
              value={form.description}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 outline-none focus:border-green-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-green-600 hover:bg-green-500 text-slate-900 dark:text-white font-bold transition"
          >
            {loading ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </button>

        </form>

      </div>

    </div>
  );
}