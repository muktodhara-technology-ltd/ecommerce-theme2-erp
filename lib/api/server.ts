import { normalizeEcommerceDomainName } from "@/lib/api/domain";

export const ECOMMERCE_CACHE_TAG = "ecommerce";

export async function ecommerceGet(
  apiPath: string,
  query: Record<string, string | number | undefined> = {},
  revalidate = 60,
) {
  const base = (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(/\/$/, "");
  if (!base) return null;

  const domain =
    normalizeEcommerceDomainName(process.env.NEXT_PUBLIC_DOMAIN) ||
    normalizeEcommerceDomainName("deshojobazar.com");

  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value != null && `${value}`.trim() !== "") qs.set(key, String(value));
  }
  if (domain) qs.set("domain_name", domain);

  const path = apiPath.startsWith("/") ? apiPath : `/${apiPath}`;
  const url = `${base}${path}?${qs.toString()}`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      // The tag lets /api/revalidate drop every API response when the admin saves.
      next: { revalidate, tags: [ECOMMERCE_CACHE_TAG] },
    });
    if (!res.ok) return null;
    const body = await res.json();
    if (body?.success === false) return null;
    return body;
  } catch {
    return null;
  }
}

export function payloadData(body: unknown) {
  if (!body || typeof body !== "object") return null;
  const record = body as Record<string, unknown>;
  return (record.data ?? record.output ?? body) as Record<string, unknown> | unknown[] | null;
}
