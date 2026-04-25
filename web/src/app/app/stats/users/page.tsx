"use client";

import { checkAdmin } from "@/app/app/home/database/utils";
import Footer from "@/components/Footer";
import UnauthorizedAccess from "@/components/UnauthorizedAccess";
import WebAppHeader from "@/components/WebAppHeader";
import { useUser } from "@/contexts/UserContext";
import {
  faArrowLeft,
  faChartColumn,
  faGlobe,
  faLaptop,
  faMapMarkerAlt,
  faMobileScreen,
  faServer,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getUsersForDeviceStats,
  type UserDeviceStatsRow,
} from "../database/utils";
import "./users.css";

function aggregateBy(
  rows: UserDeviceStatsRow[],
  field: keyof UserDeviceStatsRow,
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

const TOP_N = 10;

export default function UserStatsPage() {
  const { user, loading } = useUser();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [rows, setRows] = useState<UserDeviceStatsRow[]>([]);
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

  const stats = useMemo(() => {
    const total = rows.length;
    const byPlatform = aggregateBy(rows, "platform");
    const byAppVersion = aggregateBy(rows, "appVersion");
    const byLocale = aggregateBy(rows, "locale");
    const byRegion = aggregateBy(rows, "region");
    const byDeviceModel = aggregateBy(rows, "deviceModel").slice(0, TOP_N);
    const byOsVersion = aggregateBy(rows, "osVersion").slice(0, TOP_N);
    const byDatabaseUpdate = aggregateBy(rows, "databaseUpdate").slice(
      0,
      TOP_N,
    );
    return {
      total,
      byPlatform,
      byAppVersion,
      byLocale,
      byRegion,
      byDeviceModel,
      byOsVersion,
      byDatabaseUpdate,
    };
  }, [rows]);

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
        <div className="user-stats-container">
          <div className="user-stats-header">
            <Link href="/app/stats" className="user-stats-back-link">
              <FontAwesomeIcon icon={faArrowLeft} />
              <span>Back to Admin Panel</span>
            </Link>
            <h1>User stats</h1>
            <p className="user-stats-subtitle">
              Platform, version, locale and device breakdown ({stats.total}{" "}
              users)
            </p>
          </div>

          {loadingData ? (
            <div className="user-stats-loading">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
              <p>Loading user stats...</p>
            </div>
          ) : (
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
                  {stats.byAppVersion
                    .slice(0, TOP_N)
                    .map(({ value, count }) => (
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
                  <FontAwesomeIcon icon={faGlobe} />
                  Locale
                </h2>
                <ul className="user-stats-list">
                  {stats.byLocale.slice(0, TOP_N).map(({ value, count }) => (
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
                  {stats.byRegion.slice(0, TOP_N).map(({ value, count }) => (
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
                  Device model (top {TOP_N})
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

              <section className="user-stats-card">
                <h2 className="user-stats-card-title">
                  <FontAwesomeIcon icon={faMobileScreen} />
                  OS version (top {TOP_N})
                </h2>
                <ul className="user-stats-list">
                  {stats.byOsVersion.map(({ value, count }) => (
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
                  <FontAwesomeIcon icon={faServer} />
                  Database update (top {TOP_N})
                </h2>
                <ul className="user-stats-list">
                  {stats.byDatabaseUpdate.map(({ value, count }) => (
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
      <Footer />
    </div>
  );
}
