"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { IconChevronLeft, IconEye } from "@/components/Icons";
import instance from "@/lib/api/axios";
import { ApiLink } from "@/lib/api/apiLink";
import { formatDate, formatMoney, type DashboardOrder } from "@/lib/dashboard";

function returnStatusLabel(returnStatus: unknown) {
  if (!returnStatus) return "";
  const key = String(returnStatus).toLowerCase();
  const labels: Record<string, string> = {
    requested: "Return pending review",
    approved: "Return approved",
    rejected: "Return declined",
    received: "Return received",
    refunded: "Refunded",
    cancelled: "Return cancelled",
  };
  return labels[key] || String(returnStatus);
}

export default function DashboardOrdersPage() {
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [meta, setMeta] = useState({ page: 1, lastPage: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await instance.get(ApiLink.ecommerceCustomerOrders, {
        params: { page, per_page: 20 },
      });
      const payload = data.data;
      const rows = Array.isArray(payload?.data) ? payload.data : [];
      setOrders(rows);
      setMeta({
        page: payload?.current_page ?? 1,
        lastPage: payload?.last_page ?? 1,
      });
    } catch {
      setError("Could not load orders.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(1);
  }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-green hover:underline"
        >
          <IconChevronLeft className="h-4 w-4 shrink-0" />
          Return to dashboard
        </Link>
        <h1 className="text-xl font-semibold text-green-dark sm:text-2xl">Orders</h1>
        <p className="mt-1 text-sm text-muted">Your recent orders from this store.</p>
      </div>

      {loading ? (
        <div className="rounded-xl border border-line bg-white p-10 text-center text-muted">Loading orders…</div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border border-line bg-white p-10 text-center text-muted">You have no orders yet.</div>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li key={order.id} className="space-y-3 rounded-xl border border-line bg-white p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-green-dark">{order.reference_number || order.id}</p>
                  <p className="mt-1 text-sm text-muted">{formatDate(order.created_at)}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full bg-cream-2 px-2 py-0.5 text-xs capitalize text-green-dark">
                      {order.status || "submitted"}
                    </span>
                    {order.payment_status ? (
                      <span className="rounded-full bg-cream-2 px-2 py-0.5 text-xs capitalize text-muted">
                        Payment: {order.payment_status}
                      </span>
                    ) : null}
                    {order.payment_method ? (
                      <span className="rounded-full bg-cream-2 px-2 py-0.5 text-xs uppercase text-muted">
                        {order.payment_method}
                      </span>
                    ) : null}
                    {order.return_status ? (
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-900">
                        {returnStatusLabel(order.return_status)}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    Shipping: {order.shipping?.label || order.shipping_method || "-"}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-lg font-semibold text-green-dark">
                    {formatMoney(order.grand_total, order.currency)}
                  </p>
                  {order.items?.length ? (
                    <p className="mt-1 text-xs text-muted">
                      {order.items.length} item{order.items.length === 1 ? "" : "s"}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="pt-1">
                <Link
                  href={`/dashboard/orders/${encodeURIComponent(order.id)}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-green hover:underline"
                >
                  <IconEye className="h-4 w-4" />
                  Details
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!loading && meta.lastPage > 1 ? (
        <div className="flex justify-center gap-2">
          <button
            type="button"
            disabled={meta.page <= 1}
            onClick={() => load(meta.page - 1)}
            className="rounded-lg border border-line px-4 py-2 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={meta.page >= meta.lastPage}
            onClick={() => load(meta.page + 1)}
            className="rounded-lg border border-line px-4 py-2 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
