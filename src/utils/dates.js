export function parseLocalDate(value) {
  if (!value) return null;

  const [year, month, day] = String(value).split("-").map(Number);

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

export function formatPersianDate(value) {
  const date = parseLocalDate(value);

  if (!date) return "تعیین نشده";

  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
