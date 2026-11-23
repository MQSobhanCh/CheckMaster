import { useState } from "react";

import {
  bankOptions,
  statusOptions,
  typeOptions,
} from "../../constants/cheque";
import {
  formatAmountInput,
  hasErrors,
  sanitizeAmount,
  sanitizeChequeNumber,
  validateCheque,
} from "../../utils/forms";
import useUIStore from "../../store/uiStore";
import DateInput from "./DateInput";
import SelectInput from "./SelectInput";
import TextInput from "./TextInput";

const emptyForm = {
  type: "received",
  chequeNumber: "",
  amount: "",
  bank: "",
  issuer: "",
  receiver: "",
  issueDate: "",
  dueDate: "",
  status: "pending",
  description: "",
};

function Section({ title, children }) {
  return (
    <section className="mb-2">
      <h2 className="mb-4 text-xs font-black text-slate-400">{title}</h2>
      {children}
    </section>
  );
}

export default function ChequeForm({
  initial,
  submitLabel,
  onSubmit,
  existing = [],
  editingId = null,
}) {
  const showToast = useUIStore((state) => state.showToast);

  const [form, setForm] = useState(() => ({
    ...emptyForm,
    ...initial,
    amount: initial?.amount ? String(initial.amount) : "",
  }));
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const legacyWithoutType = Boolean(editingId) && !initial?.type;
  const typeChoices = legacyWithoutType
    ? [{ label: "نامشخص", value: "" }, ...typeOptions]
    : typeOptions;

  function handleChange(event) {
    const { name } = event.target;
    let { value } = event.target;

    if (name === "amount") value = sanitizeAmount(value);
    if (name === "chequeNumber") value = sanitizeChequeNumber(value);

    setForm((current) => ({ ...current, [name]: value }));

    if (errors[name]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[name];
        return next;
      });
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    const found = validateCheque(form, { existing, editingId });

    setErrors(found);

    if (hasErrors(found)) {
      requestAnimationFrame(() => {
        document
          .querySelector('[role="alert"]')
          ?.scrollIntoView?.({ behavior: "smooth", block: "center" });
      });

      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        ...form,
        chequeNumber: sanitizeChequeNumber(form.chequeNumber),
        amount: Number(sanitizeAmount(form.amount)),
        issuer: form.issuer.trim(),
        receiver: form.receiver.trim(),
        description: form.description.trim(),
      });
    } catch (error) {
      console.error("Cheque form error:", error);
      showToast("ذخیره انجام نشد. دوباره تلاش کن.", "error");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Section title="اطلاعات اصلی">
        <SelectInput
          label="نوع چک"
          name="type"
          value={form.type || ""}
          onChange={handleChange}
          options={typeChoices}
        />

        <TextInput
          label="شماره چک"
          name="chequeNumber"
          inputMode="numeric"
          value={form.chequeNumber}
          onChange={handleChange}
          error={errors.chequeNumber}
        />

        <TextInput
          label="مبلغ (تومان)"
          name="amount"
          inputMode="numeric"
          value={formatAmountInput(form.amount)}
          onChange={handleChange}
          error={errors.amount}
        />

        <SelectInput
          label="بانک"
          name="bank"
          value={form.bank || ""}
          onChange={handleChange}
          options={bankOptions}
        />
      </Section>

      <Section title="طرفین">
        <TextInput
          label="صادرکننده"
          name="issuer"
          value={form.issuer || ""}
          onChange={handleChange}
        />

        <TextInput
          label="دریافت‌کننده"
          name="receiver"
          value={form.receiver || ""}
          onChange={handleChange}
        />
      </Section>

      <Section title="تاریخ و وضعیت">
        <DateInput
          label="تاریخ صدور"
          name="issueDate"
          value={form.issueDate}
          onChange={handleChange}
          error={errors.issueDate}
        />

        <DateInput
          label="تاریخ سررسید"
          name="dueDate"
          value={form.dueDate}
          onChange={handleChange}
          error={errors.dueDate}
        />

        <SelectInput
          label="وضعیت"
          name="status"
          value={form.status}
          onChange={handleChange}
          options={statusOptions}
        />
      </Section>

      <div className="mb-6">
        <label
          htmlFor="description"
          className="mb-2 block text-sm font-semibold text-slate-400"
        >
          توضیحات
        </label>

        <textarea
          id="description"
          name="description"
          rows="3"
          value={form.description || ""}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-slate-900 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-green-600 py-4 font-bold text-white transition hover:bg-green-500 disabled:opacity-60"
      >
        {loading ? "در حال ذخیره..." : submitLabel}
      </button>
    </form>
  );
}
