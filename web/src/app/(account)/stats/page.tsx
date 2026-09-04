"use client";

import { checkAdmin } from "@/app/account/database/utils";
import Loading from "@/components/Loading";
import UnauthorizedAccess from "@/components/UnauthorizedAccess";
import { useUser } from "@/contexts/UserContext";
import {
  faCalendarAlt,
  faCheck,
  faCommentDots,
  faCreditCard,
  faPhotoFilm,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getTotalEvent,
  getTotalEventResponses,
  getTotalPhotoBoothConfigs,
  getTotalUser,
} from "./database/utils";
import "./page.css";

export default function Stats() {
  const { user, loading } = useUser();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [totalUser, setTotalUser] = useState(0);
  const [totalEvent, setTotalEvent] = useState(0);
  const [totalEventResponses, setTotalEventResponses] = useState(0);
  const [totalPhotoBoothConfigs, setTotalPhotoBoothConfigs] = useState(0);
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
    if (!isAdmin || checkingAdmin) {
      return;
    }

    async function getStats() {
      try {
        const userCount = await getTotalUser();
        const eventCount = await getTotalEvent();
        const eventResponsesCount = await getTotalEventResponses();
        const photoBoothConfigsCount = await getTotalPhotoBoothConfigs();
        setTotalUser(userCount);
        setTotalEvent(eventCount);
        setTotalEventResponses(eventResponsesCount);
        setTotalPhotoBoothConfigs(photoBoothConfigsCount);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    }

    getStats();
  }, [isAdmin, checkingAdmin]);

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

          <div className="stats-grid stats-grid-full">
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
              href="/stats/subscriptions"
              className="stat-card stat-card-subscriptions stat-card-link"
            >
              <div className="stat-icon-wrapper">
                <FontAwesomeIcon icon={faCreditCard} className="stat-icon" />
              </div>
              <div className="stat-content">
                <h2 className="stat-label">Subscriptions</h2>
                <p className="stat-value stat-value-link">Live view</p>
              </div>
            </Link>
          </div>

          <div className="stats-grid">
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

            <div className="stat-card stat-card-events">
              <div className="stat-icon-wrapper">
                <FontAwesomeIcon icon={faCalendarAlt} className="stat-icon" />
              </div>
              <div className="stat-content">
                <h2 className="stat-label">Total Events</h2>
                <p className="stat-value">{totalEvent.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card stat-card-users">
              <div className="stat-icon-wrapper">
                <FontAwesomeIcon icon={faCheck} className="stat-icon" />
              </div>
              <div className="stat-content">
                <h2 className="stat-label">Total Event Responses</h2>
                <p className="stat-value">
                  {totalEventResponses.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="stat-card stat-card-events">
              <div className="stat-icon-wrapper">
                <FontAwesomeIcon icon={faPhotoFilm} className="stat-icon" />
              </div>
              <div className="stat-content">
                <h2 className="stat-label">Total Photo Booth Users</h2>
                <p className="stat-value">
                  {totalPhotoBoothConfigs.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
    </main>
  );
}
