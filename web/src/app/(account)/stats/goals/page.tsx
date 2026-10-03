"use client";

import { faArrowLeft, faBullseye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

import { useEffect, useMemo, useState } from "react";

import { Loading } from "@/components/Loading";
import { UnauthorizedAccess } from "@/features/stats/components/UnauthorizedAccess";
import { GOALS_ACCESS_EMAIL } from "@/features/stats/constants";
import { useAdminGuard } from "@/features/stats/hooks/useAdminGuard";
import {
  type GoalHorizon,
  projectGoal
} from "@/features/stats/utils/goalProjection";
import { formatCurrency } from "@/lib/currency";
import { formatMediumUtcDate } from "@/lib/dates";
import {
  type RevenueCatDailyStat,
  getRevenueCatStats
} from "@/lib/subscriptions";

import "./goals.css";

const MRR_TARGET = 4000;
const GOAL_HISTORY_DAYS = 1000;

const HORIZONS: GoalHorizon[] = [
  { label: "All time", days: null },
  { label: "12 months", days: 365 },
  { label: "6 months", days: 180 },
  { label: "3 months", days: 90 },
  { label: "1 month", days: 30 }
];

export default function GoalsPage() {
  const { user, loading, isAdmin, checkingAdmin } = useAdminGuard();
  const [history, setHistory] = useState<RevenueCatDailyStat[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const hasAccess = isAdmin && user?.email === GOALS_ACCESS_EMAIL;

  useEffect(() => {
    if (!hasAccess) return;
    async function fetchHistory() {
      try {
        const idToken = await user!.getIdToken();
        const { history: fetchedHistory } = await getRevenueCatStats(
          idToken,
          GOAL_HISTORY_DAYS
        );
        setHistory(fetchedHistory);
      } catch (error) {
        console.error("Error fetching goal history:", error);
      } finally {
        setLoadingHistory(false);
      }
    }
    fetchHistory();
  }, [hasAccess, user]);

  const mrrHistory = useMemo(
    () => history.map((point) => ({ date: point.date, value: point.mrr })),
    [history]
  );

  const projections = useMemo(
    () =>
      HORIZONS.map((horizon) => ({
        horizon,
        projection: projectGoal(mrrHistory, horizon, MRR_TARGET)
      })),
    [mrrHistory]
  );

  const currentMrr = mrrHistory.length
    ? mrrHistory[mrrHistory.length - 1].value
    : null;

  if (loading || checkingAdmin) {
    return <Loading />;
  }

  if (!hasAccess) {
    return (
      <UnauthorizedAccess
        title="Admin Access Required"
        message="This page is restricted to administrators only. Please contact an administrator if you believe you should have access."
      />
    );
  }

  return (
    <main className="flex flex-1 flex-col p-4 md:p-10">
      <div className="goals-container">
        <div className="goals-header">
          <Link href="/stats" className="goals-back-link">
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Back to Admin Panel</span>
          </Link>
          <h1>
            <FontAwesomeIcon icon={faBullseye} />
            Revenue Goals
          </h1>
          <p className="goals-subtitle">
            Linear projections for reaching {formatCurrency(MRR_TARGET)}/mo in
            MRR (proceeds), based on the trend over each horizon below.
          </p>
        </div>

        {loadingHistory && (
          <div className="goals-loading" role="status" aria-live="polite">
            <span className="goals-spinner" aria-hidden />
            <span>Crunching the numbers...</span>
          </div>
        )}

        {!loadingHistory && (
          <>
            <section className="goals-summary-card">
              <div className="goals-summary-item">
                <span className="goals-summary-label">Current MRR</span>
                <span className="goals-summary-value">
                  {currentMrr !== null ? formatCurrency(currentMrr) : "—"}
                </span>
              </div>
              <div className="goals-summary-item">
                <span className="goals-summary-label">Target</span>
                <span className="goals-summary-value">
                  {formatCurrency(MRR_TARGET)}
                </span>
              </div>
              <div className="goals-summary-item">
                <span className="goals-summary-label">Remaining</span>
                <span className="goals-summary-value">
                  {currentMrr !== null
                    ? formatCurrency(Math.max(0, MRR_TARGET - currentMrr))
                    : "—"}
                </span>
              </div>
            </section>

            <section className="goals-card">
              {mrrHistory.length < 2 ? (
                <p className="goals-empty">
                  Not enough RevenueCat history yet to project a trend.
                </p>
              ) : (
                <div className="goals-table-wrapper">
                  <table className="goals-table">
                    <thead>
                      <tr>
                        <th>Horizon</th>
                        <th>Growth / month</th>
                        <th>Time remaining</th>
                        <th>Projected date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projections.map(({ horizon, projection }) => (
                        <tr key={horizon.label}>
                          <td className="goals-table-horizon">
                            {horizon.label}
                          </td>
                          {projection ? (
                            <>
                              <td
                                className={
                                  projection.monthlyGrowth > 0
                                    ? "goals-table-positive"
                                    : "goals-table-negative"
                                }
                              >
                                {projection.monthlyGrowth >= 0 ? "+" : ""}
                                {formatCurrency(projection.monthlyGrowth)}
                              </td>
                              <td>
                                {projection.monthsRemaining === null
                                  ? "Not on track"
                                  : projection.monthsRemaining === 0
                                    ? "Target reached"
                                    : `${projection.monthsRemaining.toFixed(1)} months`}
                              </td>
                              <td>
                                {projection.projectedDate
                                  ? formatMediumUtcDate(
                                      projection.projectedDate
                                    )
                                  : "—"}
                              </td>
                            </>
                          ) : (
                            <td colSpan={3} className="goals-table-empty">
                              Not enough data for this horizon
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
