"use client";

import {
  faChartLine,
  faCoins,
  faCommentDots,
  faFilter,
  faUsers
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
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

import { useEffect, useMemo, useState } from "react";

import { checkAdmin } from "@/app/account/database/utils";
import Loading from "@/components/Loading";
import UnauthorizedAccess from "@/components/UnauthorizedAccess";
import { useUser } from "@/contexts/UserContext";
import { type FunnelStep, getFunnelStats } from "@/lib/analytics";
import {
  type RevenueCatDailyStat,
  getRevenueCatStats
} from "@/lib/subscriptions";

import {
  type ActiveUserStatsPoint,
  type TotalUserStatsPoint,
  getActiveUserStatsHistory,
  getTotalUser,
  getTotalUserStatsHistory
} from "./database/utils";
import "./page.css";

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

function formatLastUpdated(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00Z`);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
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

function PercentChangeBadge({ value }: { value: number | null }) {
  if (value === null) return null;

  const isDecrease = value < 0;
  return (
    <span
      className={`percent-change-badge ${isDecrease ? "percent-change-badge-down" : "percent-change-badge-up"}`}
    >
      {isDecrease ? "-" : ""}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

function TrendChart<T extends { date: string }>({
  history,
  metric,
  color,
  formatValue,
  emptyMessage,
  loading,
  changePercent,
  showAverage = true
}: {
  history: T[];
  metric: keyof T;
  color: string;
  formatValue: (value: number) => string;
  emptyMessage: string;
  loading: boolean;
  changePercent?: number | null;
  showAverage?: boolean;
}) {
  if (loading) {
    return (
      <div className="chart-card-loading" role="status" aria-live="polite">
        <span className="chart-card-spinner" aria-hidden />
        <span>Loading...</span>
      </div>
    );
  }

  if (history.length === 0) {
    return <p className="chart-card-empty">{emptyMessage}</p>;
  }

  const latest = Number(history[history.length - 1][metric]) || 0;
  const values = history.map((p) => Number(p[metric]) || 0);
  const average = values.reduce((sum, v) => sum + v, 0) / values.length;

  return (
    <div>
      <div className="chart-card-summary">
        <span className="chart-card-summary-value">{formatValue(latest)}</span>
        {changePercent !== undefined && (
          <PercentChangeBadge value={changePercent} />
        )}
        <span className="chart-card-summary-label">
          on {formatShortDate(history[history.length - 1].date)}
          {showAverage && <> · avg {formatValue(average)}</>}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart
          data={history}
          margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
        >
          <CartesianGrid stroke="rgba(255, 255, 255, 0.08)" vertical={false} />
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
          {showAverage && (
            <ReferenceLine
              y={average}
              stroke="rgba(255, 255, 255, 0.4)"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              ifOverflow="extendDomain"
            />
          )}
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

const FUNNEL_STEP_OPACITY = [1, 0.72, 0.48, 0.32];

const FUNNEL_CHART_WIDTH = 1000;
const FUNNEL_CHART_HEIGHT = 220;
const FUNNEL_MAX_BAR_HEIGHT = 180;

function FunnelChart({
  steps,
  loading
}: {
  steps: FunnelStep[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="chart-card-loading" role="status" aria-live="polite">
        <span className="chart-card-spinner" aria-hidden />
        <span>Loading...</span>
      </div>
    );
  }

  if (steps.length === 0 || steps.every((step) => step.users === 0)) {
    return (
      <p className="chart-card-empty">
        No funnel data yet from Firebase Analytics for this range.
      </p>
    );
  }

  const maxUsers = Math.max(...steps.map((step) => step.users), 1);

  const segmentWidth = FUNNEL_CHART_WIDTH / steps.length;
  const midY = FUNNEL_CHART_HEIGHT / 2;
  const barHeights = steps.map(
    (step) => Math.max(step.users / maxUsers, 0.03) * FUNNEL_MAX_BAR_HEIGHT
  );

  return (
    <div>
      <div className="funnel">
        <svg
          className="funnel-svg"
          viewBox={`0 0 ${FUNNEL_CHART_WIDTH} ${FUNNEL_CHART_HEIGHT}`}
          preserveAspectRatio="none"
          aria-hidden
        >
          {steps.map((step, index) => {
            const xStart = index * segmentWidth;
            const xEnd = xStart + segmentWidth;
            const xMid = (xStart + xEnd) / 2;
            const hStart = barHeights[index];
            const hEnd = barHeights[index + 1] ?? barHeights[index];
            const topStart = midY - hStart / 2;
            const topEnd = midY - hEnd / 2;
            const bottomStart = midY + hStart / 2;
            const bottomEnd = midY + hEnd / 2;
            const path = [
              `M ${xStart} ${topStart}`,
              `C ${xMid} ${topStart}, ${xMid} ${topEnd}, ${xEnd} ${topEnd}`,
              `L ${xEnd} ${bottomEnd}`,
              `C ${xMid} ${bottomEnd}, ${xMid} ${bottomStart}, ${xStart} ${bottomStart}`,
              "Z"
            ].join(" ");

            return (
              <path
                key={step.id}
                d={path}
                fill={GROWTH_COLOR}
                opacity={FUNNEL_STEP_OPACITY[index] ?? 0.32}
              />
            );
          })}
          {steps.slice(1).map((step, index) => (
            <line
              key={step.id}
              x1={(index + 1) * segmentWidth}
              y1={0}
              x2={(index + 1) * segmentWidth}
              y2={FUNNEL_CHART_HEIGHT}
              stroke="rgba(10, 26, 20, 0.35)"
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
        <div className="funnel-labels">
          {steps.map((step, index) => {
            const previous = index > 0 ? steps[index - 1] : null;
            const conversionFromPrevious =
              previous && previous.users > 0
                ? (step.users / previous.users) * 100
                : null;

            return (
              <div className="funnel-label" key={step.id}>
                <span className="funnel-label-name">{step.label}</span>
                <span className="funnel-label-value">
                  {step.users.toLocaleString()}
                </span>
                {conversionFromPrevious !== null && (
                  <span className="funnel-label-conversion">
                    {conversionFromPrevious.toFixed(0)}% of previous step
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
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
  const [totalUserHistory, setTotalUserHistory] = useState<
    TotalUserStatsPoint[]
  >([]);
  const [subscriptionHistory, setSubscriptionHistory] = useState<
    RevenueCatDailyStat[]
  >([]);
  const [activeSubscriptions, setActiveSubscriptions] = useState<number | null>(
    null
  );
  const [mrrChangePercent, setMrrChangePercent] = useState<number | null>(null);
  const [
    activeSubscriptionsChangePercent,
    setActiveSubscriptionsChangePercent
  ] = useState<number | null>(null);
  const [funnelSteps, setFunnelSteps] = useState<FunnelStep[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(true);
  const [loadingFunnel, setLoadingFunnel] = useState(true);

  const totalUserWeeklyHistory = useMemo(() => {
    return totalUserHistory.filter((point) => {
      const dayOfWeek = new Date(`${point.date}T00:00:00Z`).getUTCDay();
      return dayOfWeek === 0;
    });
  }, [totalUserHistory]);

  const newUserHistory = useMemo(() => {
    const diffs = totalUserHistory.slice(1).map((point, index) => ({
      date: point.date,
      newUsers: point.totalUsers - totalUserHistory[index].totalUsers
    }));
    return diffs.slice(-30);
  }, [totalUserHistory]);

  const growthLastUpdated = useMemo(() => {
    const dates = [
      totalUserHistory.at(-1)?.date,
      activeUserHistory.at(-1)?.date
    ].filter((date): date is string => Boolean(date));
    if (dates.length === 0) return null;
    return dates.sort().at(-1) ?? null;
  }, [totalUserHistory, activeUserHistory]);

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
    if (!isAdmin || checkingAdmin || !user) {
      return;
    }

    async function getUserStats() {
      try {
        const [userCount, activeUserStats, totalUserStats] = await Promise.all([
          getTotalUser(),
          getActiveUserStatsHistory(),
          getTotalUserStatsHistory()
        ]);
        setTotalUser(userCount);
        setActiveUserHistory(activeUserStats);
        setTotalUserHistory(totalUserStats);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoadingUsers(false);
      }
    }

    async function getSubscriptionStats() {
      try {
        const idToken = await user!.getIdToken();
        const {
          history,
          activeSubscriptions,
          mrrChangePercent,
          activeSubscriptionsChangePercent
        } = await getRevenueCatStats(idToken, 30);
        setSubscriptionHistory(history);
        setActiveSubscriptions(activeSubscriptions);
        setMrrChangePercent(mrrChangePercent);
        setActiveSubscriptionsChangePercent(activeSubscriptionsChangePercent);
      } catch (error) {
        console.error("Error fetching subscription stats:", error);
      } finally {
        setLoadingSubscriptions(false);
      }
    }

    async function getFunnelData() {
      try {
        const idToken = await user!.getIdToken();
        const steps = await getFunnelStats(idToken, 30);
        setFunnelSteps(steps);
      } catch (error) {
        console.error("Error fetching funnel stats:", error);
      } finally {
        setLoadingFunnel(false);
      }
    }

    getUserStats();
    getSubscriptionStats();
    getFunnelData();
  }, [isAdmin, checkingAdmin, user]);

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
              {!loadingSubscriptions && activeSubscriptions !== null && (
                <p className="chart-card-active-subs">
                  <FontAwesomeIcon icon={faUsers} />
                  {activeSubscriptions.toLocaleString()} active subscriptions
                  <PercentChangeBadge
                    value={activeSubscriptionsChangePercent}
                  />
                </p>
              )}
              <TrendChart
                history={subscriptionHistory}
                metric="mrr"
                color={REVENUE_COLOR}
                formatValue={formatCurrency}
                emptyMessage="No subscription data yet from RevenueCat for this range."
                loading={loadingSubscriptions}
                changePercent={mrrChangePercent}
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
                loading={loadingSubscriptions}
              />
            </section>
          </div>
        </div>

        <div className="charts-section">
          <h2 className="charts-section-title">Growth</h2>
          <p className="charts-section-subtitle">
            Updates daily at 12:00 UTC
            {growthLastUpdated
              ? ` · Data last updated ${formatLastUpdated(growthLastUpdated)}`
              : ""}
          </p>
          <div className="charts-grid">
            <section className="chart-card">
              <h2 className="chart-card-title">
                <FontAwesomeIcon icon={faUsers} />
                Total users (weekly)
              </h2>
              <TrendChart
                history={totalUserWeeklyHistory}
                metric="totalUsers"
                color={GROWTH_COLOR}
                formatValue={(v) => v.toLocaleString()}
                emptyMessage="No total user history yet — daily tracking started today. Check back tomorrow to see the trend build up."
                loading={loadingUsers}
                showAverage={false}
              />
            </section>

            <section className="chart-card">
              <h2 className="chart-card-title">
                <FontAwesomeIcon icon={faUsers} />
                New users per day (last 30 days)
              </h2>
              <TrendChart
                history={newUserHistory}
                metric="newUsers"
                color={GROWTH_COLOR}
                formatValue={(v) => v.toLocaleString()}
                emptyMessage="No new-user history yet — daily tracking started today. Check back tomorrow to see the trend build up."
                loading={loadingUsers}
              />
            </section>

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
                  loading={loadingUsers}
                />
              </section>
            ))}
          </div>
        </div>

        <div className="charts-section">
          <h2 className="charts-section-title">
            Acquisition funnel (last 30 days)
          </h2>
          <section className="chart-card chart-card-full">
            <h2 className="chart-card-title">
              <FontAwesomeIcon icon={faFilter} />
              Downloads → Signup → Onboarding (last 30 days)
            </h2>
            <FunnelChart steps={funnelSteps} loading={loadingFunnel} />
          </section>
        </div>
      </div>
    </main>
  );
}
