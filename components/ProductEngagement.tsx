"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import instance from "@/lib/api/axios";
import { ApiLink } from "@/lib/api/apiLink";
import { useCustomerAuth } from "@/lib/api/auth";
import { getOrCreateGuestToken } from "@/lib/api/guestToken";
import { isUuid } from "@/lib/api/helpers";
import { IconHeart } from "@/components/Icons";
import { useStore } from "@/lib/cart";

type Review = { id: string; rating: number; review: string | null; reviewer_name: string; created_at?: string };
type Summary = { rating: number; reviews_count: number };

const errorMessage = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;

/** Heart button: adds/removes the product in the ERP wishlist (customer login or guest token). */
export function WishlistButton({ productId }: { productId: string }) {
  const { toast } = useStore();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const enabled = isUuid(productId);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    instance
      .get(ApiLink.ecommerceWishlist, { params: { guest_token: getOrCreateGuestToken() }, skipAuthRedirect: true })
      .then(({ data }) => {
        const ids: string[] = Array.isArray(data?.data?.product_ids) ? data.data.product_ids.map(String) : [];
        if (!cancelled) setSaved(ids.includes(productId));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [productId, enabled]);

  if (!enabled) return null;

  async function toggle() {
    setBusy(true);
    const body = { product_id: productId, guest_token: getOrCreateGuestToken() };
    try {
      if (saved) {
        await instance.delete(ApiLink.ecommerceWishlist, { data: body, skipAuthRedirect: true });
        setSaved(false);
        toast("উইশলিস্ট থেকে সরানো হয়েছে");
      } else {
        await instance.post(ApiLink.ecommerceWishlist, body, { skipAuthRedirect: true });
        setSaved(true);
        toast("উইশলিস্টে যোগ হয়েছে");
      }
    } catch (err) {
      toast(errorMessage(err, "উইশলিস্ট আপডেট করা যায়নি"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={toggle}
      aria-pressed={saved}
      aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
      className={`grid h-[50px] w-[50px] shrink-0 place-items-center rounded-full border transition disabled:opacity-60 ${
        saved ? "border-orange bg-orange text-white" : "border-[#ddd] bg-white text-green-dark hover:border-orange hover:text-orange"
      }`}
    >
      <IconHeart className="h-5 w-5" />
    </button>
  );
}

function Stars({ value }: { value: number }) {
  const full = Math.round(value);
  return (
    <span className="tracking-wide text-[#a86e00]" aria-label={`${value} out of 5`}>
      {"★".repeat(full)}
      <span className="text-[#d9d2c3]">{"★".repeat(5 - full)}</span>
    </span>
  );
}

/** Rating summary line under the product title (real ERP reviews). */
export function RatingSummary({ summary }: { summary: Summary | null }) {
  if (!summary || !summary.reviews_count) return <div className="text-xs text-[#8a918c]">No reviews yet</div>;
  return (
    <div className="text-xs">
      <Stars value={summary.rating} /> <span className="ml-[5px] text-[#8a918c]">{summary.rating.toFixed(1)} • {summary.reviews_count} reviews</span>
    </div>
  );
}

/** Loads the product's approved reviews; `reload` refreshes after a new review. */
export function useProductReviews(productId: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const enabled = isUuid(productId);

  const reload = useCallback(async () => {
    if (!enabled) return;
    try {
      const { data } = await instance.get(ApiLink.ecommerceProductReviews(productId), { skipAuthRedirect: true });
      setReviews(Array.isArray(data?.data?.reviews) ? data.data.reviews : []);
      const s = data?.data?.summary;
      setSummary(s ? { rating: Number(s.rating) || 0, reviews_count: Number(s.reviews_count) || 0 } : null);
    } catch {
      setReviews([]);
    }
  }, [productId, enabled]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { reviews, summary, reload, enabled };
}

/** Reviews list + "write a review" form (logged-in customers). */
export function ProductReviews({
  productId,
  reviews,
  onSubmitted,
}: {
  productId: string;
  reviews: Review[];
  onSubmitted: () => void;
}) {
  const { isLoggedIn } = useCustomerAuth();
  const { toast } = useStore();
  const pathname = usePathname();
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { data } = await instance.post(ApiLink.ecommerceProductReviews(productId), { rating, review: text.trim() || null });
      if (!data?.success) {
        setError(data?.message || "রিভিউ পাঠানো যায়নি।");
        return;
      }
      setText("");
      toast("রিভিউ দেওয়ার জন্য ধন্যবাদ!");
      onSubmitted();
    } catch (err) {
      setError(errorMessage(err, "রিভিউ পাঠানো যায়নি।"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-10 border-t border-[#e9e2d5] pt-8 lg:col-span-2">
      <h2 className="mb-4 font-serif text-2xl text-green-dark">Customer reviews</h2>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-3">
          {reviews.length === 0 ? <p className="text-sm text-muted">এখনো কোনো রিভিউ নেই।</p> : null}
          {reviews.map((review) => (
            <article key={review.id} className="rounded-[16px] border border-[#e4ddcf] bg-white p-4">
              <div className="flex items-center justify-between gap-2 text-sm">
                <strong>{review.reviewer_name}</strong>
                <Stars value={review.rating} />
              </div>
              {review.review ? <p className="mt-2 text-sm text-[#45544a]">{review.review}</p> : null}
            </article>
          ))}
        </div>
        {isLoggedIn ? (
          <form onSubmit={submit} className="h-fit rounded-[16px] border border-[#e4ddcf] bg-white p-4">
            <h3 className="mb-2 font-bold">Write a review</h3>
            <div className="mb-3 flex gap-1 text-2xl" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={rating === n}
                  onClick={() => setRating(n)}
                  className={n <= rating ? "text-[#a86e00]" : "text-[#d9d2c3]"}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={1000}
              rows={4}
              placeholder="আপনার অভিজ্ঞতা লিখুন (ঐচ্ছিক)"
              className="w-full rounded-[11px] border border-[#dcd6ca] px-[13px] py-2.5 text-sm outline-none focus:border-green"
            />
            {error ? <p className="mt-1 text-xs text-[#a33]">{error}</p> : null}
            <button disabled={busy} className="mt-3 w-full rounded-full bg-orange px-5 py-3 font-bold text-white disabled:opacity-60">
              {busy ? "Sending..." : "Submit review"}
            </button>
          </form>
        ) : (
          <div className="h-fit rounded-[16px] border border-[#e4ddcf] bg-white p-4 text-sm text-muted">
            রিভিউ দিতে{" "}
            <Link href={`/auth/login?redirect=${encodeURIComponent(pathname || "/")}`} className="font-bold text-green">
              লগইন করুন
            </Link>
            ।
          </div>
        )}
      </div>
    </section>
  );
}
