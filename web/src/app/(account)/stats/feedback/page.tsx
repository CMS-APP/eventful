"use client";

import { checkAdmin } from "@/app/account/database/utils";
import UnauthorizedAccess from "@/components/UnauthorizedAccess";
import { useUser } from "@/contexts/UserContext";
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
} from "../database/utils";
import "./feedback.css";

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function FeedbackPage() {
  const { user, loading } = useUser();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
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
    return (
      <div className="flex flex-1 items-center justify-center">
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
    
      <main className="flex flex-1 flex-col p-10">
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

          {loadingFeedback ? (
            <div className="feedback-loading">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
              <p>Loading feedback...</p>
            </div>
          ) : feedbackList.length === 0 ? (
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
                      {formatDate(item.timestamp)}
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
          )}
        </div>
      </main>
    
  );
}
