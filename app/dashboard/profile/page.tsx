"use client";

import Link from "next/link";
import { useCustomerAuth } from "@/lib/api/auth";

function formatAddress(addr: Record<string, unknown> | undefined | null) {
  if (!addr || typeof addr !== "object") return null;
  const parts = [
    addr.line1,
    addr.line2,
    [addr.city, addr.state].filter(Boolean).join(", "),
    [addr.postal_code, addr.country].filter(Boolean).join(" "),
  ].filter(Boolean);
  return parts.length ? parts.map(String).join("\n") : null;
}

export default function DashboardProfilePage() {
  const { customer } = useCustomerAuth();
  const addrText = formatAddress(customer?.default_address as Record<string, unknown> | undefined);

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-green-dark sm:text-2xl">Profile</h1>
          <p className="mt-1 text-sm text-muted">Your account information for this store.</p>
        </div>
        <Link
          href="/dashboard/profile/edit"
          className="inline-flex justify-center rounded-lg bg-green-dark px-4 py-2 text-sm font-medium text-white transition hover:opacity-95"
        >
          Update profile
        </Link>
      </div>

      <dl className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
        <Row label="Full name" value={customer?.full_name || "-"} />
        <Row label="Email" value={customer?.email || "-"} />
        <Row label="Phone" value={customer?.phone || "-"} />
        <div className="grid gap-1 px-4 py-3 sm:grid-cols-3 sm:gap-4 sm:px-5 sm:py-4">
          <dt className="text-sm text-muted">Default address</dt>
          <dd className="whitespace-pre-line text-sm text-green-dark sm:col-span-2">
            {addrText || (
              <span className="text-muted">
                Not set.{" "}
                <Link href="/dashboard/address" className="text-green underline">
                  Add address
                </Link>
              </span>
            )}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 px-4 py-3 sm:grid-cols-3 sm:gap-4 sm:px-5 sm:py-4">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="break-all text-sm font-medium text-green-dark sm:col-span-2">{value}</dd>
    </div>
  );
}
