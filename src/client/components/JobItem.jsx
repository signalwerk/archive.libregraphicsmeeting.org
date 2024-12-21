import React from "react";
import "./JobItem.css";

export function JobItem({ job, onDetailClick, onParentClick, isActive }) {
  return (
    <div className={`job-item ${isActive ? 'job-item--active' : ''}`}>
      <div>
        <span className="job-item__field">
          <strong>Queue:</strong> {job.queueName}
        </span>
        <span className="job-item__field">
          <strong>Status:</strong> {job.status}
        </span>
        <br />
      </div>
      <div>
        <span className="job-item__field">
          <strong>ID:</strong> {job.id}
        </span>
        <span className="job-item__field">
          <strong>Created:</strong> {new Date(job.createdAt).toLocaleString()}
        </span>
        {job.finishedAt && (
          <span className="job-item__field">
            <strong>Finished:</strong>{" "}
            {new Date(job.finishedAt).toLocaleString()}
          </span>
        )}
      </div>
      <div>
        <h3>Data</h3>
        <pre className="job-item__data">
          {JSON.stringify(job.data, null, 2)}
        </pre>

        {onDetailClick && (
          <button
            className="button job-item__detail-button"
            onClick={() => onDetailClick(job.id)}
          >
            View details
          </button>
        )}

        {onParentClick && job.data?._parent && (
          <button
            className="button job-item__detail-button"
            onClick={() => onParentClick(job.data._parent)}
          >
            View Parent Job
          </button>
        )}
      </div>
      {job.logs && job.logs.length > 0 && (
        <div>
          <h3>Logs</h3>
          <ul className="job-item__logs">
            {job.logs.map((log, index) => (
              <li key={index}>{log.text}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
