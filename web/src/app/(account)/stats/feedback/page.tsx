"use client";

import { Loading } from "@/components/Loading";
import { UnauthorizedAccess } from "@/features/stats/components/UnauthorizedAccess";
import { useAdminGuard } from "@/features/stats/hooks/useAdminGuard";
import {
  faArrowLeft,
  faCommentDots,
  faEnvelope,
  faTag,
  faTrash,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  deleteFeedback,
  getAllFeedback,
  type FeedbackItem,
} from "@/features/stats/services/database";
import { formatDateTime } from "@/lib/dates";
import "./feedback.css";

export default function FeedbackPage() {
  const { loading, isAdmin, checkingAdmin } = useAdminGuard();
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this feedback? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await deleteFeedback(id);
      setFeedbackList((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting feedback:", error);
      alert("Failed to delete feedback. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    if (!isAdmin || checkingAdmin) return;
    async function fetchFeedback() {
      setLoadingFeedback(true);
      try {
        const list = await getAllFeedback();
        setFeedbackList(list);
      } catch (error) {
        console.error("Error fetching feedback:", error);
      } finally {
        setLoadingFeedback(false);
      }
    }
    fetchFeedback();
  }, [isAdmin, checkingAdmin]);

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
      {loadingFeedback && <Loading message="Loading feedback..." />}
      <main className="flex flex-1 flex-col p-4 md:p-10">
        <div className="feedback-page-container">
          <div className="feedback-page-header">
            <Link href="/stats" className="feedback-back-link">
              <FontAwesomeIcon icon={faArrowLeft} />
              <span>Back to Admin Panel</span>
            </Link>
            <h1>App Feedback</h1>
            <p className="feedback-page-subtitle">
              All feedback submitted by users
            </p>
          </div>

          {!loadingFeedback &&
            (feedbackList.length === 0 ? (
            <div className="feedback-empty">
              <FontAwesomeIcon
                icon={faCommentDots}
                className="feedback-empty-icon"
              />
              <p>No feedback yet.</p>
            </div>
          ) : (
            <div className="feedback-list">
              {feedbackList.map((item) => (
                <article key={item.id} className="feedback-card">
                  <div className="feedback-card-meta">
                    <span className="feedback-meta-item">
                      <FontAwesomeIcon icon={faUser} />
                      {item.username}
                    </span>
                    <span className="feedback-meta-item">
                      <FontAwesomeIcon icon={faEnvelope} />
                      <a href={`mailto:${item.email}`}>{item.email}</a>
                    </span>
                    <span className="feedback-meta-item">
                      <FontAwesomeIcon icon={faTag} />
                      {item.type}
                    </span>
                    <time
                      className="feedback-meta-item feedback-date"
                      dateTime={item.timestamp}
                    >
                      {formatDateTime(item.timestamp)}
                    </time>
                    <button
                      type="button"
                      className="feedback-delete-btn"
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      title="Delete feedback"
                    >
                      {deletingId === item.id ? (
                        <span className="feedback-delete-spinner" />
                      ) : (
                        <FontAwesomeIcon icon={faTrash} />
                      )}
                    </button>
                  </div>
                  <div className="feedback-card-message">{item.message}</div>
                </article>
              ))}
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
