"use client";

import {
  faArrowLeft,
  faChartColumn,
  faLaptop,
  faMapMarkerAlt,
  faMobileScreen
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

import { useState, useEffect, useMemo } from "react";

import { Loading } from "@/components/Loading";
import { UnauthorizedAccess } from "@/features/stats/components/UnauthorizedAccess";
import { formatMediumUtcDate } from "@/lib/dates";

import {
  type CountryUserStats,
  type UserDeviceStatsRow,
  getUsersByCountryStats,
  getUsersForDeviceStats
} from "@/features/stats/services/database";
import { useAdminGuard } from "@/features/stats/hooks/useAdminGuard";
import { WorldMap } from "@/features/stats/components/WorldMap";
import {
  aggregateBy,
  aggregateDeviceType,
  compareVersionsDescending,
  regionName
} from "@/features/stats/utils/userStats";
import "./users.css";

export default function UserStatsPage() {
  const { loading, isAdmin, checkingAdmin } = useAdminGuard();
  const [rows, setRows] = useState<UserDeviceStatsRow[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [countryStats, setCountryStats] = useState<CountryUserStats>({
    date: null,
    total: 0,
    byRegion: []
  });
  const [loadingCountryStats, setLoadingCountryStats] = useState(true);

  useEffect(() => {
    if (!isAdmin || checkingAdmin) return;
    async function fetchData() {
      setLoadingData(true);
      try {
        const list = await getUsersForDeviceStats();
        setRows(list);
      } catch (error) {
        console.error("Error fetching user stats:", error);
      } finally {
        setLoadingData(false);
      }
    }
    fetchData();
  }, [isAdmin, checkingAdmin]);

  useEffect(() => {
    if (!isAdmin || checkingAdmin) return;
    async function fetchCountryStats() {
      setLoadingCountryStats(true);
      try {
        const result = await getUsersByCountryStats();
        setCountryStats(result);
      } catch (error) {
        console.error("Error fetching users-by-country stats:", error);
      } finally {
        setLoadingCountryStats(false);
      }
    }
    fetchCountryStats();
  }, [isAdmin, checkingAdmin]);

  const stats = useMemo(() => {
    const total = rows.length;
    const byPlatform = aggregateBy(rows, "platform");
    const byAppVersion = aggregateBy(rows, "appVersion").sort((a, b) =>
      compareVersionsDescending(a.value, b.value)
    );
    const byDeviceType = aggregateDeviceType(rows);

    return {
      total,
      byPlatform,
      byAppVersion,
      byDeviceType
    };
  }, [rows]);

  const countryMapData = useMemo(() => {
    const known = countryStats.byRegion.filter((r) => r.region !== "unknown");
    return {
      known: known.map((r) => ({ value: r.region, count: r.count })),
      knownTotal: known.reduce((sum, r) => sum + r.count, 0)
    };
  }, [countryStats]);

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
      <main className="flex flex-1 flex-col p-4 md:p-10">
        <div className="user-stats-container">
          <div className="user-stats-header">
            <Link href="/stats" className="user-stats-back-link">
              <FontAwesomeIcon icon={faArrowLeft} />
              <span>Back to Admin Panel</span>
            </Link>
            <h1>User stats</h1>
            <p className="user-stats-subtitle">
              Platform, version, region and device breakdown ({stats.total}{" "}
              users active in the last 90 days)
            </p>
          </div>

          {loadingData && (
            <div className="user-stats-loading" role="status" aria-live="polite">
              <span className="user-stats-spinner" aria-hidden />
              <span>Loading user stats...</span>
            </div>
          )}

          {!loadingData && (
            <div className="user-stats-grid">
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
                  <FontAwesomeIcon icon={faLaptop} />
                  Device type
                </h2>
                <ul className="user-stats-list">
                  {stats.byDeviceType.map(({ value, count }) => (
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

          {!loadingCountryStats && (
            <section className="user-stats-card user-stats-map-card">
              <h2 className="user-stats-card-title">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                Users by country
              </h2>
              {countryStats.date && countryStats.total > 0 && (
                <p className="user-stats-map-caption">
                  {countryStats.total.toLocaleString()} users total as of{" "}
                  {formatMediumUtcDate(countryStats.date)}
                </p>
              )}
              <WorldMap
                data={countryMapData.known}
                total={countryMapData.knownTotal}
                loading={loadingCountryStats}
              />
              <ul className="user-stats-list user-stats-map-list">
                {countryStats.byRegion
                  .filter(({ region }) => region !== "unknown")
                  .map(({ region, count }) => (
                    <li key={region} className="user-stats-row user-stats-map-row">
                      <span className="user-stats-map-region">
                        <span className="user-stats-label">{region}</span>
                        <span className="user-stats-map-country-name">
                          {regionName(region)}
                        </span>
                      </span>
                      <span className="user-stats-map-count-group">
                        <span className="user-stats-count">
                          {count.toLocaleString()}
                        </span>
                        {countryMapData.knownTotal > 0 && (
                          <span className="user-stats-map-percentage">
                            {((count / countryMapData.knownTotal) * 100).toFixed(1)}%
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
              </ul>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
