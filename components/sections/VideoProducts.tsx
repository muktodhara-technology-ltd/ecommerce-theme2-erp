"use client";

import Link from "next/link";
import { useStore } from "@/lib/cart";
import { ProductImage } from "@/components/ProductImage";
import { money, productHref, type Product } from "@/lib/products";

export type VideoCard = {
  key: string;
  label: string;
  badge: string;
  videoUrl: string;
  cover: string;
  product: Product | null;
};

/** "Watch & shop" cards: cover/product image, play link to the video, add-to-cart for the linked product. */
export function VideoProducts({ cards }: { cards: VideoCard[] }) {
  const { add } = useStore();
  if (!cards.length) return null;

  return (
    <div className="-mr-1 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 sm:gap-[18px] md:mr-0 md:grid md:grid-cols-2 md:overflow-visible xl:grid-cols-4">
      {cards.map((card) => {
        const { product } = card;
        const image = card.cover || product?.image || "";
        return (
          <article key={card.key} className="min-w-[78vw] snap-start overflow-hidden rounded-[22px] bg-white text-ink shadow-[0_18px_50px_rgba(0,0,0,.16)] sm:min-w-[300px] md:min-w-0">
            <div className="relative aspect-square overflow-hidden bg-[#173d32]">
              {image ? (
                <ProductImage src={image} alt={product?.name || card.label} size="card" wrapClassName="h-full w-full" className="h-full w-full object-contain" />
              ) : null}
              {card.label ? (
                <span className="absolute top-3 left-3 z-[2] rounded-full bg-white/90 px-2 py-1.5 text-[10px] font-extrabold tracking-wide text-green-dark uppercase">
                  {card.label}
                </span>
              ) : null}
              {card.videoUrl ? (
                <a
                  href={card.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Play video"
                  className="absolute top-3 right-3 z-[2] grid h-[34px] w-[34px] place-items-center rounded-full bg-[rgba(4,40,29,.76)] pl-0.5 text-xs text-white hover:bg-orange"
                >
                  ▶
                </a>
              ) : (
                <span className="absolute top-3 right-3 z-[2] grid h-[34px] w-[34px] place-items-center rounded-full bg-[rgba(4,40,29,.76)] pl-0.5 text-xs text-white">▶</span>
              )}
            </div>
            {product ? (
              <div className="grid grid-cols-[1fr_auto] items-center gap-2 p-3.5 sm:gap-3 sm:p-[15px]">
                <Link href={productHref(product)} className="min-w-0">
                  {card.badge ? <small className="block text-[10px] tracking-[0.7px] text-muted uppercase">{card.badge}</small> : null}
                  <h3 className="my-[2px] line-clamp-2 text-[14px] leading-snug font-bold sm:text-[15px]">{product.name}</h3>
                  <strong className="text-sm text-green-dark">{money(product.price)}</strong>
                </Link>
                <button
                  className="rounded-full bg-orange px-3 py-2.5 text-xs font-extrabold whitespace-nowrap text-white hover:bg-green sm:px-[13px]"
                  onClick={() => add(product.id)}
                >
                  + Add
                </button>
              </div>
            ) : (
              <div className="p-3.5 sm:p-[15px]">
                {card.badge ? <small className="block text-[10px] tracking-[0.7px] text-muted uppercase">{card.badge}</small> : null}
                <h3 className="my-[2px] text-[14px] leading-snug font-bold sm:text-[15px]">{card.label}</h3>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
