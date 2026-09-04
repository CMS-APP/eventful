"use client";

import {
  faArrowLeft,
  faChartLine,
  faCoins,
  faUserPlus
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

import { useEffect, useRef, useState } from "react";

import { checkAdmin } from "@/app/account/database/utils";
import Loading from "@/components/Loading";
import UnauthorizedAccess from "@/components/UnauthorizedAccess";
import { useUser } from "@/contexts/UserContext";

import {
  type RevenueCatDailyStat,
  type RevenueCatLiveStats,
  subscribeToRevenueCatDailyHistory,
  subscribeToRevenueCatLiveStats
} from "@/lib/subscriptions";
import "./subscriptions.css";

function formatShortDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00Z`);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  });
}

function formatCurrency(value: number): string {
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });
}

function DailyMetricChart({
  history,
  metric,
  formatValue
}: {
  history: RevenueCatDailyStat[];
  metric: keyof RevenueCatDailyStat;
  formatValue: (value: number) => string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const measured = entries[0]?.contentRect.width;
      if (measured) setWidth(measured);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (history.length === 0) {
    return (
      <p className="sub-activity-empty">
        No subscription activity yet — the chart fills in as RevenueCat
        events arrive.
      </p>
    );
  }

  const values = history.map((p) => Number(p[metric]) || 0);
  const max = Math.max(...values, 1);
  const latest = values[values.length - 1];

  const height = 180;
  const marginLeft = 48;
  const marginBottom = 24;
  const marginTop = 10;
  const plotWidth = width - marginLeft;
  const plotHeight = height - marginBottom - marginTop;

  const points = history.map((point, index) => {
    const x =
      marginLeft +
      (history.length === 1
        ? plotWidth / 2
        : (index / (history.length - 1)) * plotWidth);
    const y =
      marginTop + plotHeight - ((Number(point[metric]) || 0) / max) * plotHeight;
    return { x, y, point };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const gridLines = [0, 0.5, 1];
  const labelIndexes = Array.from(
    new Set([0, Math.floor((history.length - 1) / 2), history.length - 1])
  );

  return (
    <div ref={containerRef}>
      <div className="sub-activity-summary">
        <span className="sub-activity-summary-value">
          {formatValue(latest)}
        </span>
        <span className="sub-activity-summary-label">
          on {formatShortDate(history[history.length - 1].date)}
        </span>
      </div>
      <svg
        className="sub-activity-svg"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      >
        {gridLines.map((fraction) => {
          const y = marginTop + plotHeight - fraction * plotHeight;
          return (
            <g key={fraction}>
              <line
                x1={marginLeft}
                x2={width}
                y1={y}
                y2={y}
                className="sub-activity-gridline"
              />
              <text x={0} y={y + 4} className="sub-activity-axis-label">
                {formatValue(Math.round(max * fraction))}
              </text>
            </g>
          );
        })}

        <path d={linePath} className="sub-activity-line" fill="none" />

        {points.map(({ x, y, point }, index) => (
          <circle
            key={point.date}
            cx={x}
            cy={y}
            r={index === points.length - 1 ? 6 : 3.5}
            className="sub-activity-dot"
          >
            <title>
              {formatShortDate(point.date)}:{" "}
              {formatValue(Number(point[metric]) || 0)}
            </title>
          </circle>
        ))}

        {labelIndexes.map((index, i) => (
          <text
            key={index}
            x={points[index].x}
            y={height - 6}
            textAnchor={
              i === 0
                ? "start"
                : i === labelIndexes.length - 1
                  ? "end"
                  : "middle"
            }
            className="sub-activity-axis-label sub-activity-axis-label-x"
          >
            {formatShortDate(history[index].date)}
          </text>
        ))}
      </svg>
    </div>
  );
}

export default function SubscriptionStatsPage() {
  const { user, loading } = useUser();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [live, setLive] = useState<RevenueCatLiveStats | null>(null);
  const [history, setHistory] = useState<RevenueCatDailyStat[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    async function verifyAdmin() {
      if (loading || !user) return;
      try {
        const adminStatus = await checkAdmin(user.uid);
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    }
    verifyAdmin();
  }, [user, loading]);

  useEffect(() => {
    if (!isAdmin || checkingAdmin) return;

    setLoadingData(true);
    const unsubLive = subscribeToRevenueCatLiveStats((stats) => {
      setLive(stats);
      setLoadingData(false);
    });
    const unsubHistory = subscribeToRevenueCatDailyHistory((rows) => {
      setHistory(rows);
      setLoadingData(false);
    });

    return () => {
      unsubLive();
      unsubHistory();
    };
  }, [isAdmin, checkingAdmin]);

  const today = history[history.length - 1];

  if (loading || checkingAdmin) {
    return <Loading />;
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
    <main className="flex flex-1 flex-col p-10">
      <div className="sub-stats-container">
        <div className="sub-stats-header">
          <Link href="/stats" className="sub-stats-back-link">
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Back to Admin Panel</span>
          </Link>
          <h1>Subscriptions</h1>
          <p className="sub-stats-subtitle">
            Live RevenueCat activity, updated as events arrive
          </p>
        </div>

        {loadingData && (
          <div className="sub-stats-loading" role="status" aria-live="polite">
            <span className="sub-stats-spinner" aria-hidden />
            <span>Connecting to live subscription data...</span>
          </div>
        )}

        {!loadingData && (
          <>
            <div className="sub-stats-live-grid">
              <div className="sub-live-card">
                <div className="sub-live-label">Active subscriptions</div>
                <div className="sub-live-value">
                  {(live?.activeSubscriptions ?? 0).toLocaleString()}
                  <span className="sub-live-pulse" aria-hidden />
                </div>
              </div>
              <div className="sub-live-card">
                <div className="sub-live-label">Revenue tracked</div>
                <div className="sub-live-value">
                  {formatCurrency(live?.totalRevenue ?? 0)}
                </div>
              </div>
              <div className="sub-live-card">
                <div className="sub-live-label">Last event</div>
                <div className="sub-live-value sub-live-value-small">
                  {live?.lastEventType ?? "—"}
                </div>
              </div>
            </div>

            <div className="sub-stats-grid">
              <section className="sub-stats-card">
                <h2 className="sub-stats-card-title">
                  <FontAwesomeIcon icon={faUserPlus} />
                  New subscriptions per day
                </h2>
                <DailyMetricChart
                  history={history}
                  metric="newSubscriptions"
                  formatValue={(v) => v.toLocaleString()}
                />
              </section>

              <section className="sub-stats-card">
                <h2 className="sub-stats-card-title">
                  <FontAwesomeIcon icon={faCoins} />
                  Revenue per day
                </h2>
                <DailyMetricChart
                  history={history}
                  metric="revenue"
                  formatValue={formatCurrency}
                />
              </section>

              <section className="sub-stats-card">
                <h2 className="sub-stats-card-title">
                  <FontAwesomeIcon icon={faChartLine} />
                  Today&apos;s activity
                </h2>
                <ul className="sub-stats-list">
                  <li className="sub-stats-row">
                    <span className="sub-stats-label">New subscriptions</span>
                    <span className="sub-stats-count">
                      {(today?.newSubscriptions ?? 0).toLocaleString()}
                    </span>
                  </li>
                  <li className="sub-stats-row">
                    <span className="sub-stats-label">Renewals</span>
                    <span className="sub-stats-count">
                      {(today?.renewals ?? 0).toLocaleString()}
                    </span>
                  </li>
                  <li className="sub-stats-row">
                    <span className="sub-stats-label">Cancellations</span>
                    <span className="sub-stats-count">
                      {(today?.cancellations ?? 0).toLocaleString()}
                    </span>
                  </li>
                  <li className="sub-stats-row">
                    <span className="sub-stats-label">Expirations</span>
                    <span className="sub-stats-count">
                      {(today?.expirations ?? 0).toLocaleString()}
                    </span>
                  </li>
                </ul>
              </section>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
