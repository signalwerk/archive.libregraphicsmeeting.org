import React from "react";
import "./JobItemSmall.css";

export function JobItemSmall({ job, isActive, onDetailClick }) {
  return (
    <button
      className={`job-item-small ${isActive ? "job-item-small--active" : ""}`}
      onClick={() => onDetailClick(job.id)}
    >
      <div className="job-item-small__header">
        <span className="job-item-small__field">
          <strong>{job.queueName}</strong>
        </span>
        <span className="job-item-small__field">{job.status}</span>
      </div>
      {job.data?.uri && (
        <div className="job-item-small__body">
          <span className="job-item-small__field">{job.data.uri}</span>
        </div>
      )}
    </button>
  );
}
