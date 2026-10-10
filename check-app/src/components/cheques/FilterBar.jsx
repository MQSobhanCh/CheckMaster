export default function FilterBar({
  value,
  onChange,
}) {
  const filters = [
    {
      value: "all",
      label: "همه",
    },
    {
      value: "pending",
      label: "در انتظار",
    },
    {
      value: "paid",
      label: "وصول شده",
    },
    {
      value: "returned",
      label: "برگشتی",
    },
  ];

  return (
    <div className="flex gap-2 overflow-auto mb-6">

      {filters.map((item) => (

        <button
          key={item.value}
          onClick={() => onChange(item.value)}
          className={`px-5 py-2 rounded-full whitespace-nowrap transition
          ${
            value === item.value
              ? "bg-green-600 text-slate-900 dark:text-white"
              : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          {item.label}
        </button>

      ))}

    </div>
  );
}
