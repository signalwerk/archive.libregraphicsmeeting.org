import { useState, useEffect, useMemo } from "react";
import { io } from "socket.io-client";
import { JobItem } from "./components/JobItem";
import { JobItemSmall } from "./components/JobItemSmall";
import "./App.css";

// const requestURL = "https://www.libregraphicsmeeting.org/2008/LGM2008_%20LOGO.svg";
// const requestURL = "https://libregraphicsmeeting.org/2015/call-for-participation";
// const requestURL = "https://www.libregraphicsmeeting.org/2006/style.css";
// const requestURL = "https://www.libregraphicsmeeting.org/2012/wp/wp-content/plugins/gravityforms/css/forms-ver=1.5.1.1.css";
const requestURL = "https://www.libregraphicsmeeting.org/";

const socket = io();

const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

function App() {
  const [queueStats, setQueueStats] = useState({});
  const [historyJobs, setHistoryJobs] = useState({ total: 0, jobs: [] });
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    queues: new Set(['request', 'fetch', 'parse']),
    errorFilter: 'all'
  });

  useEffect(() => {
    // Listen for queue stats updates
    socket.on("queueStats", (stats) => {
      setQueueStats(stats);
    });

    // Fetch initial stats
    // fetch('/api/stats').then(res => res.json()).then(setQueueStats);

    return () => socket.off("queueStats");
  }, []);

  // Debounced history fetch
  const fetchHistory = useMemo(() => 
    debounce(async (filters) => {
      const params = new URLSearchParams({
        status: filters.status,
        search: filters.search,
        queues: Array.from(filters.queues).join(','),
        errorFilter: filters.errorFilter
      });
      const res = await fetch(`/api/history?${params}`);
      const data = await res.json();
      setHistoryJobs(data);
    }, 1000)
  , []);

  useEffect(() => {
    console.log("fetching history", filters);
    fetchHistory(filters);
  }, [filters, fetchHistory]);

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

  const toggleQueue = (queueName) => {
    setFilters(prev => {
      const newQueues = new Set(prev.queues);
      if (newQueues.has(queueName)) {
        newQueues.delete(queueName);
      } else {
        newQueues.add(queueName);
      }
      return { ...prev, queues: newQueues };
    });
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
        <div className="queue-admin__active-grid">
          {["request", "fetch", "parse"].map((queueName) => (
            <div key={queueName} className="queue-admin__active-column">
              <h3>
                {queueName} Queue ({queues[queueName]?.active?.length || 0})
              </h3>
              {queues[queueName]?.active?.slice(0, 10).map((job) => (
                <JobItemSmall
                  key={job.id}
                  onDetailClick={getDetailJob}
                  job={job}
                />
              ))}
              {(queues[queueName]?.active?.length || 0) > 10 && (
                <div className="queue-admin__more-items">
                  +{queues[queueName].active.length - 10} more items
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="queue-admin__history">
        <h2>Job History</h2>

        <div className="queue-admin__filters">
          <div className="queue-admin__queue-filters">
            {['request', 'fetch', 'parse'].map(queueName => (
              <label key={queueName} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.queues.has(queueName)}
                  onChange={() => toggleQueue(queueName)}
                />
                {queueName}
              </label>
            ))}
          </div>

          <select
            className="select queue-admin__filter-select"
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>

          <select
            className="select queue-admin__filter-select"
            value={filters.errorFilter}
            onChange={(e) => setFilters(prev => ({ ...prev, errorFilter: e.target.value }))}
          >
            <option value="all">All Errors</option>
            <option value="with">With Errors</option>
            <option value="without">Without Errors</option>
          </select>

          <input
            type="text"
            className="input queue-admin__filter-input"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            placeholder="Search jobs..."
          />
        </div>

        {historyJobs.jobs.length === 0 ? (
          <p className="queue-admin__no-results">
            No jobs match your search criteria
          </p>
        ) : (
          <>
            <p className="queue-admin__results-count">
              Showing {historyJobs.jobs.length} of {historyJobs.total} matching
              jobs
            </p>
            {historyJobs.jobs.map((job) => (
              <JobItem
                key={job.id}
                job={job}
                onDetailClick={getDetailJob}
                onParentClick={getDetailJob}
                isActive={jobDetail?.id === job.id}
              />
            ))}
          </>
        )}
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
          <h2>Job Details</h2>
          <button
            className="queue-admin__drawer-close"
            onClick={() => setJobDetail(null)}
          >
            <span className="queue-admin__drawer-close-icon">×</span>
          </button>
        </div>

        <div className="queue-admin__drawer-content">
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
