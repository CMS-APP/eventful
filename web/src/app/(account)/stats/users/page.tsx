"use client";

import {
  faArrowLeft,
  faChartColumn,
  faChartLine,
  faLaptop,
  faMapMarkerAlt,
  faMobileScreen
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

import { useEffect, useMemo, useRef, useState } from "react";

import { checkAdmin } from "@/app/account/database/utils";
import Loading from "@/components/Loading";
import UnauthorizedAccess from "@/components/UnauthorizedAccess";
import { useUser } from "@/contexts/UserContext";

import {
  type ActiveUserStatsPoint,
  type UserDeviceStatsRow,
  getActiveUserStatsHistory,
  getUsersForDeviceStats
} from "../database/utils";
import "./users.css";

const ACTIVE_USER_METRICS = [
  { key: "dau", label: "Daily active users" },
  { key: "wau", label: "Weekly active users" },
  { key: "mau", label: "Monthly active users" }
] as const;

type ActiveUserMetric = (typeof ACTIVE_USER_METRICS)[number]["key"];

function formatShortDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00Z`);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  });
}

function ActiveUsersChart({
  history,
  metric
}: {
  history: ActiveUserStatsPoint[];
  metric: ActiveUserMetric;
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
      <p className="user-activity-empty">
        No activity history yet — daily tracking started today. Check back
        tomorrow to see the trend build up.
      </p>
    );
  }

  const values = history.map((p) => p[metric]);
  const max = Math.max(...values, 1);
  const latest = values[values.length - 1];

  const height = 180;
  const marginLeft = 36;
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
    const y = marginTop + plotHeight - (point[metric] / max) * plotHeight;
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
      <div className="user-activity-summary">
        <span className="user-activity-summary-value">
          {latest.toLocaleString()}
        </span>
        <span className="user-activity-summary-label">
          as of {formatShortDate(history[history.length - 1].date)}
        </span>
      </div>
      <svg
        className="user-activity-svg"
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
                className="user-activity-gridline"
              />
              <text x={0} y={y + 4} className="user-activity-axis-label">
                {Math.round(max * fraction).toLocaleString()}
              </text>
            </g>
          );
        })}

        <path d={linePath} className="user-activity-line" fill="none" />

        {points.map(({ x, y, point }, index) => (
          <circle
            key={point.date}
            cx={x}
            cy={y}
            r={index === points.length - 1 ? 6 : 3.5}
            className="user-activity-dot"
          >
            <title>
              {formatShortDate(point.date)}: {point[metric].toLocaleString()}
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
            className="user-activity-axis-label user-activity-axis-label-x"
          >
            {formatShortDate(history[index].date)}
          </text>
        ))}
      </svg>
    </div>
  );
}

function aggregateBy(
  rows: UserDeviceStatsRow[],
  field: keyof UserDeviceStatsRow
): { value: string; count: number }[] {
  const map = new Map<string, number>();
  for (const row of rows) {
    const v = String(row[field] ?? "unknown");
    map.set(v, (map.get(v) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count);
}

function compareVersionsDescending(a: string, b: string): number {
  if (a === b) return 0;
  if (a === "unknown") return 1;
  if (b === "unknown") return -1;

  const aParts = a.split(".").map(Number);
  const bParts = b.split(".").map(Number);
  const length = Math.max(aParts.length, bParts.length);

  for (let i = 0; i < length; i++) {
    const an = aParts[i] || 0;
    const bn = bParts[i] || 0;
    if (an !== bn) return bn - an;
  }
  return 0;
}

export default function UserStatsPage() {
  const { user, loading } = useUser();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [rows, setRows] = useState<UserDeviceStatsRow[]>([]);
  const [activeUserHistory, setActiveUserHistory] = useState<
    ActiveUserStatsPoint[]
  >([]);
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
    async function fetchData() {
      setLoadingData(true);
      try {
        const [list, history] = await Promise.all([
          getUsersForDeviceStats(),
          getActiveUserStatsHistory()
        ]);
        setRows(list);
        setActiveUserHistory(history);
      } catch (error) {
        console.error("Error fetching user stats:", error);
      } finally {
        setLoadingData(false);
      }
    }
    fetchData();
  }, [isAdmin, checkingAdmin]);

  const stats = useMemo(() => {
    const total = rows.length;
    const byPlatform = aggregateBy(rows, "platform");
    const byAppVersion = aggregateBy(rows, "appVersion").sort((a, b) =>
      compareVersionsDescending(a.value, b.value)
    );
    const byRegion = aggregateBy(rows, "region");
    const byDeviceModel = aggregateBy(rows, "deviceModel");

    return {
      total,
      byPlatform,
      byAppVersion,
      byRegion,
      byDeviceModel
    };
  }, [rows]);

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
    <>
      {loadingData && <Loading message="Loading user stats..." />}
      <main className="flex flex-1 flex-col p-10">
        <div className="user-stats-container">
          <div className="user-stats-header">
            <Link href="/stats" className="user-stats-back-link">
              <FontAwesomeIcon icon={faArrowLeft} />
              <span>Back to Admin Panel</span>
            </Link>
            <h1>User stats</h1>
            <p className="user-stats-subtitle">
              Platform, version, region and device breakdown ({stats.total}{" "}
              users)
            </p>
          </div>

          {!loadingData && (
            <div className="user-stats-grid">
              {ACTIVE_USER_METRICS.map(({ key, label }) => (
                <section className="user-stats-card" key={key}>
                  <h2 className="user-stats-card-title">
                    <FontAwesomeIcon icon={faChartLine} />
                    {label}
                  </h2>
                  <ActiveUsersChart history={activeUserHistory} metric={key} />
                </section>
              ))}

              <section className="user-stats-card">
                <h2 className="user-stats-card-title">
                  <FontAwesomeIcon icon={faMobileScreen} />
                  Platform
                </h2>
                <ul className="user-stats-list">
                  {stats.byPlatform.map(({ value, count }) => (
                    <li key={value} className="user-stats-row">
                      <span className="user-stats-label">{value}</span>
                      <span className="user-stats-count">
                        {count.toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="user-stats-card">
                <h2 className="user-stats-card-title">
                  <FontAwesomeIcon icon={faChartColumn} />
                  App version
                </h2>
                <ul className="user-stats-list">
                  {stats.byAppVersion.map(({ value, count }) => (
                    <li key={value} className="user-stats-row">
                      <span className="user-stats-label">{value}</span>
                      <span className="user-stats-count">
                        {count.toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="user-stats-card">
                <h2 className="user-stats-card-title">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  Region
                </h2>
                <ul className="user-stats-list">
                  {stats.byRegion.map(({ value, count }) => (
                    <li key={value} className="user-stats-row">
                      <span className="user-stats-label">{value}</span>
                      <span className="user-stats-count">
                        {count.toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="user-stats-card">
                <h2 className="user-stats-card-title">
                  <FontAwesomeIcon icon={faLaptop} />
                  Device model
                </h2>
                <ul className="user-stats-list">
                  {stats.byDeviceModel.map(({ value, count }) => (
                    <li key={value} className="user-stats-row">
                      <span className="user-stats-label">{value}</span>
                      <span className="user-stats-count">
                        {count.toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
