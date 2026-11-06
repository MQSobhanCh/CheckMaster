import PersianDateInput from "./PersianDateInput";

export default function DateInput({
  label,
  name,
  value,
  onChange,
}) {
  return (
    <div className="mb-5">
      <label className="block mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
        {label}
      </label>

      <PersianDateInput
        name={name}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
