export default function SelectInput({
  label,
  name,
  value,
  onChange,
  options,
}) {
  return (
    <div className="mb-5">
      <label className="block mb-2 text-sm font-semibold text-slate-400">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 outline-none focus:border-green-500"
      >
        {options.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}
