import { revalidatePath, revalidateTag } from "next/cache";
import { ECOMMERCE_CACHE_TAG } from "@/lib/api/server";

/**
 * Called by the ERP API after website content is saved (sections, pages, menus,
 * sliders, banners, offers, blog, settings), so edits show at once instead of
 * after the revalidate window. Guarded by REVALIDATE_SECRET, the same value as
 * the API's STOREFRONT_REVALIDATE_SECRET.
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || request.headers.get("x-revalidate-secret") !== secret) {
    return Response.json({ revalidated: false, message: "Invalid secret" }, { status: 401 });
  }

  // expire: 0 → the next visit fetches fresh data instead of being served the old page once more.
  revalidateTag(ECOMMERCE_CACHE_TAG, { expire: 0 });
  revalidatePath("/", "layout");

  return Response.json({ revalidated: true, now: Date.now() });
}
