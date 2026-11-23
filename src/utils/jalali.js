const DAY = 24 * 60 * 60 * 1000;

const persianParts = new Intl.DateTimeFormat("en-US-u-ca-persian-nu-latn", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  timeZone: "UTC",
});

const pad = (value) => String(value).padStart(2, "0");

function isoToUtc(iso) {
  const [year, month, day] = String(iso).split("-").map(Number);

  if (!year || !month || !day) return null;

  return Date.UTC(year, month - 1, day, 12);
}

function utcToIso(ms) {
  const date = new Date(ms);

  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function jalaliOf(ms) {
  const parts = persianParts.formatToParts(new Date(ms));
  const pick = (type) => Number(parts.find((part) => part.type === type)?.value);

  return { year: pick("year"), month: pick("month"), day: pick("day") };
}

function compare(a, b) {
  return (
    a.year - b.year || a.month - b.month || a.day - b.day
  );
}

export function gregorianToJalali(iso) {
  const ms = isoToUtc(iso);

  return ms === null ? null : jalaliOf(ms);
}

function tryJalaliToGregorian(year, month, day) {
  const monthOffset = month <= 7 ? (month - 1) * 31 : 6 * 31 + (month - 7) * 30;
  const target = { year, month, day };

  let ms = Date.UTC(year + 621, 2, 21, 12) + (monthOffset + day - 1) * DAY;

  for (let i = 0; i < 8; i += 1) {
    const order = compare(jalaliOf(ms), target);

    if (order === 0) return utcToIso(ms);

    ms += order > 0 ? -DAY : DAY;
  }

  return null;
}

export function jalaliToGregorian(year, month, day) {
  return tryJalaliToGregorian(year, month, day);
}

export function jalaliMonthLength(year, month) {
  if (month <= 6) return 31;
  if (month <= 11) return 30;

  return tryJalaliToGregorian(year, 12, 30) ? 30 : 29;
}

// Adds whole Persian (Jalali) months to a Gregorian "YYYY-MM-DD" string and
// returns a Gregorian "YYYY-MM-DD" string. The day of the month is kept and
// shortened when the target month is shorter (e.g. 31 Shahrivar -> 30 Mehr).
export function addJalaliMonths(iso, months) {
  const start = gregorianToJalali(iso);

  if (!start) return "";

  const total = start.year * 12 + (start.month - 1) + Number(months || 0);
  const year = Math.floor(total / 12);
  const month = (total % 12) + 1;
  const day = Math.min(start.day, jalaliMonthLength(year, month));

  return jalaliToGregorian(year, month, day) || "";
}
