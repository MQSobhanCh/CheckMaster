import { normalizeDigits } from "./forms";

const ALPHABET = "آابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی";

const ALIASES = {
  أ: "ا",
  إ: "ا",
  ٱ: "ا",
  ة: "ه",
  ي: "ی",
  ى: "ی",
  ئ: "ی",
  ؤ: "و",
  ك: "ک",
};

function normalizeName(value) {
  return normalizeDigits(value)
    .replace(/[\u200c\u200e\u200f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

// Spaces first, then Persian letters in alphabet order, then everything else
// (Latin letters, digits) by character code.
function charKey(character) {
  if (character === " ") return [-1, 0];

  const letter = ALIASES[character] || character;
  const index = ALPHABET.indexOf(letter);

  return index >= 0 ? [0, index] : [1, letter.codePointAt(0)];
}

export function compareNames(first, second) {
  const a = normalizeName(first);
  const b = normalizeName(second);

  const length = Math.min(a.length, b.length);

  for (let i = 0; i < length; i += 1) {
    const [groupA, valueA] = charKey(a[i]);
    const [groupB, valueB] = charKey(b[i]);

    if (groupA !== groupB) return groupA - groupB;
    if (valueA !== valueB) return valueA - valueB;
  }

  return a.length - b.length;
}

export const installmentSortOptions = [
  { value: "newest", label: "جدیدترین" },
  { value: "amountDesc", label: "بیشترین قسط" },
  { value: "amountAsc", label: "کمترین قسط" },
  { value: "nameAsc", label: "نام (الف تا ی)" },
  { value: "nameDesc", label: "نام (ی تا الف)" },
];

const hasName = (item) => normalizeName(item.personName) !== "";

// Returns a new array. "newest" keeps the order the store already has.
export function sortInstallments(list, mode) {
  const items = [...list];

  const byName = (a, b) => compareNames(a.personName, b.personName);
  const amount = (item) => Number(item.installmentAmount || 0);

  switch (mode) {
    case "amountDesc":
      return items.sort((a, b) => amount(b) - amount(a) || byName(a, b));

    case "amountAsc":
      return items.sort((a, b) => amount(a) - amount(b) || byName(a, b));

    case "nameAsc":
      return items.sort((a, b) => {
        if (hasName(a) !== hasName(b)) return hasName(a) ? -1 : 1;
        return byName(a, b);
      });

    case "nameDesc":
      return items.sort((a, b) => {
        if (hasName(a) !== hasName(b)) return hasName(a) ? -1 : 1;
        return byName(b, a);
      });

    default:
      return items;
  }
}
