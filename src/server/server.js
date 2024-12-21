// server.js
import { EventEmitter } from "events";
import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
// import { fileURLToPath } from "url";
// import { dirname } from "path";
import { Queue } from "./queue.js";
import {
  addFetchJob,
  isDomainValid,
  isAlreadyRequested,
} from "./processor/request.js";
import { parseHtml } from "./processor/parse.js";
import { isCached, fetchHttp } from "./processor/fetch.js";
import { Cache } from "./utils/Cache.js";
import { RequestTracker } from "./utils/RequestTracker.js";

// Replace cache object with instance
const cache = new Cache();
const requestTracker = new RequestTracker();

// Get __dirname equivalent in ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);

// JSON middleware for APIs
app.use(express.json());

// Create queues
const requestQueue = new Queue("request");
const fetchQueue = new Queue("fetch");
const parseQueue = new Queue("parse");

const events = new EventEmitter();
events.on("createRequestJob", (data) => {
  // remove the chache information
  let { cache, ...dataWithoutCache } = data;
  requestQueue.addJob(dataWithoutCache);
});
events.on("createFetchJob", (data) => {
  fetchQueue.addJob(data);
});
events.on("createParseJob", (data) => {
  parseQueue.addJob(data);
});

// Register processors

requestQueue
  // check if domain is valid
  .use(async (job, next) => {
    await isDomainValid(
      {
        job,
        allowed: [/^([a-z0-9-]+\.)*libregraphicsmeeting\.org$/i],
      },
      next,
    );
  })
  // check if URL was already requested
  .use(async (job, next) => {
    await isAlreadyRequested(
      { job, requestTracker, getKey: (job) => job.data.uri },
      next,
    );
  })
  // process request job
  .use(async (job, next) => {
    await addFetchJob({ job, events }, next);
  });

fetchQueue
  // process fetch job
  .use(async (job, next) => {
    await isCached(
      {
        //
        job,
        cache,
        getKey: (job) => job.data.uri,
      },
      next,
    );
  })
  .use(async (job, next) => {
    await fetchHttp({ job, cache, events }, next);
  });

parseQueue.use(async (job, next) => {
  const { data, metadata } = cache.get(job.data.cache.key);

  if (!data || !metadata) {
    throw new Error(`No data or metadata found in cache ${job.data.cache.key}`);
  }

  const mimeType = metadata.headers["content-type"].split(";")[0];

  switch (mimeType) {
    case "application/xhtml+xml":
    case "text/html": {
      await parseHtml({ job, events, data, metadata }, next);
      break;
    }
    case "text/css":
    case "application/javascript":
//
    case "image/png":
    case "image/jpeg":
    case "image/jpg":
    case "image/gif":
    case "image/webp":
    case "image/svg+xml":
    case "image/avif":
    case "image/apng":
    case "image/bmp":
    case "image/tiff":
    case "image/x-icon":
    case "text/xml":
    case "application/pdf":
    case "application/json":
    case "application/rss+xml":
    case "application/atom+xml":
    case "application/rdf+xml":
    case "application/rss+xml":
    case "application/rdf+xml":
    case "application/xml":
    case "application/x-www-form-urlencoded":
    case "application/x-shockwave-flash": {
      break;
    }
    default: {
      throw new Error(
        `Unsupported content type: ${metadata.headers["content-type"]}`,
      );
    }
  }

  next();
});

// API endpoint to get all jobs in queues
app.get("/api/jobs", (req, res) => {
  const allJobs = {
    request: requestQueue.getAllJobs(),
    fetch: fetchQueue.getAllJobs(),
    parse: parseQueue.getAllJobs(),
  };
  res.json(allJobs);
});

// API endpoint to get a specific job
app.get("/api/jobs/:id", (req, res) => {
  const requestJob = requestQueue.getJobById(req.params.id);
  const fetchJob = fetchQueue.getJobById(req.params.id);
  const parseJob = parseQueue.getJobById(req.params.id);
  const job = requestJob || fetchJob || parseJob;

  if (job) {
    res.json(job);
  } else {
    res.status(404).json({ error: "Job not found" });
  }
});

// API endpoint to add a job (for testing)
app.post("/api/jobs", (req, res) => {
  const { type, data } = req.body;
  let queue;

  switch (type) {
    case "request":
      queue = requestQueue;
      break;
    case "fetch":
      queue = fetchQueue;
      break;
    case "parse":
      queue = parseQueue;
      break;
    default:
      return res.status(400).json({ error: "Invalid queue type" });
  }

  const jobId = queue.addJob(data);
  res.json({ success: true, jobId });
});

// Split into two separate endpoints
app.post("/api/jobs/clear-history", (req, res) => {
  requestQueue.clearHistory();
  fetchQueue.clearHistory();
  parseQueue.clearHistory();
  requestTracker.clear();
  res.json({ success: true });
});

app.post("/api/jobs/clear-cache", (req, res) => {
  cache.clear();
  res.json({ success: true });
});

// Listen to queue events and send updates to connected clients
[requestQueue, fetchQueue, parseQueue].forEach((queue) => {
  queue.events.on("jobAdded", (job) =>
    io.emit("jobUpdate", { type: "added", job }),
  );
  queue.events.on("jobStarted", (job) =>
    io.emit("jobUpdate", { type: "started", job }),
  );
  queue.events.on("jobCompleted", (job) =>
    io.emit("jobUpdate", { type: "completed", job }),
  );
  queue.events.on("jobFailed", (job) =>
    io.emit("jobUpdate", { type: "failed", job }),
  );
  queue.events.on("historyCleared", () => io.emit("historyCleared"));
});

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log("A client connected");
  // Optionally send initial state
  socket.emit("initialData", {
    request: requestQueue.getAllJobs(),
    fetch: fetchQueue.getAllJobs(),
    parse: parseQueue.getAllJobs(),
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
