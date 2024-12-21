import React from "react";
import "./JobItemSmall.css";

export function JobItemSmall({ job, isActive, onDetailClick }) {
  return (
    <button
      className={`job-item-small ${isActive ? "job-item-small--active" : ""}`}
      onClick={() => onDetailClick(job.id)}
    >
      <span className="job-item-small__field">
        <strong>{job.queueName}</strong>
      </span>
      <span className="job-item-small__field">{job.status}</span>
      {job.data?.uri && (
        <span className="job-item-small__field">{job.data.uri}</span>
      )}
    </button>
  );
}
