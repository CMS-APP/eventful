"use client";

import { checkAdmin } from "@/app/app/home/database/utils";
import Footer from "@/components/Footer";
import UnauthorizedAccess from "@/components/UnauthorizedAccess";
import WebAppHeader from "@/components/WebAppHeader";
import { useUser } from "@/contexts/UserContext";
import { faArrowLeft, faCreditCard } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getSubscriptions, type SubscriptionRow } from "../database/utils";
import "./subscribers.css";
import {
  formatEnvironment,
  formatTime as formatSubscriptionTime,
  getPurchaseTypeDisplay,
  getSubscriptionDisplayTag,
  getSubscriptionStatus,
} from "./utils";

export default function SubscribersPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [rows, setRows] = useState<SubscriptionRow[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const fetchSubscriptions = useCallback(async () => {
    setLoadingData(true);
    setError(null);
    try {
      const list = await getSubscriptions();
      setRows(list);
    } catch (err) {
      console.error("Error fetching subscribers:", err);
      setError("Failed to load subscribers. Please try again.");
      setRows([]);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin || checkingAdmin) return;
    fetchSubscriptions();
  }, [isAdmin, checkingAdmin, fetchSubscriptions]);

  const PAGE_SIZE = 50;
  const [currentPage, setCurrentPage] = useState(1);
  type SubscriberTab = "active" | "cancelled";
  const [tab, setTab] = useState<SubscriberTab>("active");

  const copyEmailToClipboard = useCallback((value: string) => {
    navigator.clipboard.writeText(value);
  }, []);

  const USER_ID_TRUNCATE_LEN = 16;

  const sortedRows = useMemo(
    () =>
      [...rows].sort(
        (a, b) => (b.purchased_at_ms ?? 0) - (a.purchased_at_ms ?? 0),
      ),
    [rows],
  );

  const filteredRows = useMemo(() => {
    return sortedRows.filter((row) => {
      const status = getSubscriptionStatus(row);
      return tab === "active" ? status !== "Cancelled" : status === "Cancelled";
    });
  }, [sortedRows, tab]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const paginatedRows = useMemo(
    () =>
      filteredRows.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
      ),
    [filteredRows, currentPage],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [rows.length]);

  useEffect(() => {
    setCurrentPage(1);
  }, [tab]);

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
        message="This page is restricted to administrators only. Please contact an administrator if you believe you should have access."
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--primary)]">
      <WebAppHeader />
      <main className="flex flex-grow flex-col p-10">
        <div className="subscribers-page-container">
          <div className="subscribers-page-header">
            <Link href="/app/stats" className="subscribers-back-link">
              <FontAwesomeIcon icon={faArrowLeft} />
              <span>Back to Admin Panel</span>
            </Link>
            <h1>Subscribers</h1>
            <p className="subscribers-page-subtitle">
              Users with active or past subscriptions (RevenueCat)
            </p>
          </div>

          {error && (
            <div className="subscribers-error">
              {error}
              <button
                type="button"
                className="subscribers-retry-btn"
                onClick={() => fetchSubscriptions()}
              >
                Retry
              </button>
            </div>
          )}

          {loadingData ? (
            <div className="subscribers-loading">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
              <p>Loading subscribers...</p>
            </div>
          ) : rows.length === 0 ? (
            <div className="subscribers-empty">
              <FontAwesomeIcon
                icon={faCreditCard}
                className="subscribers-empty-icon"
              />
              <p>No subscribers yet.</p>
              <p className="subscribers-empty-hint">
                Subscription data appears here when RevenueCat webhooks are
                received.
              </p>
            </div>
          ) : (
            <>
              <div className="subscribers-tabs">
                <button
                  type="button"
                  className={`subscribers-tab ${tab === "active" ? "subscribers-tab-active" : ""}`}
                  onClick={() => setTab("active")}
                >
                  Active
                </button>
                <button
                  type="button"
                  className={`subscribers-tab ${tab === "cancelled" ? "subscribers-tab-active" : ""}`}
                  onClick={() => setTab("cancelled")}
                >
                  Cancelled
                </button>
              </div>
              {filteredRows.length === 0 ? (
                <div className="subscribers-tab-empty">
                  <p>
                    {tab === "active"
                      ? "No active subscribers."
                      : "No cancelled subscribers."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="subscribers-table-wrapper">
                    <table className="subscribers-table">
                      <thead>
                        <tr>
                          <th>Email</th>
                          <th>Subscription</th>
                          <th>Type</th>
                          <th>Subscription time</th>
                          <th>Environment</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedRows.map((row) => (
                          <tr
                            key={row.app_user_id}
                            className="subscribers-row-clickable"
                            onClick={() =>
                              router.push(
                                `/app/stats/subscribers/${encodeURIComponent(row.app_user_id)}`,
                              )
                            }
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                router.push(
                                  `/app/stats/subscribers/${encodeURIComponent(row.app_user_id)}`,
                                );
                              }
                            }}
                          >
                            <td>
                              {(() => {
                                const value =
                                  row.email?.trim() || row.app_user_id;
                                if (!value) return "—";
                                const isUserId = value === row.app_user_id;
                                const displayText =
                                  isUserId &&
                                  value.length > USER_ID_TRUNCATE_LEN
                                    ? `${value.slice(0, USER_ID_TRUNCATE_LEN)}…`
                                    : value;
                                return (
                                  <button
                                    type="button"
                                    className={`subscribers-email-copy ${isUserId ? "subscribers-email-copy-id" : ""}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyEmailToClipboard(value);
                                    }}
                                    title={value}
                                  >
                                    {displayText}
                                  </button>
                                );
                              })()}
                            </td>
                            <td>{getSubscriptionDisplayTag(row.product_id)}</td>
                            <td>
                              {(() => {
                                const typeDisplay = getPurchaseTypeDisplay(
                                  row.last_event_type,
                                );
                                if (typeDisplay === "—") return "—";
                                return (
                                  <span
                                    className={`subscribers-type subscribers-type-${typeDisplay.toLowerCase()}`}
                                  >
                                    {typeDisplay}
                                  </span>
                                );
                              })()}
                            </td>
                            <td className="subscribers-cell-time">
                              {formatSubscriptionTime(row.purchased_at_ms)}
                            </td>
                            <td>
                              <span
                                className={`subscribers-env ${
                                  row.environment === "PRODUCTION"
                                    ? "subscribers-env-production"
                                    : row.environment === "SANDBOX"
                                      ? "subscribers-env-sandbox"
                                      : "subscribers-env-default"
                                }`}
                              >
                                {formatEnvironment(row.environment)}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`subscribers-status subscribers-status-${getSubscriptionStatus(row).toLowerCase().replace(/\s+/g, "-").replace(/[()]/g, "")}`}
                              >
                                {getSubscriptionStatus(row)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="subscribers-pagination">
                    <span className="subscribers-pagination-info">
                      Showing {(currentPage - 1) * PAGE_SIZE + 1}–
                      {Math.min(currentPage * PAGE_SIZE, filteredRows.length)}{" "}
                      of {filteredRows.length}
                    </span>
                    <div className="subscribers-pagination-buttons">
                      <button
                        type="button"
                        className="subscribers-pagination-btn"
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage <= 1}
                      >
                        Previous
                      </button>
                      <span className="subscribers-pagination-page">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        type="button"
                        className="subscribers-pagination-btn"
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage >= totalPages}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
