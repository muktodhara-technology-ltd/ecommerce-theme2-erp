export function formatMoney(amount: unknown, currency?: { code?: string; symbol?: string } | null) {
  const n = Number(amount);
  if (Number.isNaN(n)) return "-";
  const code = currency?.code ? String(currency.code).toUpperCase() : "";
  if (code && /^[A-Z]{3}$/.test(code)) {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(n);
    } catch {
      /* fall through */
    }
  }
  if (currency?.symbol) return `${currency.symbol}${n.toFixed(2)}`;
  return `৳ ${n.toLocaleString("en-US")}`;
}

export function formatDate(date: unknown) {
  if (!date) return "-";
  const d = new Date(String(date));
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
}

export function mapApiErrors(raw: unknown) {
  const out: Record<string, string> = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const clean = key.startsWith("default_address.") ? key.replace("default_address.", "") : key;
    out[clean] = Array.isArray(value) ? String(value[0]) : String(value);
  }
  return out;
}

export type DashboardOrder = {
  id: string;
  reference_number?: string;
  created_at?: string;
  status?: string;
  payment_status?: string;
  payment_method?: string;
  return_status?: string;
  shipping?: { label?: string };
  shipping_method?: string;
  grand_total?: number | string;
  subtotal?: number | string;
  discount_total?: number | string;
  shipping_total?: number | string;
  shipping_charge?: number | string;
  customer_notes?: string;
  currency?: { code?: string; symbol?: string };
  items?: DashboardOrderItem[];
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  billing_address?: Record<string, unknown>;
  shipping_address?: Record<string, unknown>;
};

export type DashboardOrderItem = {
  id?: string;
  title?: string;
  product_name?: string;
  name?: string;
  sku?: string;
  product_sku?: string;
  variant_key?: string;
  quantity?: number;
  qty?: number;
  price?: number | string;
  line_total?: number | string;
  total?: number | string;
  amount?: number | string;
  unit_price?: number | string;
  image?: string;
  image_url?: string;
  attributes?: Record<string, unknown>;
  attributes_snapshot?: Record<string, unknown>;
  product_snapshot?: { image?: string; slug?: string; title?: string };
  product?: {
    product_name?: string;
    name?: string;
    primary_or_first_image?: Record<string, unknown>;
  };
};
