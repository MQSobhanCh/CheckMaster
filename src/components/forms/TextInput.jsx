import FieldError from "./FieldError";

export default function TextInput({
  label,
  name,
  placeholder,
  value,
  onChange,
  type = "text",
  inputMode,
  maxLength,
  error,
  dir,
}) {
  return (
    <div className="mb-5">
      <label
        htmlFor={name}
        className="block mb-2 text-sm font-semibold text-slate-400"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        inputMode={inputMode}
        maxLength={maxLength}
        dir={dir}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className={`w-full rounded-xl border bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 outline-none transition focus:ring-4 ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
            : "border-slate-300 dark:border-slate-700 focus:border-green-500 focus:ring-green-500/10"
        }`}
      />

      <FieldError message={error} />
    </div>
  );
}
