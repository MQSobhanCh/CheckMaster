import FieldError from "./FieldError";

export default function SelectInput({
  label,
  name,
  value,
  onChange,
  options,
  error,
}) {
  return (
    <div className="mb-5">
      <label
        htmlFor={name}
        className="block mb-2 text-sm font-semibold text-slate-400"
      >
        {label}
      </label>

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        className={`w-full rounded-xl border bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 outline-none ${
          error
            ? "border-red-500 focus:border-red-500"
            : "border-slate-300 dark:border-slate-700 focus:border-green-500"
        }`}
      >
        {options.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>

      <FieldError message={error} />
    </div>
  );
}
