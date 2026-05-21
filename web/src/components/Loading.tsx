"use client";

import "./Loading.css";

type LoadingProps = {
  message?: string;
};

export default function Loading({ message = "Loading..." }: LoadingProps) {
  return (
    <div className="loading-overlay" role="status" aria-live="polite">
      <div className="loading-container">
        <div className="loading-spinner" aria-hidden />
        <p className="loading-text">{message}</p>
      </div>
    </div>
  );
}
