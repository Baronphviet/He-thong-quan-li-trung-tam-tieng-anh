export function formatMoney(value) {
  const number = Number(value || 0);
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  }).format(number);
}

export function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("vi-VN").format(new Date(value));
}

export function percent(value) {
  return `${Math.round(Number(value || 0) * 100)}%`;
}
