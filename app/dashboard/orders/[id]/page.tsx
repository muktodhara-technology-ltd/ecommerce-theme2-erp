"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { IconCheckCircle, IconClock, IconTruck } from "@/components/Icons";
import instance from "@/lib/api/axios";
import { ApiLink } from "@/lib/api/apiLink";
import { resolveMediaUrl } from "@/lib/api/media";
import { formatDate, formatMoney, type DashboardOrder, type DashboardOrderItem } from "@/lib/dashboard";

function statusClass(value: unknown) {
  const s = String(value || "").toLowerCase();
  if (["paid", "completed", "delivered", "success"].includes(s)) return "bg-emerald-100 text-emerald-700";
  if (["due", "pending", "processing", "partial"].includes(s)) return "bg-amber-100 text-amber-800";
  if (["failed", "cancelled", "canceled", "refunded"].includes(s)) return "bg-red-100 text-red-700";
  return "bg-cream-2 text-muted";
}

function canPayOrder(order: DashboardOrder | null) {
  const paymentStatus = String(order?.payment_status || "").toLowerCase();
  if (!["due", "pending", "unpaid", "partial"].includes(paymentStatus)) return false;
  const method = String(order?.payment_method || "").toLowerCase();
  return method !== "cod" && method !== "";
}

const RETURN_IN_PROGRESS = new Set(["requested", "approved", "refunded"]);

function canRequestOrderReturn(order: DashboardOrder | null) {
  const rs = order?.return_status;
  if (rs == null || rs === "") return true;
  return !RETURN_IN_PROGRESS.has(String(rs).toLowerCase());
}

function canCancelOrder(order: DashboardOrder | null) {
  const paymentStatus = String(order?.payment_status || "").toLowerCase();
  const status = String(order?.status || "").toLowerCase();
  return (
    ["pending", "unpaid", "due", "partial"].includes(paymentStatus) &&
    !["delivered", "completed", "cancelled", "canceled", "refunded"].includes(status)
  );
}

function canRefundOrder(order: DashboardOrder | null) {
  return String(order?.payment_status || "").toLowerCase() === "paid" && String(order?.status || "").toLowerCase() === "delivered";
}

function canShowReturnButton(order: DashboardOrder | null) {
  return String(order?.status || "").toLowerCase() === "delivered" && canRequestOrderReturn(order);
}

function getTrackingSteps(order: DashboardOrder | null) {
  const current = String(order?.status || "").toLowerCase();
  const flow = ["submitted", "processing", "shipped", "delivered"];
  const idx = flow.indexOf(current);
  const activeIndex = idx < 0 ? 0 : idx;
  return flow.map((key, index) => ({ key, done: index <= activeIndex }));
}

function paymentRedirectUrl(data: Record<string, unknown> | null | undefined) {
  if (!data) return "";
  return String(data.GatewayPageURL || data.gateway_page_url || data.redirect_url || data.payment_url || data.url || "");
}

function formatAddressLines(address: Record<string, unknown> | undefined) {
  if (!address) return [];
  return [
    address.line1,
    address.line2,
    [address.city, address.state, address.postal_code].filter(Boolean).join(", "),
    address.country,
  ]
    .map((x) => (x == null ? "" : String(x).trim()))
    .filter(Boolean);
}

function formatAttributes(attrs: Record<string, unknown> | undefined) {
  if (!attrs || typeof attrs !== "object") return "";
  return Object.entries(attrs)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");
}

function itemTitle(item: DashboardOrderItem, idx: number) {
  return item.product_name || item.name || item.product?.product_name || item.product?.name || item.title || `Item ${idx + 1}`;
}

function itemImage(item: DashboardOrderItem) {
  const raw =
    item?.product_snapshot?.image ||
    item?.image ||
    item?.image_url ||
    item?.product?.primary_or_first_image?.full_image_url ||
    item?.product?.primary_or_first_image?.image_url ||
    item?.product?.primary_or_first_image?.image_path ||
    "";
  return resolveMediaUrl(raw) || "";
}

