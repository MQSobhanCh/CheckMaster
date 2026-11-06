export default function TextInput({
  label,
  name,
  placeholder,
  value,
  onChange,
  type = "text",
}) {
  return (
    <div className="mb-5">
      <label className="block mb-2 text-sm font-semibold text-slate-400">
        {label}
      </label>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
      />
    </div>
  );
}
