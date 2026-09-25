"use client";

import {
  faChartLine,
  faCoins,
  faCommentDots,
  faFilter,
  faListOl,
  faUsers
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

import { useEffect, useMemo, useState } from "react";

import { Loading } from "@/components/Loading";
import { FeatureUsageChart } from "@/features/stats/components/FeatureUsageChart";
import { FunnelChart } from "@/features/stats/components/FunnelChart";
import { TrendChart } from "@/features/stats/components/TrendChart";
import { UnauthorizedAccess } from "@/features/stats/components/UnauthorizedAccess";
import { CHART_COLOR } from "@/features/stats/constants";
import {
  type ActiveUserStatsPoint,
  type TotalUserStatsPoint,
  getActiveUserStatsHistory,
  getTotalUser,
  getTotalUserStatsHistory
} from "@/features/stats/services/database";
import { useAdminGuard } from "@/features/stats/hooks/useAdminGuard";
import {
  type FeatureUsageDomain,
  type FunnelStep,
  getFeatureUsageStats,
  getFunnelStats,
  getRealtimeActiveUsers
} from "@/lib/analytics";
import { formatCurrency } from "@/lib/currency";
import { formatMediumUtcDate } from "@/lib/dates";
import {
  type RevenueCatDailyStat,
  getRevenueCatStats
} from "@/lib/subscriptions";

import "./page.css";

const ROLLING_MONTH_WINDOW_DAYS = 30;
const ROLLING_MONTH_CHART_SPAN_DAYS = 90;
const TOTAL_USERS_WEEK_SPAN = 52;

const ACTIVE_USER_METRICS = [
  { key: "dau", label: "Daily active users" },
  { key: "mau", label: "Monthly active users" }
] as const;

export default function Stats() {
  const { user, loading, isAdmin, checkingAdmin } = useAdminGuard();
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
  const [funnelSteps, setFunnelSteps] = useState<FunnelStep[]>([]);
  const [paywallFunnelSteps, setPaywallFunnelSteps] = useState<FunnelStep[]>(
    []
  );
  const [featureUsage, setFeatureUsage] = useState<FeatureUsageDomain[]>([]);
  const [realtimeUsers, setRealtimeUsers] = useState<number | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(true);
  const [loadingFunnel, setLoadingFunnel] = useState(true);
  const [loadingPaywallFunnel, setLoadingPaywallFunnel] = useState(true);
  const [loadingFeatureUsage, setLoadingFeatureUsage] = useState(true);

  const totalUserWeeklyHistory = useMemo(() => {
    const weeklyPoints = totalUserHistory
      .filter((point) => {
        const dayOfWeek = new Date(`${point.date}T00:00:00Z`).getUTCDay();
        return dayOfWeek === 0;
      })
      .slice(-TOTAL_USERS_WEEK_SPAN);

    const todayDate = new Date().toISOString().slice(0, 10);
    if (totalUser > 0 && weeklyPoints.at(-1)?.date !== todayDate) {
      return [...weeklyPoints, { date: todayDate, totalUsers: totalUser }];
    }

    return weeklyPoints;
  }, [totalUserHistory, totalUser]);

  const newUserHistory = useMemo(() => {
    const diffs = totalUserHistory.slice(1).map((point, index) => ({
      date: point.date,
      newUsers: point.totalUsers - totalUserHistory[index].totalUsers
    }));
    return diffs.slice(-30);
  }, [totalUserHistory]);

  const newUserRollingMonthlyHistory = useMemo(() => {
    const result: { date: string; newUsersRollingMonth: number }[] = [];
    for (let i = ROLLING_MONTH_WINDOW_DAYS; i < totalUserHistory.length; i++) {
      result.push({
        date: totalUserHistory[i].date,
        newUsersRollingMonth:
          totalUserHistory[i].totalUsers -
          totalUserHistory[i - ROLLING_MONTH_WINDOW_DAYS].totalUsers
      });
    }
    return result.slice(-ROLLING_MONTH_CHART_SPAN_DAYS);
  }, [totalUserHistory]);

  const growthLastUpdated = useMemo(() => {
    const dates = [
      totalUserHistory.at(-1)?.date,
      activeUserHistory.at(-1)?.date
    ].filter((date): date is string => Boolean(date));
    if (dates.length === 0) return null;
    return dates.sort().at(-1) ?? null;
  }, [totalUserHistory, activeUserHistory]);

  const sortedFeatureUsage = useMemo(() => {
    return [...featureUsage].sort(
      (a, b) => b.features.length - a.features.length
    );
  }, [featureUsage]);

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
        const { history, activeSubscriptions } = await getRevenueCatStats(
          idToken,
          30
        );
        setSubscriptionHistory(history);
        setActiveSubscriptions(activeSubscriptions);
      } catch (error) {
        console.error("Error fetching subscription stats:", error);
      } finally {
        setLoadingSubscriptions(false);
      }
    }

    async function getFunnelData() {
      try {
        const idToken = await user!.getIdToken();
        const steps = await getFunnelStats(idToken, 30, "onboarding");
        setFunnelSteps(steps);
      } catch (error) {
        console.error("Error fetching funnel stats:", error);
      } finally {
        setLoadingFunnel(false);
      }
    }

    async function getPaywallFunnelData() {
      try {
        const idToken = await user!.getIdToken();
        const steps = await getFunnelStats(idToken, 30, "paywall");
        setPaywallFunnelSteps(steps);
      } catch (error) {
        console.error("Error fetching paywall funnel stats:", error);
      } finally {
        setLoadingPaywallFunnel(false);
      }
    }

    async function getRealtimeUsers() {
      try {
        const idToken = await user!.getIdToken();
        const activeUsers = await getRealtimeActiveUsers(idToken);
        setRealtimeUsers(activeUsers);
      } catch (error) {
        console.error("Error fetching realtime users:", error);
      }
    }

    async function getFeatureUsageData() {
      try {
        const idToken = await user!.getIdToken();
        const features = await getFeatureUsageStats(idToken, 30);
        setFeatureUsage(features);
      } catch (error) {
        console.error("Error fetching feature usage stats:", error);
      } finally {
        setLoadingFeatureUsage(false);
      }
    }

    getUserStats();
    getSubscriptionStats();
    getFunnelData();
    getPaywallFunnelData();
    getRealtimeUsers();
    getFeatureUsageData();

    const realtimeInterval = setInterval(getRealtimeUsers, 60_000);
    return () => clearInterval(realtimeInterval);
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
    <main className="flex flex-1 flex-col p-4 md:p-10">
      <div className="stats-container">
        <div className="stats-header">
          <h1>App Statistics</h1>
          <p className="stats-subtitle">Revenue, Usage, and Funnel Growth</p>
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
              {realtimeUsers !== null && (
                <p
                  className={`stat-realtime${realtimeUsers > 0 ? " stat-realtime-active" : ""}`}
                >
                  <span className="stat-realtime-dot" aria-hidden />
                  {realtimeUsers.toLocaleString()} online in the last 30 mins
                </p>
              )}
            </div>
          </Link>
        </div>

        <div className="charts-section">
          <h2 className="charts-section-title">Revenue</h2>
          <div className="charts-grid">
            <section className="chart-card">
              <h2 className="chart-card-title">
                <FontAwesomeIcon icon={faCoins} />
                MRR
              </h2>
              {!loadingSubscriptions && activeSubscriptions !== null && (
                <p className="chart-card-active-subs">
                  <FontAwesomeIcon icon={faUsers} />
                  {activeSubscriptions.toLocaleString()} active subscriptions
                </p>
              )}
              <TrendChart
                history={subscriptionHistory}
                metric="mrr"
                color={CHART_COLOR}
                formatValue={formatCurrency}
                emptyMessage="No subscription data yet from RevenueCat for this range."
                loading={loadingSubscriptions}
                secondaryMetric="activeSubs"
                secondaryLabel="Subscribers"
                formatSecondaryValue={(v) => v.toLocaleString()}
              />
            </section>

            <section className="chart-card">
              <h2 className="chart-card-title">
                <FontAwesomeIcon icon={faCoins} />
                Revenue per day
              </h2>
              <TrendChart
                history={subscriptionHistory}
                metric="revenue"
                color={CHART_COLOR}
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
              ? ` · Data last updated ${formatMediumUtcDate(growthLastUpdated)}`
              : ""}
          </p>
          <section className="chart-card chart-card-full">
            <h2 className="chart-card-title">
              <FontAwesomeIcon icon={faUsers} />
              Total users (last 52 weeks)
            </h2>
            <TrendChart
              history={totalUserWeeklyHistory}
              metric="totalUsers"
              color={CHART_COLOR}
              formatValue={(v) => v.toLocaleString()}
              emptyMessage="No total user history yet — daily tracking started today. Check back tomorrow to see the trend build up."
              loading={loadingUsers}
            />
          </section>
          <div className="charts-grid">
            <section className="chart-card">
              <h2 className="chart-card-title">
                <FontAwesomeIcon icon={faUsers} />
                New users per day
              </h2>
              <TrendChart
                history={newUserHistory}
                metric="newUsers"
                color={CHART_COLOR}
                formatValue={(v) => v.toLocaleString()}
                emptyMessage="No new-user history yet — daily tracking started today. Check back tomorrow to see the trend build up."
                loading={loadingUsers}
              />
            </section>

            <section className="chart-card">
              <h2 className="chart-card-title">
                <FontAwesomeIcon icon={faUsers} />
                New users per month (rolling)
              </h2>
              <TrendChart
                history={newUserRollingMonthlyHistory}
                metric="newUsersRollingMonth"
                color={CHART_COLOR}
                formatValue={(v) => v.toLocaleString()}
                emptyMessage="Needs 30 days of history to compute a rolling monthly trend. Check back once tracking has run for a month."
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
                  color={CHART_COLOR}
                  formatValue={(v) => v.toLocaleString()}
                  emptyMessage="No activity history yet — daily tracking started today. Check back tomorrow to see the trend build up."
                  loading={loadingUsers}
                />
              </section>
            ))}
          </div>
        </div>

        <div className="charts-section">
          <h2 className="charts-section-title">Acquisition funnel</h2>
          <section className="chart-card chart-card-full">
            <h2 className="chart-card-title">
              <FontAwesomeIcon icon={faFilter} />
              Downloads → Signup → Onboarding
            </h2>
            <FunnelChart steps={funnelSteps} loading={loadingFunnel} />
          </section>
        </div>

        <div className="charts-section">
          <h2 className="charts-section-title">Paywall conversion funnel</h2>
          <section className="chart-card chart-card-full">
            <h2 className="chart-card-title">
              <FontAwesomeIcon icon={faFilter} />
              Viewed → Purchased
            </h2>
            <FunnelChart
              steps={paywallFunnelSteps}
              loading={loadingPaywallFunnel}
            />
          </section>
        </div>

        <div className="charts-section">
          <h2 className="charts-section-title">Feature usage</h2>
          <p className="charts-section-subtitle">
            Most-used actions by feature area · last 30 days
          </p>
          <div className="charts-grid">
            {loadingFeatureUsage ? (
              <section className="chart-card chart-card-full">
                <h2 className="chart-card-title">
                  <FontAwesomeIcon icon={faListOl} />
                  Top features
                </h2>
                <FeatureUsageChart features={[]} loading />
              </section>
            ) : (
              sortedFeatureUsage.map((domain) => (
                <section className="chart-card" key={domain.id}>
                  <h2 className="chart-card-title">
                    <FontAwesomeIcon icon={faListOl} />
                    {domain.label}
                  </h2>
                  <FeatureUsageChart
                    features={domain.features}
                    loading={false}
                  />
                </section>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