function shippingAmount(order: DashboardOrder) {
  return order.shipping_charge ?? order.shipping_total ?? 0;
}

export default function DashboardOrderDetailPage() {
  const params = useParams();
  const id = params?.id ? String(params.id) : "";
  const [order, setOrder] = useState<DashboardOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [refunding, setRefunding] = useState(false);
  const [refundError, setRefundError] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [returnError, setReturnError] = useState("");
  const [showReturnForm, setShowReturnForm] = useState(false);

  const loadOrder = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await instance.get(ApiLink.ecommerceCustomerOrderById(id));
      const payload = data?.data;
      const row = payload?.order || payload?.data || payload || null;
      if (!row || !row.id) throw new Error("Order not found");
      setOrder(row);
    } catch {
      try {
        const { data } = await instance.get(ApiLink.ecommerceCustomerOrders, {
          params: { per_page: 100, page: 1 },
        });
        const rows = Array.isArray(data?.data?.data) ? data.data.data : [];
        const row =
          rows.find((r: DashboardOrder) => String(r?.id) === id) ||
          rows.find((r: DashboardOrder) => String(r?.reference_number) === id) ||
          null;
        if (!row) throw new Error("Order not found in list");
        setOrder(row);
      } catch {
        setError("Could not load this invoice.");
        setOrder(null);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const items = useMemo(() => (Array.isArray(order?.items) ? order.items : []), [order]);
  const totalQty = useMemo(
    () => items.reduce((sum, item) => sum + (Number(item.quantity ?? item.qty ?? 0) || 0), 0),
    [items],
  );
  const trackingSteps = useMemo(() => getTrackingSteps(order), [order]);

  async function handlePayNow() {
    if (!order?.id || !order?.payment_method) return;
    setPaying(true);
    setPaymentError("");
    try {
      const method = String(order.payment_method).toLowerCase();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const payload: Record<string, string> = {
        checkout_id: order.id,
        payment_gateway_code: method,
      };
      if (method === "sslcommerz") {
        payload.success_url = `${origin}/checkout/success?checkout_id=${order.id}`;
        payload.fail_url = `${origin}/checkout/failed`;
        payload.cancel_url = `${origin}/dashboard/orders/${encodeURIComponent(order.id)}`;
      }
      const res = await instance.post(ApiLink.ecommerceCheckoutPaymentGatewayApply, payload);
      if (!res?.data?.success) {
        setPaymentError(res?.data?.message || "Could not start payment.");
        return;
      }
      const redirect = paymentRedirectUrl(res?.data?.data);
      if (redirect) {
        window.location.href = redirect;
        return;
      }
      await loadOrder();
      setPaymentError("Payment started. If no redirect happens, please check your account updates.");
    } catch (e: unknown) {
      const message = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setPaymentError(message || "Could not start payment.");
    } finally {
      setPaying(false);
    }
  }

  async function handleCancelOrder() {
    if (!order?.id) return;
    setCancelling(true);
    setCancelError("");
    try {
      const { data } = await instance.post(ApiLink.ecommerceCustomerOrderCancel(order.id));
      if (!data?.success) {
        setCancelError(data?.message || "Could not cancel this order.");
        return;
      }
      await loadOrder();
    } catch (e: unknown) {
      const message = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setCancelError(message || "Cancel request failed.");
    } finally {
      setCancelling(false);
    }
  }

  async function handleRefundOrder() {
    if (!order?.id) return;
    setRefunding(true);
    setRefundError("");
    try {
      const { data } = await instance.post(ApiLink.ecommerceCustomerOrderRefund(order.id));
      if (!data?.success) {
        setRefundError(data?.message || "Could not request refund.");
        return;
      }
      await loadOrder();
    } catch (e: unknown) {
      const message = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setRefundError(message || "Refund request failed.");
    } finally {
      setRefunding(false);
    }
  }

  async function handleRequestReturn() {
    if (!order?.id) return;
    const reason = returnReason.trim();
    if (!reason) {
      setReturnError("Please provide a reason for return.");
      return;
    }
    setReturnSubmitting(true);
    setReturnError("");
    try {
      const { data } = await instance.post(ApiLink.ecommerceCustomerOrderReturn(order.id), { reason });
      if (!data?.success) {
        setReturnError(data?.message || "Could not submit return request.");
        return;
      }
      setReturnReason("");
      setShowReturnForm(false);
      await loadOrder();
    } catch (e: unknown) {
      const message = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setReturnError(message || "Return request failed.");
    } finally {
      setReturnSubmitting(false);
    }
  }

  if (loading) {
    return <div className="rounded-xl border border-line bg-white p-10 text-center text-muted">Loading invoice…</div>;
  }

  if (error || !order) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error || "Invoice unavailable."}</div>
        <Link href="/dashboard/orders" className="inline-flex text-sm font-medium text-green hover:underline">
          Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="invoice-print-root space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/dashboard/orders" className="no-print inline-flex text-sm font-medium text-green hover:underline">
            Back to orders
          </Link>
          <h1 className="mt-2 text-xl font-semibold text-green-dark sm:text-2xl">
            Invoice #{order.reference_number || order.id}
          </h1>
          <p className="mt-1 text-sm text-muted">Placed on {formatDate(order.created_at)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="no-print rounded-lg border border-line bg-white px-3 py-1 text-xs text-green-dark hover:bg-cream-2"
          >
            Print invoice
          </button>
          <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${statusClass(order.status)}`}>
            {order.status || "submitted"}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${statusClass(order.payment_status)}`}>
            Payment: {order.payment_status || "pending"}
          </span>
          {order.payment_method ? (
            <span className="rounded-full bg-cream-2 px-2 py-0.5 text-xs uppercase text-muted">{order.payment_method}</span>
          ) : null}
        </div>
      </div>

      <div className="print-invoice-only hidden rounded-xl border border-gray-300 bg-white p-6 text-black print:block">
        <div className="flex items-start justify-between border-b border-gray-300 pb-4">
          <div>
            <h2 className="text-2xl font-bold">INVOICE</h2>
            <p className="mt-1 text-sm text-gray-700">#{order.reference_number || order.id}</p>
            <p className="text-sm text-gray-700">Order date: {formatDate(order.created_at)}</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold">Payment</p>
            <p className="uppercase">{order.payment_method || "N/A"}</p>
            <p className="capitalize">Status: {order.payment_status || "pending"}</p>
            <p className="capitalize">Order: {order.status || "submitted"}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 border-b border-gray-200 py-4">
          <div>
            <p className="text-xs font-semibold uppercase text-gray-600">Bill To</p>
            <p className="mt-1 font-medium">{order.contact_name || "Customer"}</p>
            <p className="text-sm text-gray-700">{order.contact_email || "-"}</p>
            <p className="text-sm text-gray-700">{order.contact_phone || "-"}</p>
            <div className="mt-1 text-sm text-gray-700">
              {formatAddressLines(order.billing_address).map((line) => (
                <p key={`bill-${line}`}>{line}</p>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-gray-600">Ship To</p>
            <p className="mt-1 font-medium">{order.contact_name || "Customer"}</p>
            <div className="mt-1 text-sm text-gray-700">
              {formatAddressLines(order.shipping_address).map((line) => (
                <p key={`ship-${line}`}>{line}</p>
              ))}
            </div>
          </div>
        </div>

        <table className="mt-4 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="py-2 text-left font-semibold">Item</th>
              <th className="py-2 text-left font-semibold">Variant</th>
              <th className="py-2 text-right font-semibold">Qty</th>
              <th className="py-2 text-right font-semibold">Unit</th>
              <th className="py-2 text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const qty = Number(item.quantity ?? item.qty ?? 0) || 0;
              const unitPrice = item.unit_price ?? item.price ?? 0;
              const lineTotal = item.line_total ?? item.total ?? item.amount ?? 0;
              return (
                <tr key={item.id || `${order.id}-print-${idx}`} className="border-b border-gray-100">
                  <td className="py-2">{itemTitle(item, idx)}</td>
                  <td className="py-2 text-gray-700">
                    {formatAttributes(item.attributes_snapshot || item.attributes) || item.variant_key || "-"}
                  </td>
                  <td className="py-2 text-right">{qty}</td>
                  <td className="py-2 text-right">{formatMoney(unitPrice, order.currency)}</td>
                  <td className="py-2 text-right font-medium">{formatMoney(lineTotal, order.currency)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="ml-auto mt-4 w-full max-w-sm space-y-1 text-sm">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span>{formatMoney(order.subtotal, order.currency)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Discount</span>
            <span>-{formatMoney(order.discount_total || 0, order.currency)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Shipping</span>
            <span>{formatMoney(shippingAmount(order), order.currency)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-gray-300 pt-2 text-base font-semibold">
            <span>Grand Total</span>
            <span>{formatMoney(order.grand_total, order.currency)}</span>
          </div>
        </div>

        {order.customer_notes ? (
          <div className="mt-4 border-t border-gray-200 pt-3 text-sm">
            <p className="font-semibold">Customer note</p>
            <p className="mt-1 text-gray-700">{order.customer_notes}</p>
          </div>
        ) : null}
      </div>

      <div className="no-print grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="rounded-xl border border-line bg-white p-4">
            <h2 className="text-sm font-semibold text-green-dark">Order tracking</h2>
            <ol className="mt-3 grid gap-2 sm:grid-cols-4">
              {trackingSteps.map((step) => (
                <li
                  key={step.key}
                  className={`rounded-lg border px-3 py-2 text-xs capitalize sm:text-sm ${
                    step.done ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-line text-muted"
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {step.key === "submitted" ? <IconClock className="h-4 w-4" /> : null}
                    {step.key === "shipped" ? <IconTruck className="h-4 w-4" /> : null}
                    {step.key === "delivered" ? <IconCheckCircle className="h-4 w-4" /> : null}
                    {step.key}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="overflow-hidden rounded-xl border border-line bg-white">
            <div className="grid grid-cols-[1fr_auto_auto] gap-2 border-b border-line px-3 py-2 text-xs font-medium text-muted">
              <span>Product</span>
              <span>Qty</span>
              <span className="text-right">Total</span>
            </div>
            <ul className="divide-y divide-line">
              {items.map((item, idx) => {
                const qty = Number(item.quantity ?? item.qty ?? 0) || 0;
                const lineTotal = item.line_total ?? item.total ?? item.amount ?? 0;
                const imageUrl = itemImage(item);
                const sku = item.product_sku || item.variant_key || item.sku || "";
                return (
                  <li key={item.id || `${order.id}-${idx}`} className="grid grid-cols-[1fr_auto_auto] gap-2 px-3 py-2 text-sm">
                    <span className="flex min-w-0 items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl || "/img/logo.png"}
                        alt={itemTitle(item, idx)}
                        className="h-9 w-9 shrink-0 rounded border border-line bg-white object-contain"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = "/img/logo.png";
                        }}
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-green-dark">{itemTitle(item, idx)}</span>
                        {sku ? <span className="block truncate text-xs text-muted">SKU: {sku}</span> : null}
                      </span>
                    </span>
                    <span className="text-muted">{qty}</span>
                    <span className="text-right font-medium text-green-dark">{formatMoney(lineTotal, order.currency)}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <aside className="no-print space-y-4">
          <div className="space-y-2 rounded-xl border border-line bg-white p-4">
            <h2 className="text-sm font-semibold text-green-dark">Summary</h2>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Items ({totalQty})</span>
              <span className="font-medium text-green-dark">{formatMoney(order.subtotal, order.currency)}</span>
            </div>
            {Number(order.discount_total) > 0 ? (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Discount</span>
                <span className="font-medium text-emerald-700">-{formatMoney(order.discount_total, order.currency)}</span>
              </div>
            ) : null}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Shipping</span>
              <span className="font-medium text-green-dark">{formatMoney(shippingAmount(order), order.currency)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-line pt-2">
              <span className="font-semibold text-green-dark">Grand total</span>
              <span className="text-lg font-semibold text-green-dark">{formatMoney(order.grand_total, order.currency)}</span>
            </div>
            <p className="text-xs text-muted">Shipping: {order.shipping?.label || order.shipping_method || "-"}</p>
          </div>

          {canPayOrder(order) ? (
            <div className="space-y-3 rounded-xl border border-line bg-white p-4">
              <h3 className="text-sm font-semibold text-green-dark">Payment due</h3>
              <p className="text-xs text-muted">
                Your payment is {String(order.payment_status).toLowerCase()}. Complete payment now to confirm this order.
              </p>
              <button
                type="button"
                onClick={handlePayNow}
                disabled={paying}
                className="inline-flex w-full min-h-[44px] items-center justify-center rounded-full bg-orange px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
              >
                {paying ? "Processing…" : "Pay now"}
              </button>
              {paymentError ? <p className="text-xs text-red-700">{paymentError}</p> : null}
            </div>
          ) : null}

          {canCancelOrder(order) || canRefundOrder(order) || canShowReturnButton(order) ? (
            <div className="space-y-3 rounded-xl border border-line bg-white p-4">
              <h3 className="text-sm font-semibold text-green-dark">Order actions</h3>

              {canCancelOrder(order) ? (
                <>
                  <button
                    type="button"
                    onClick={handleCancelOrder}
                    disabled={cancelling}
                    className="inline-flex w-full min-h-[44px] items-center justify-center rounded-full border border-red-300 px-4 py-2.5 text-sm font-bold text-red-700 hover:bg-red-50 disabled:opacity-60"
                  >
                    {cancelling ? "Cancelling…" : "Cancel order"}
                  </button>
                  {cancelError ? <p className="text-xs text-red-700">{cancelError}</p> : null}
                </>
              ) : null}

              {canRefundOrder(order) ? (
                <>
                  <button
                    type="button"
                    onClick={handleRefundOrder}
                    disabled={refunding}
                    className="inline-flex w-full min-h-[44px] items-center justify-center rounded-full border border-amber-300 px-4 py-2.5 text-sm font-bold text-amber-700 hover:bg-amber-50 disabled:opacity-60"
                  >
                    {refunding ? "Requesting…" : "Refund request"}
                  </button>
                  {refundError ? <p className="text-xs text-red-700">{refundError}</p> : null}
                </>
              ) : null}

              {canShowReturnButton(order) ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReturnForm((prev) => !prev);
                      setReturnError("");
                    }}
                    className="inline-flex w-full min-h-[44px] items-center justify-center rounded-full border border-line px-4 py-2.5 text-sm font-bold text-green-dark hover:bg-cream-2"
                  >
                    {showReturnForm ? "Hide return form" : "Request return"}
                  </button>

                  {showReturnForm ? (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-green-dark">Return reason</label>
                      <textarea
                        rows={3}
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}
                        disabled={returnSubmitting}
                        placeholder="Reason for return…"
                        className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-green"
                      />
                      <button
                        type="button"
                        onClick={handleRequestReturn}
                        disabled={returnSubmitting}
                        className="inline-flex w-full min-h-[44px] items-center justify-center rounded-full bg-green-dark px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
                      >
                        {returnSubmitting ? "Submitting…" : "Submit return request"}
                      </button>
                      {returnError ? <p className="text-xs text-red-700">{returnError}</p> : null}
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          ) : null}
        </aside>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm;
          }
          body * {
            visibility: hidden !important;
          }
          .print-invoice-only,
          .print-invoice-only * {
            visibility: visible !important;
          }
          .print-invoice-only {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            display: block !important;
          }
          .no-print {
            display: none !important;
          }
          .invoice-print-root {
            color: #000 !important;
          }
          .invoice-print-root * {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
