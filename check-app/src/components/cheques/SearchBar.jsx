import { HiOutlineMagnifyingGlass } from "react-icons/hi2";

export default function SearchBar({
  value,
  onChange,
}) {
  return (
    <div className="relative mb-6">

      <HiOutlineMagnifyingGlass
        size={22}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
      />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="جستجو بر اساس شماره چک، بانک، صادرکننده..."
        className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white py-3 pl-12 pr-4 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
      />

    </div>
  );
}
