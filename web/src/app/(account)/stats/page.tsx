"use client";

import { checkAdmin } from "@/app/account/database/utils";
import Loading from "@/components/Loading";
import UnauthorizedAccess from "@/components/UnauthorizedAccess";
import { useUser } from "@/contexts/UserContext";
import { getRevenueCatHistory, type RevenueCatDailyStat } from "@/lib/subscriptions";
import {
  faChartLine,
  faCoins,
  faCommentDots,
  faUsers
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  type ActiveUserStatsPoint,
  getActiveUserStatsHistory,
  getTotalUser
} from "./database/utils";
import "./page.css";

// Validated against this app's dark surface (#0a3b2e) — see dataviz skill.
const GROWTH_COLOR = "#199e70";
const REVENUE_COLOR = "#c98500";

const AXIS_TICK = { fontSize: 11, fill: "rgba(255, 255, 255, 0.55)" };
const TOOLTIP_STYLE = {
  background: "rgba(10, 10, 10, 0.92)",
  border: "1px solid rgba(255, 255, 255, 0.15)",
  borderRadius: 8,
  color: "#fff",
  fontSize: 13
};

function formatShortDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00Z`);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  });
}

function formatCurrency(value: number): string {
  return value.toLocaleString("en-GB", {
    style: "currency",
    currency: "GBP",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0
  });
}

function TrendChart<T extends { date: string }>({
  history,
  metric,
  color,
  formatValue,
  emptyMessage
}: {
  history: T[];
  metric: keyof T;
  color: string;
  formatValue: (value: number) => string;
  emptyMessage: string;
}) {
  if (history.length === 0) {
    return <p className="chart-card-empty">{emptyMessage}</p>;
  }

  const latest = Number(history[history.length - 1][metric]) || 0;
  const values = history.map((p) => Number(p[metric]) || 0);
  const average = values.reduce((sum, v) => sum + v, 0) / values.length;

  return (
    <div>
      <div className="chart-card-summary">
        <span className="chart-card-summary-value">
          {formatValue(latest)}
        </span>
        <span className="chart-card-summary-label">
          on {formatShortDate(history[history.length - 1].date)} · avg{" "}
          {formatValue(average)}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={history} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid
            stroke="rgba(255, 255, 255, 0.08)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tickFormatter={formatShortDate}
            tick={AXIS_TICK}
            axisLine={false}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            domain={["auto", "auto"]}
            tickFormatter={(v) => formatValue(Number(v))}
            tick={AXIS_TICK}
            axisLine={false}
            tickLine={false}
            width={56}
          />
          <Tooltip
            separator=""
            contentStyle={TOOLTIP_STYLE}
            labelFormatter={(label) => formatShortDate(String(label))}
            formatter={(value) => [formatValue(Number(value)), ""]}
          />
          <ReferenceLine
            y={average}
            stroke="rgba(255, 255, 255, 0.4)"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            ifOverflow="extendDomain"
          />
          <Line
            type="monotone"
            dataKey={metric as string}
            stroke={color}
            strokeWidth={2}
            dot={{ r: 3, fill: color, strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

const ACTIVE_USER_METRICS = [
  { key: "dau", label: "Daily active users" },
  { key: "mau", label: "Monthly active users" }
] as const;

export default function Stats() {
  const { user, loading } = useUser();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [totalUser, setTotalUser] = useState(0);
  const [activeUserHistory, setActiveUserHistory] = useState<
    ActiveUserStatsPoint[]
  >([]);
  const [subscriptionHistory, setSubscriptionHistory] = useState<
    RevenueCatDailyStat[]
  >([]);

  useEffect(() => {
    async function verifyAdmin() {
      if (loading || !user) {
        return;
      }

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
    // Only fetch stats if user is confirmed as admin
    if (!isAdmin || checkingAdmin || !user) {
      return;
    }

    async function getStats() {
      try {
        const [userCount, activeUserStats] = await Promise.all([
          getTotalUser(),
          getActiveUserStatsHistory()
        ]);
        setTotalUser(userCount);
        setActiveUserHistory(activeUserStats);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }

      try {
        const idToken = await user!.getIdToken();
        const subscriptionStats = await getRevenueCatHistory(idToken, 30);
        setSubscriptionHistory(subscriptionStats);
      } catch (error) {
        console.error("Error fetching subscription stats:", error);
      }
    }

    getStats();
  }, [isAdmin, checkingAdmin, user]);

  // Show loading state while checking
  if (loading || checkingAdmin) {
    return <Loading />;
  }

  // Show unauthorized access page if not admin
  if (!isAdmin) {
    return (
      <UnauthorizedAccess
        title="Admin Access Required"
        message="This page is restricted to administrators only. Please contact an administrator if you believe you should have access."
      />
    );
  }

  // Admin users can see the stats page
  return (
    <main className="flex flex-1 flex-col p-10">
        <div className="stats-container">
          <div className="stats-header">
            <h1>Admin Panel</h1>
            <p className="stats-subtitle">Platform stats and overview</p>
          </div>

          <div className="stats-grid">
            <Link
              href="/stats/feedback"
              className="stat-card stat-card-feedback stat-card-link"
            >
              <div className="stat-icon-wrapper">
                <FontAwesomeIcon icon={faCommentDots} className="stat-icon" />
              </div>
              <div className="stat-content">
                <h2 className="stat-label">App Feedback</h2>
                <p className="stat-value stat-value-link">View all</p>
              </div>
            </Link>

            <Link
              href="/stats/users"
              className="stat-card stat-card-users stat-card-link"
            >
              <div className="stat-icon-wrapper">
                <FontAwesomeIcon icon={faUsers} className="stat-icon" />
              </div>
              <div className="stat-content">
                <h2 className="stat-label">Total Users</h2>
                <p className="stat-value">{totalUser.toLocaleString()}</p>
              </div>
            </Link>
          </div>

          <div className="charts-section">
            <h2 className="charts-section-title">Revenue</h2>
            <div className="charts-grid">
              <section className="chart-card">
                <h2 className="chart-card-title">
                  <FontAwesomeIcon icon={faCoins} />
                  MRR (last 30 days)
                </h2>
                <TrendChart
                  history={subscriptionHistory}
                  metric="mrr"
                  color={REVENUE_COLOR}
                  formatValue={formatCurrency}
                  emptyMessage="No subscription data yet from RevenueCat for this range."
                />
              </section>

              <section className="chart-card">
                <h2 className="chart-card-title">
                  <FontAwesomeIcon icon={faCoins} />
                  Revenue per day (last 30 days)
                </h2>
                <TrendChart
                  history={subscriptionHistory}
                  metric="revenue"
                  color={REVENUE_COLOR}
                  formatValue={formatCurrency}
                  emptyMessage="No subscription data yet from RevenueCat for this range."
                />
              </section>
            </div>
          </div>

          <div className="charts-section">
            <h2 className="charts-section-title">Active users</h2>
            <div className="charts-grid">
              {ACTIVE_USER_METRICS.map(({ key, label }) => (
                <section className="chart-card" key={key}>
                  <h2 className="chart-card-title">
                    <FontAwesomeIcon icon={faChartLine} />
                    {label}
                  </h2>
                  <TrendChart
                    history={activeUserHistory}
                    metric={key}
                    color={GROWTH_COLOR}
                    formatValue={(v) => v.toLocaleString()}
                    emptyMessage="No activity history yet — daily tracking started today. Check back tomorrow to see the trend build up."
                  />
                </section>
              ))}
            </div>
          </div>
        </div>
    </main>
  );
}
