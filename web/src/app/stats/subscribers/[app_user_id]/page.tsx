"use client";

import { checkAdmin } from "@/app/home/database/utils";
import Footer from "@/components/Footer";
import UnauthorizedAccess from "@/components/UnauthorizedAccess";
import AppShell from "@/components/AppShell";
import { useUser } from "@/contexts/UserContext";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getSubscriptionByAppUserId,
  getSubscriptionLogByAppUserId,
  type SubscriptionLogEventItem,
  type SubscriptionRow,
} from "../../database/utils";
import {
  formatEnvironment,
  formatTime,
  getPurchaseTypeDisplay,
  getSubscriptionDisplayTag,
  getSubscriptionStatus,
} from "../utils";
import "./detail.css";

function formatMs(ms: number | null): string {
  if (ms == null || ms <= 0) return "—";
  return formatTime(ms);
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="subscriber-detail-row">
      <dt className="subscriber-detail-label">{label}</dt>
      <dd className="subscriber-detail-value">{value}</dd>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const slug = status.toLowerCase().replace(/\s+/g, "-").replace(/[()]/g, "");
  return (
    <span
      className={`subscriber-detail-status subscriber-detail-status-${slug}`}
    >
      {status}
    </span>
  );
}

export default function SubscriberDetailPage() {
  const params = useParams();
  const appUserId =
    typeof params.app_user_id === "string" ? params.app_user_id : null;
  const { user, loading } = useUser();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(
    null,
  );
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logEvents, setLogEvents] = useState<SubscriptionLogEventItem[] | null>(
    null,
  );
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    async function verifyAdmin() {
      if (loading || !user) return;
      try {
        const adminStatus = await checkAdmin(user.uid);
        setIsAdmin(adminStatus);
      } catch (err) {
        console.error("Error checking admin status:", err);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    }
    verifyAdmin();
  }, [user, loading]);

  const fetchSubscription = useCallback(async () => {
    if (!appUserId) return;
    setLoadingData(true);
    setError(null);
    try {
      const data = await getSubscriptionByAppUserId(appUserId);
      setSubscription(data);
      if (!data) setError("Subscriber not found.");
    } catch (err) {
      console.error("Error fetching subscriber:", err);
      setError("Failed to load subscriber.");
      setSubscription(null);
    } finally {
      setLoadingData(false);
    }
  }, [appUserId]);

  useEffect(() => {
    if (!isAdmin || checkingAdmin || !appUserId) return;
    fetchSubscription();
  }, [isAdmin, checkingAdmin, appUserId, fetchSubscription]);

  const fetchHistory = useCallback(async () => {
    if (!appUserId) return;
    setLoadingHistory(true);
    setHistoryError(null);
    try {
      const events = await getSubscriptionLogByAppUserId(appUserId);
      setLogEvents(events);
    } catch (err) {
      setHistoryError(
        err instanceof Error ? err.message : "Failed to load history",
      );
      setLogEvents(null);
    } finally {
      setLoadingHistory(false);
    }
  }, [appUserId]);

  useEffect(() => {
    if (!isAdmin || !appUserId || !subscription) return;
    fetchHistory();
  }, [isAdmin, appUserId, subscription, fetchHistory]);

  const totalSpend = useMemo(() => {
    if (!logEvents?.length) return null;
    const sum = logEvents.reduce(
      (acc, ev) => acc + (typeof ev.price === "number" ? ev.price : 0),
      0,
    );
    return sum;
  }, [logEvents]);

  if (loading || checkingAdmin) {
    return (
      <div className="flex flex-col min-h-screen bg-[var(--primary)] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white font-poppins">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <UnauthorizedAccess
        title="Admin Access Required"
        message="This page is restricted to administrators only."
      />
    );
  }

  return (
    <AppShell authenticated className="bg-[var(--primary)]">
      <main className="flex flex-1 flex-col p-10">
        <div className="subscriber-detail-container">
          <Link
            href="/stats/subscribers"
            className="subscriber-detail-back"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Back to Subscribers</span>
          </Link>

          {!appUserId ? (
            <div className="subscriber-detail-error">
              Invalid subscriber ID.
            </div>
          ) : loadingData ? (
            <div className="subscriber-detail-loading">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
              <p>Loading subscriber...</p>
            </div>
          ) : error || !subscription ? (
            <div className="subscriber-detail-error">
              {error ?? "Subscriber not found."}
              <button
                type="button"
                className="subscriber-detail-retry"
                onClick={() => fetchSubscription()}
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <h1 className="subscriber-detail-title">Subscriber details</h1>
              <p className="subscriber-detail-subtitle"></p>

              <section className="subscriber-detail-card">
                <h2 className="subscriber-detail-card-title">Identity</h2>
                <dl className="subscriber-detail-dl">
                  <DetailRow
                    label="App User ID"
                    value={subscription.app_user_id}
                  />
                  <DetailRow
                    label="Original App User ID"
                    value={subscription.original_app_user_id ?? "—"}
                  />
                  <DetailRow label="Email" value={subscription.email ?? "—"} />
                  <DetailRow
                    label="Display name"
                    value={subscription.display_name ?? "—"}
                  />
                  <DetailRow
                    label="Phone"
                    value={subscription.phone_number ?? "—"}
                  />
                </dl>
              </section>

              <section className="subscriber-detail-card">
                <h2 className="subscriber-detail-card-title">Subscription</h2>
                <dl className="subscriber-detail-dl">
                  <DetailRow
                    label="Status"
                    value={
                      <StatusBadge
                        status={getSubscriptionStatus(subscription)}
                      />
                    }
                  />
                  <DetailRow
                    label="Product"
                    value={getSubscriptionDisplayTag(subscription.product_id)}
                  />
                  <DetailRow
                    label="Product ID (raw)"
                    value={subscription.product_id ?? "—"}
                  />
                  <DetailRow
                    label="Purchase type"
                    value={getPurchaseTypeDisplay(subscription.last_event_type)}
                  />
                  <DetailRow
                    label="Entitlement IDs"
                    value={
                      subscription.entitlement_ids?.length
                        ? subscription.entitlement_ids.join(", ")
                        : "—"
                    }
                  />
                  <DetailRow
                    label="Period type"
                    value={subscription.period_type ?? "—"}
                  />
                  <DetailRow
                    label="Purchased at"
                    value={formatTime(subscription.purchased_at_ms)}
                  />
                  <DetailRow
                    label="Expiration at"
                    value={formatTime(subscription.expiration_at_ms)}
                  />
                  <DetailRow
                    label="Environment"
                    value={formatEnvironment(subscription.environment)}
                  />
                  <DetailRow label="Store" value={subscription.store ?? "—"} />
                  {totalSpend !== null && (
                    <DetailRow
                      label="Total spend"
                      value={new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                        minimumFractionDigits: 2,
                      }).format(totalSpend)}
                    />
                  )}
                </dl>
              </section>

              <section className="subscriber-detail-card">
                <h2 className="subscriber-detail-card-title">Last event</h2>
                <dl className="subscriber-detail-dl">
                  <DetailRow
                    label="Event type"
                    value={subscription.last_event_type ?? "—"}
                  />
                  <DetailRow
                    label="Event ID"
                    value={subscription.last_event_id ?? "—"}
                  />
                  <DetailRow
                    label="Cancel reason"
                    value={subscription.cancel_reason ?? "—"}
                  />
                  <DetailRow
                    label="Expiration reason"
                    value={subscription.expiration_reason ?? "—"}
                  />
                  <DetailRow
                    label="Renewal number"
                    value={
                      subscription.renewal_number != null
                        ? String(subscription.renewal_number)
                        : "—"
                    }
                  />
                  <DetailRow
                    label="Transaction ID"
                    value={subscription.transaction_id ?? "—"}
                  />
                  <DetailRow
                    label="Original transaction ID"
                    value={subscription.original_transaction_id ?? "—"}
                  />
                </dl>
              </section>

              {/* Subscription history (from webhook log) */}
              <section className="subscriber-detail-card">
                <h2 className="subscriber-detail-card-title">
                  Subscription history
                </h2>
                {loadingHistory ? (
                  <div className="subscriber-detail-rc-loading">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    <span>Loading history…</span>
                  </div>
                ) : historyError ? (
                  <div className="subscriber-detail-rc-error">
                    {historyError}
                    <button
                      type="button"
                      className="subscriber-detail-retry"
                      onClick={() => fetchHistory()}
                    >
                      Retry
                    </button>
                  </div>
                ) : logEvents && logEvents.length > 0 ? (
                  <>
                    <p className="subscriber-detail-muted">
                      All events from subscription log (purchases, renewals,
                      cancellations, expirations). Newest first.
                    </p>
                    <div className="subscriber-detail-table-wrap">
                      <table className="subscriber-detail-table">
                        <thead>
                          <tr>
                            <th>Event</th>
                            <th>Product</th>
                            <th>Store</th>
                            <th>Purchased at</th>
                          </tr>
                        </thead>
                        <tbody>
                          {logEvents.map((ev, i) => (
                            <tr key={i}>
                              <td>{ev.type}</td>
                              <td>
                                {(getSubscriptionDisplayTag(
                                  ev.product_id ?? null,
                                ) ||
                                  ev.product_id) ??
                                  "—"}
                              </td>
                              <td>{ev.store ?? "—"}</td>
                              <td>{formatMs(ev.purchased_at_ms)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <p className="subscriber-detail-muted">
                    No subscription events yet. Events appear here when
                    RevenueCat webhooks are received.
                  </p>
                )}
              </section>
            </>
          )}
        </div>
      </main>
      <Footer />
    </AppShell>
  );
}
