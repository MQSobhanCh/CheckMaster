import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

import useSettingsStore from "../../store/settingsStore";

// Converts a JS Date to a "YYYY-MM-DD" (Gregorian) string — the exact format
// already used/stored everywhere else in the app (chequeStore, installmentStore).
function toIsoString(jsDate) {
  if (!jsDate) return "";

  const year = jsDate.getFullYear();
  const month = String(jsDate.getMonth() + 1).padStart(2, "0");
  const day = String(jsDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Drop-in replacement for a plain <input type="date" />.
 * Shows/lets the user pick a Jalali (Persian) date, but keeps emitting the
 * same Gregorian "YYYY-MM-DD" string the rest of the app already expects —
 * so no other file (stores, sorting, late-day calculations) needs to change.
 *
 * Usage is identical to a native input:
 *   <PersianDateInput name="dueDate" value={form.dueDate} onChange={handleChange} />
 */
export default function PersianDateInput({
  name,
  value,
  onChange,
  placeholder = "انتخاب تاریخ",
  className = "",
}) {
  const darkMode = useSettingsStore((state) => state.darkMode);

  const handleChange = (dateObject) => {
    const jsDate = dateObject ? dateObject.toDate() : null;
    const iso = toIsoString(jsDate);

    onChange({ target: { name, value: iso } });
  };

  return (
    <DatePicker
      calendar={persian}
      locale={persian_fa}
      value={value ? new Date(value) : ""}
      onChange={handleChange}
      placeholder={placeholder}
      calendarPosition="bottom-right"
      className={darkMode ? "rmdp-dark" : ""}
      inputClass={
        `w-full cursor-pointer rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-500/10 ${className}`
      }
    />
  );
}
