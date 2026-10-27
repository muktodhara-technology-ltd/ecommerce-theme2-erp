"use client";

import { useState } from "react";
import { useStore } from "@/lib/cart";
import { ProductImage } from "@/components/ProductImage";
import { ProductReviews, RatingSummary, WishlistButton, useProductReviews } from "@/components/ProductEngagement";
import { useSite } from "@/lib/site";
import { money, type Product } from "@/lib/products";

export function ProductDetail({ product }: { product: Product }) {
  const { add } = useStore();
  const { settings } = useSite();
  const [qty, setQty] = useState(1);
  const { reviews, summary, reload, enabled: reviewsEnabled } = useProductReviews(product.id);

  return (
    <div className="grid items-start gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-[54px]">
      <div className="overflow-hidden rounded-2xl border border-[#e7e0d4] bg-[#faf7ef] sm:rounded-3xl">
        <ProductImage
          src={product.image}
          alt={product.name}
          size="detail"
          wrapClassName="aspect-square w-full"
          className="aspect-square w-full object-cover"
        />
      </div>
      <div>
        <span className="inline-block rounded-full bg-[#eaf2eb] px-2.5 py-1.5 text-xs font-extrabold text-green">{product.badge}</span>
        <h1 className="mt-2 mb-3 font-serif text-[clamp(26px,6vw,36px)] leading-[1.15] text-green-dark sm:text-[44px] sm:leading-[1.12]">
          {product.name}
        </h1>
        {reviewsEnabled ? (
          <RatingSummary summary={summary} />
        ) : (
          <div className="text-xs text-[#a86e00]">
            ★★★★★ <span className="ml-[5px] text-[#8a918c]">{product.rating} • {product.reviews} reviews</span>
          </div>
        )}
        <div className="my-3 text-[24px] font-black text-green sm:text-[28px]">
          {money(product.price)} <small className="text-[13px] font-medium text-[#6e7b73]">/ {product.unit}</small>
        </div>
        <p className="text-sm text-muted sm:text-base">{product.description}</p>
        <div className="my-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex h-[50px] w-full items-center overflow-hidden rounded-full border border-[#ddd] bg-white sm:w-auto sm:min-w-[140px]">
            <button
              type="button"
              aria-label="Decrease quantity"
              className="grid h-full w-12 place-items-center border-r border-[#ddd] text-lg font-extrabold text-green-dark transition hover:bg-[#f3ead0]"
              onClick={() => setQty((current) => Math.max(1, current - 1))}
            >
              −
            </button>
            <span className="min-w-10 flex-1 text-center text-sm font-extrabold tabular-nums">{qty}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              className="grid h-full w-12 place-items-center border-l border-[#ddd] text-lg font-extrabold text-green-dark transition hover:bg-[#f3ead0]"
              onClick={() => setQty((current) => current + 1)}
            >
              +
            </button>
          </div>
          <button
            className="inline-flex min-h-[50px] w-full flex-1 items-center justify-center rounded-full bg-orange px-6 py-3.5 font-bold text-white transition hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(239,111,69,.25)]"
            onClick={() => add(product.id, qty)}
          >
            Add to Cart
          </button>
          <WishlistButton productId={product.id} />
        </div>
        <div className="mt-[22px] border-t border-[#e9e2d5]">
          <Row label="Category" value={product.category} />
          <Row label="Availability" value={product.stock ? "In stock" : "Out of stock"} />
          <Row label="Delivery" value="Area-based delivery" />
          <Row label="Support" value={settings.phone || "09678148148"} />
        </div>
      </div>
      {reviewsEnabled ? <ProductReviews productId={product.id} reviews={reviews} onSubmitted={reload} /> : null}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-[#e9e2d5] py-[13px] text-sm sm:gap-5">
      <span className="shrink-0 text-muted">{label}</span>
      <strong className="min-w-0 text-right break-words">{value}</strong>
    </div>
  );
}
