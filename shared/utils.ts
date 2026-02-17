export function formatPrice(priceInKurus: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(priceInKurus / 100);
}

export function slugify(text: string): string {
  const trMap: Record<string, string> = {
    çÇ: "c", ğĞ: "g", şŞ: "s", üÜ: "u", ıİ: "i", öÖ: "o",
  };
  for (const key in trMap) {
    text = text.replace(new RegExp(`[${key}]`, "g"), trMap[key]);
  }
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "Beklemede",
    paid: "Ödendi",
    confirmed: "Onaylandı",
    preparing: "Hazırlanıyor",
    shipped: "Kargoya Verildi",
    delivered: "Teslim Edildi",
    cancelled: "İptal Edildi",
    refunded: "İade Edildi",
  };
  return labels[status] || status;
}

export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-blue-100 text-blue-800",
    confirmed: "bg-indigo-100 text-indigo-800",
    preparing: "bg-purple-100 text-purple-800",
    shipped: "bg-cyan-100 text-cyan-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    refunded: "bg-gray-100 text-gray-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    credit_card: "Kredi Kartı",
    bank_transfer: "Havale/EFT",
    cod: "Kapıda Ödeme",
  };
  return labels[method] || method;
}
