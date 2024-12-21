import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { JobItem } from "./components/JobItem";
import { JobItemSmall } from "./components/JobItemSmall";
import "./App.css";

// const requestURL = "https://www.libregraphicsmeeting.org/2008/LGM2008_%20LOGO.svg";
const requestURL = "https://www.libregraphicsmeeting.org/";
// const requestURL = "https://www.libregraphicsmeeting.org/2006/style.css";

const socket = io();

function App() {
  const [queues, setQueues] = useState({});
  const [jobDetail, setJobDetail] = useState(null);
  const [selectedQueues, setSelectedQueues] = useState(
    new Set(["request", "fetch", "parse", "write"]),
  );
  const [statusFilter, setStatusFilter] = useState("all");
  const [errorFilter, setErrorFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Add escape key listener
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setJobDetail(null);
      }
    };
    window.addEventListener("keydown", handleEscape);

    // Replace multiple event handlers with a single jobUpdate handler
    socket.on("jobUpdate", ({ type, job }) => {
      setQueues((prevQueues) => {
        const newQueues = { ...prevQueues };
        const queue = newQueues[job.queueName];

        if (!queue) return prevQueues;

        switch (type) {
          case "added":
          case "started":
            // Remove from history if exists
            queue.history = queue.history.filter((j) => j.id !== job.id);
            // Update or add to active
            queue.active = queue.active.filter((j) => j.id !== job.id);
            queue.active.push(job);
            break;
          case "completed":
          case "failed":
            // Remove from active
            queue.active = queue.active.filter((j) => j.id !== job.id);
            // Add to history
            queue.history = queue.history.filter((j) => j.id !== job.id);
            queue.history.push(job);
            break;
        }

        return newQueues;
      });
    });

    socket.on("historyCleared", () => loadJobs());
    socket.on("initialData", (data) => setQueues(data));

    return () => {
      window.removeEventListener("keydown", handleEscape);
      socket.off("jobUpdate");
      socket.off("historyCleared");
      socket.off("initialData");
    };
  }, []);

  const loadJobs = async () => {
    const res = await fetch("/api/jobs");
    const data = await res.json();
    setQueues(data);
  };

  const addJob = async (type, data) => {
    await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, data }),
    });
  };

  const getAllHistoryJobs = () => {
    const allJobs = Object.entries(queues).flatMap(([queueName, queueData]) =>
      queueData.history.map((job) => ({
        ...job,
      })),
    );

    return allJobs
      .filter((job) => selectedQueues.has(job.queueName))
      .filter((job) => statusFilter === "all" || job.status === statusFilter)
      .filter((job) => {
        if (errorFilter === "all") return true;
        if (errorFilter.startsWith("!")) {
          // Handle "not" filters (e.g., "!404" means "not 404")
          const errorCode = Number(errorFilter.slice(1));
          return job.error !== errorCode;
        }
        return job.error === Number(errorFilter);
      })
      .filter(
        (job) =>
          searchTerm === "" ||
          JSON.stringify(job).toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .sort((a, b) => b.sort - a.sort)
      .slice(0, 300);
  };

  const getDetailJob = async (jobId) => {
    console.log("Getting detail job:", jobId);
    try {
      const res = await fetch(`/api/jobs/${jobId}`);
      const data = await res.json();
      setJobDetail(data);
    } catch (err) {
      console.error("Failed to fetch parent job:", err);
    }
  };

  const clearHistory = async () => {
    await fetch("/api/jobs/clear-history", { method: "POST" });
    loadJobs();
    setJobDetail(null);
  };

  const clearCache = async () => {
    await fetch("/api/jobs/clear-cache", { method: "POST" });
  };

  return (
    <div className="queue-admin">
      <h1 className="queue-admin__header">Queue Admin Viewer</h1>

      <div className="queue-admin__controls">
        <button className="button" onClick={loadJobs}>
          Refresh Jobs
        </button>
        <button className="button" onClick={clearHistory}>
          Clear History
        </button>
        <button className="button" onClick={clearCache}>
          Clear Cache
        </button>
        <button
          className="button"
          onClick={() => addJob("request", { uri: requestURL })}
        >
          Add Test Request Job
        </button>
      </div>

      <div className="queue-admin__active">
        <h2>Active Jobs</h2>
        {Object.entries(queues).map(
          ([queueName, queueData]) =>
            queueData.active?.length > 0 && (
              <div key={queueName}>
                <h3>
                  {queueName} Queue ({queueData.active.length})
                </h3>
                {queueData.active.map((job) => (
                  <JobItemSmall
                    key={job.id}
                    onDetailClick={getDetailJob}
                    job={job}
                  />
                ))}
              </div>
            ),
        )}
      </div>

      <div className="queue-admin__history">
        <h2>Job History</h2>

        <div className="queue-admin__filters">
          <div className="queue-admin__filter-group">
            {Object.keys(queues).map((queueName) => (
              <label key={queueName} className="queue-admin__filter-checkbox">
                <input
                  type="checkbox"
                  checked={selectedQueues.has(queueName)}
                  onChange={(e) => {
                    const newSelected = new Set(selectedQueues);
                    if (e.target.checked) {
                      newSelected.add(queueName);
                    } else {
                      newSelected.delete(queueName);
                    }
                    setSelectedQueues(newSelected);
                  }}
                />
                {queueName}
              </label>
            ))}
          </div>

          <select
            className="select queue-admin__filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>

          <select
            className="select queue-admin__filter-select"
            value={errorFilter}
            onChange={(e) => setErrorFilter(e.target.value)}
          >
            <option value="all">No Errors-Code filter</option>
            <option value="404">404 Not Found</option>
            <option value="!404">All but 404 Not Found</option>
            <option value="500">500 Internal Server Error</option>
          </select>

          <input
            type="text"
            className="input queue-admin__filter-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search jobs..."
          />
        </div>

        {(() => {
          const matchingJobs = getAllHistoryJobs();
          return matchingJobs.length === 0 ? (
            <p className="queue-admin__no-results">
              No jobs match your search criteria
            </p>
          ) : (
            <>
              <p className="queue-admin__results-count">
                Showing {matchingJobs.length} matching jobs {matchingJobs.length === 300 ? '(limited to first 300)' : ''}
              </p>
              {matchingJobs.map((job) => (
                <JobItem
                  key={job.id}
                  job={job}
                  onDetailClick={getDetailJob}
                  onParentClick={getDetailJob}
                  isActive={jobDetail?.id === job.id}
                />
              ))}
            </>
          );
        })()}
      </div>

      <div
        className={`queue-admin__drawer-backdrop ${
          jobDetail ? "queue-admin__drawer-backdrop--visible" : ""
        }`}
        onClick={() => setJobDetail(null)}
      />

      <div
        className={`queue-admin__drawer ${
          jobDetail ? "queue-admin__drawer--open" : ""
        }`}
      >
        <div className="queue-admin__drawer-header">
          <button
            className="queue-admin__drawer-close"
            onClick={() => setJobDetail(null)}
          >
            <span className="queue-admin__drawer-close-icon">×</span>
          </button>
        </div>

        <div className="queue-admin__drawer-content">
          <h2>Job Details</h2>

          {jobDetail && (
            <JobItem job={jobDetail} onParentClick={getDetailJob} />
          )}

          <pre className="job-item__data">
            {JSON.stringify(jobDetail, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default App;
