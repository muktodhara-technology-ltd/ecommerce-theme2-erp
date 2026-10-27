"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/cart";
import { useCustomerAuth } from "@/lib/api/auth";
import instance from "@/lib/api/axios";
import { ApiLink } from "@/lib/api/apiLink";
import { getOrCreateGuestToken } from "@/lib/api/guestToken";
import { isUuid, roundMoney } from "@/lib/api/helpers";
import { useCatalog } from "@/lib/catalog";
import { money } from "@/lib/products";

type ShippingOption = {
  key: string;
  method: "regular" | "express";
  label: string;
  cost: number;
  etaDays?: number;
  ecommerceShippingChargeId?: string | number | null;
};

type PaymentOption = {
  gateway_code: string;
  display_name?: string;
  gateway_label?: string;
};

export function CheckoutView() {
  const router = useRouter();
  const { items, clear, toast } = useStore();
  const { customer, isLoggedIn } = useCustomerAuth();
  const { getProduct } = useCatalog();

  const lines = useMemo(
    () =>
      items
        .map((line) => {
          const product = getProduct(line.id);
          return product ? { product, qty: line.qty } : null;
        })
        .filter((line): line is { product: NonNullable<ReturnType<typeof getProduct>>; qty: number } => Boolean(line)),
    [items, getProduct],
  );

  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.qty, 0);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "Dhaka",
    postalCode: "",
  });
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([{ gateway_code: "cod", display_name: "Cash on Delivery" }]);
  const [shippingKey, setShippingKey] = useState("");
  const [payment, setPayment] = useState("cod");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!customer) return;
    setForm((prev) => ({
      ...prev,
      name: customer.full_name || prev.name,
      email: customer.email || prev.email,
      phone: customer.phone || prev.phone,
      address: customer.default_address?.line1 || prev.address,
      city: customer.default_address?.city || prev.city,
      postalCode: customer.default_address?.postal_code || prev.postalCode,
    }));
  }, [customer]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [shipRes, payRes] = await Promise.all([
          instance.get(ApiLink.ecommerceCheckoutShippingOptions),
          instance.get(ApiLink.ecommerceCheckoutPaymentGatewayOptions),
        ]);
        if (cancelled) return;

        const rows = Array.isArray(shipRes.data?.data) ? shipRes.data.data : [];
        const nextShipping: ShippingOption[] = [];
        for (const row of rows) {
          if (row.regular_charge != null) {
            nextShipping.push({
              key: `regular-${row.id}`,
              method: "regular",
              label: `Regular${row.city ? ` • ${row.city}` : ""}`,
              cost: Number(row.regular_charge) || 0,
              etaDays: row.number_of_days_regular,
              ecommerceShippingChargeId: row.id,
            });
          }
          if (row.express_charge != null) {
            nextShipping.push({
              key: `express-${row.id}`,
              method: "express",
              label: `Express${row.city ? ` • ${row.city}` : ""}`,
              cost: Number(row.express_charge) || 0,
              etaDays: row.number_of_days_express,
              ecommerceShippingChargeId: row.id,
            });
          }
        }
        setShippingOptions(nextShipping);
        if (nextShipping[0]) setShippingKey(nextShipping[0].key);

        const gateways = Array.isArray(payRes.data?.data) ? payRes.data.data : [];
        const nextPay: PaymentOption[] = [{ gateway_code: "cod", display_name: "Cash on Delivery" }, ...gateways];
        setPaymentOptions(nextPay);
      } catch {
        setShippingOptions([{ key: "regular-default", method: "regular", label: "Regular delivery", cost: 0 }]);
        setShippingKey("regular-default");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Coupon: validated by the ERP against the current subtotal; dropped if the cart changes.
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<{ id: string | null; code: string; discount: number; forSubtotal: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    if (coupon && coupon.forSubtotal !== subtotal) {
      setCoupon(null);
      setCouponError("কার্ট পরিবর্তন হয়েছে — কুপন আবার প্রয়োগ করুন।");
    }
  }, [subtotal, coupon]);

  async function applyCoupon() {
    const code = couponCode.trim();
    if (!code || subtotal <= 0) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const { data } = await instance.post(ApiLink.ecommerceCouponApply, { coupon_code: code, order_total: roundMoney(subtotal) });
      if (!data?.success) {
        setCoupon(null);
        setCouponError(data?.message || "কুপন প্রয়োগ করা যায়নি।");
        return;
      }
      setCoupon({
        id: data.data?.coupon?.id ?? null,
        code: data.data?.coupon?.coupon_code || code,
        discount: Number(data.data?.discount_amount) || 0,
        forSubtotal: subtotal,
      });
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setCoupon(null);
      setCouponError(message || "কুপন প্রয়োগ করা যায়নি।");
    } finally {
      setCouponLoading(false);
    }
  }

  const selectedShipping = shippingOptions.find((option) => option.key === shippingKey);
  const shippingCharge = selectedShipping?.cost || 0;
  const discount = coupon ? Math.min(coupon.discount, subtotal) : 0;
  const grandTotal = roundMoney(subtotal - discount + shippingCharge);

  function update(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function placeOrder(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!lines.length) {
      setError("কার্ট খালি।");
      return;
    }
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim() || !form.city.trim()) {
      setError("নাম, মোবাইল, ঠিকানা ও শহর পূরণ করুন।");
      return;
    }

    setSubmitting(true);
    const payload = {
      contact: {
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim(),
      },
      delivery_address: {
        line1: form.address.trim(),
        city: form.city.trim(),
        postal_code: form.postalCode.trim() || null,
      },
      billing_same_as_delivery: true,
      items: lines.map(({ product, qty }) => ({
        product_id: isUuid(product.id) ? product.id : null,
        product_name: product.name,
        product_sku: product.id,
        quantity: qty,
        unit_price: roundMoney(product.price),
        line_total: roundMoney(product.price * qty),
        variant_key: null,
        product_snapshot: { slug: product.id, image: product.image },
      })),
      subtotal: roundMoney(subtotal),
      tax_total: 0,
      discount_total: roundMoney(discount),
      shipping_charge: roundMoney(shippingCharge),
      packing_charge: 0,
      packing_applied: false,
      grand_total: grandTotal,
      coupon: coupon ? { code: coupon.code, id: coupon.id, discount_amount: roundMoney(discount) } : null,
      shipping: {
        method: selectedShipping?.method || "regular",
        label: selectedShipping?.label || "Regular",
        ecommerce_shipping_charge_id: selectedShipping?.ecommerceShippingChargeId || null,
        meta: selectedShipping ? { cost: roundMoney(selectedShipping.cost), eta_days: selectedShipping.etaDays } : null,
      },
      payment_method: payment,
      payment_status: "pending",
      guest_token: getOrCreateGuestToken(),
    };

    try {
      const res = await instance.post(ApiLink.ecommerceCheckout, payload);
      const checkout = res.data?.data;
      if (!res.data?.success || !checkout?.id) {
        setError(res.data?.message || "অর্ডার তৈরি হয়নি।");
        return;
      }

      if (payment === "sslcommerz") {
        const origin = window.location.origin;
        const payRes = await instance.post(ApiLink.ecommerceCheckoutPaymentGatewayApply, {
          checkout_id: checkout.id,
          payment_gateway_code: "sslcommerz",
          success_url: `${origin}/checkout/success?checkout_id=${checkout.id}`,
          fail_url: `${origin}/checkout/failed`,
          cancel_url: `${origin}/checkout`,
        });
        const gatewayUrl = payRes?.data?.data?.GatewayPageURL;
        if (gatewayUrl) {
          clear();
          window.location.href = gatewayUrl;
          return;
        }
        setError("পেমেন্ট গেটওয়ে খোলা যায়নি।");
        return;
      }

      if (payment === "stripe") {
        await instance.post(ApiLink.ecommerceCheckoutPaymentGatewayApply, {
          checkout_id: checkout.id,
          payment_gateway_code: "stripe",
        });
      }

      clear();
      toast("অর্ডার গ্রহণ করা হয়েছে");
      router.push(`/checkout/success?checkout_id=${checkout.id}&ref=${encodeURIComponent(checkout.reference_number || "")}`);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || "অর্ডার পাঠানো যায়নি। আবার চেষ্টা করুন।");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="py-8 sm:py-12">
      <div className="page-wrap grid gap-5 sm:gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <form className="rounded-[20px] border border-[#e6dfd2] bg-white p-4 sm:p-[26px]" onSubmit={placeOrder}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="mt-0 text-2xl sm:text-[28px]">Delivery information</h2>
            {!isLoggedIn ? (
              <Link href="/auth/login?redirect=/checkout" className="text-sm font-bold text-green hover:text-orange">
                Login for faster checkout →
              </Link>
            ) : (
              <span className="text-sm text-muted">Logged in as {customer?.full_name || customer?.email || customer?.phone}</span>
            )}
          </div>

          {error ? <div className="mb-4 rounded-xl bg-[#fdecea] px-3 py-2.5 text-sm text-[#a33]">{error}</div> : null}

          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field label="নাম">
              <input required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="আপনার নাম" />
            </Field>
            <Field label="মোবাইল">
              <input required value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="01XXXXXXXXX" />
            </Field>
            <Field label="ইমেইল">
              <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="optional@email.com" />
            </Field>
            <Field label="শহর">
              <input required value={form.city} onChange={(e) => update("city", e.target.value)} />
            </Field>
            <Field label="ঠিকানা" full>
              <textarea required rows={3} value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="বাড়ি, রাস্তা, এলাকা" />
            </Field>
            <Field label="পোস্টাল কোড">
              <input value={form.postalCode} onChange={(e) => update("postalCode", e.target.value)} placeholder="Optional" />
            </Field>
          </div>

          <div className="mt-5">
            <h3 className="mb-2 text-sm font-extrabold tracking-wide text-muted uppercase">Shipping</h3>
            <div className="grid gap-2">
              {shippingOptions.map((option) => (
                <label key={option.key} className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3.5 py-3 ${shippingKey === option.key ? "border-green bg-[#f1f6ef]" : "border-[#e6dfd2]"}`}>
                  <span className="flex items-center gap-2 text-sm font-bold">
                    <input type="radio" name="shipping" checked={shippingKey === option.key} onChange={() => setShippingKey(option.key)} />
                    {option.label}
                    {option.etaDays ? <span className="font-medium text-muted">• {option.etaDays} days</span> : null}
                  </span>
                  <strong className="text-sm">{money(option.cost)}</strong>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <h3 className="mb-2 text-sm font-extrabold tracking-wide text-muted uppercase">Payment</h3>
            <div className="grid gap-2">
              {paymentOptions.map((option) => (
                <label key={option.gateway_code} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-3 text-sm font-bold ${payment === option.gateway_code ? "border-green bg-[#f1f6ef]" : "border-[#e6dfd2]"}`}>
                  <input type="radio" name="payment" checked={payment === option.gateway_code} onChange={() => setPayment(option.gateway_code)} />
                  {option.display_name || option.gateway_label || option.gateway_code}
                </label>
              ))}
            </div>
          </div>

          <button disabled={submitting || !lines.length} className="mt-[18px] inline-flex min-h-[50px] w-full items-center justify-center rounded-full bg-orange px-6 py-3.5 font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-60">
            {submitting ? "Processing..." : `Place Order • ${money(grandTotal)}`}
          </button>
        </form>

        <aside className="rounded-[20px] border border-[#e6dfd2] bg-white p-4 sm:p-[26px] lg:sticky lg:top-[90px] lg:self-start">
          <h2 className="mt-0 text-2xl sm:text-[28px]">Your order</h2>
          {lines.length === 0 ? (
            <div className="px-5 py-14 text-center text-muted">
              কার্ট খালি।{" "}
              <Link href="/shop" className="font-bold text-green">
                Shop করুন
              </Link>
            </div>
          ) : (
            <>
              {lines.map(({ product, qty }) => (
                <div key={product.id} className="flex justify-between gap-2.5 border-b border-[#eee] py-[9px]">
                  <span className="min-w-0 flex-1 break-words">
                    {product.name} × {qty}
                  </span>
                  <strong className="shrink-0">{money(product.price * qty)}</strong>
                </div>
              ))}
              <div className="mt-3 flex justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span>{money(subtotal)}</span>
              </div>
              {discount > 0 ? (
                <div className="mt-1.5 flex justify-between text-sm text-green">
                  <span>Coupon ({coupon?.code})</span>
                  <span>− {money(discount)}</span>
                </div>
              ) : null}
              <div className="mt-1.5 flex justify-between text-sm">
                <span className="text-muted">Shipping</span>
                <span>{money(shippingCharge)}</span>
              </div>
              <div className="mt-4 border-t border-[#eee] pt-3">
                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        applyCoupon();
                      }
                    }}
                    placeholder="কুপন কোড"
                    className="min-w-0 flex-1 rounded-[11px] border border-[#dcd6ca] px-[13px] py-2.5 text-sm outline-none focus:border-green"
                  />
                  {coupon ? (
                    <button
                      type="button"
                      onClick={() => {
                        setCoupon(null);
                        setCouponCode("");
                      }}
                      className="rounded-full border border-[#dcd6ca] px-4 text-sm font-bold"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={couponLoading || !couponCode.trim()}
                      onClick={applyCoupon}
                      className="rounded-full bg-green-dark px-4 text-sm font-bold text-white disabled:opacity-60"
                    >
                      {couponLoading ? "..." : "Apply"}
                    </button>
                  )}
                </div>
                {couponError ? <p className="mt-1.5 text-xs text-[#a33]">{couponError}</p> : null}
              </div>
              <div className="mt-3 flex justify-between border-t border-[#eee] pt-3 text-lg font-black sm:text-xl">
                <span>Total</span>
                <span>{money(grandTotal)}</span>
              </div>
            </>
          )}
        </aside>
      </div>
    </section>
  );
}

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={`flex flex-col gap-1.5 text-[13px] font-bold ${full ? "sm:col-span-2" : ""}`}>
      {label}
      <div className="font-normal [&_input]:w-full [&_input]:rounded-[11px] [&_input]:border [&_input]:border-[#dcd6ca] [&_input]:px-[13px] [&_input]:py-3 [&_input]:outline-none [&_input]:focus:border-green [&_textarea]:w-full [&_textarea]:rounded-[11px] [&_textarea]:border [&_textarea]:border-[#dcd6ca] [&_textarea]:px-[13px] [&_textarea]:py-3 [&_textarea]:outline-none [&_textarea]:focus:border-green">
        {children}
      </div>
    </label>
  );
}
