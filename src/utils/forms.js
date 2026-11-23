const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export function normalizeDigits(value) {
  return String(value ?? "")
    .replace(/[۰-۹]/g, (digit) => String(PERSIAN_DIGITS.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(ARABIC_DIGITS.indexOf(digit)));
}

export function sanitizeAmount(value) {
  return normalizeDigits(value).replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "");
}

export function formatAmountInput(value) {
  const digits = sanitizeAmount(value);

  return digits ? Number(digits).toLocaleString("en-US") : "";
}

export function sanitizeChequeNumber(value) {
  return normalizeDigits(value).replace(/\s+/g, "").slice(0, 30);
}

export function validateCheque(form, { existing = [], editingId = null } = {}) {
  const errors = {};

  const number = sanitizeChequeNumber(form.chequeNumber);
  const amount = Number(sanitizeAmount(form.amount));

  if (!number) {
    errors.chequeNumber = "شماره چک را وارد کنید.";
  } else {
    const duplicate = existing.some(
      (item) =>
        item.id !== editingId &&
        sanitizeChequeNumber(item.chequeNumber) === number &&
        (item.bank || "") === (form.bank || ""),
    );

    if (duplicate) {
      errors.chequeNumber = "این شماره چک برای همین بانک قبلاً ثبت شده است.";
    }
  }

  if (!amount || amount <= 0) {
    errors.amount = "مبلغ چک باید بیشتر از صفر باشد.";
  }

  if (!form.dueDate) {
    errors.dueDate = "تاریخ سررسید را مشخص کنید.";
  }

  if (form.issueDate && form.dueDate && form.issueDate > form.dueDate) {
    errors.issueDate = "تاریخ صدور نمی‌تواند بعد از سررسید باشد.";
  }

  return errors;
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}
