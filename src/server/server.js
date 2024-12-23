// server.js
import { EventEmitter } from "events";
import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
// import { fileURLToPath } from "url";
// import { dirname } from "path";
import { Queue } from "./queue.js";
import { isDomainValid, isAlreadyRequested } from "./processor/request.js";
import {
  addParseJob,
  guessMimeType,
  parseHtml,
  parseCss,
} from "./processor/parse.js";
import { addFetchJob } from "./processor/fetch.js";
import { isCached, fetchHttp } from "./processor/fetch.js";
import { Cache } from "./utils/Cache.js";
import { RequestTracker } from "./utils/RequestTracker.js";
import { DataPatcher } from "./utils/DataPatcher.js";
// Replace cache object with instance
const cache = new Cache();
const requestTracker = new RequestTracker();
const dataPatcher = new DataPatcher();

dataPatcher
  .addRule({
    includes: [
      //
      "https://www.libregraphicsmeeting.org/2009/skin/project.css",
      "https://libregraphicsmeeting.org/2009/skin/project.css",
    ],
    search:
      ".projectabstract { float:left; width:150px; border:1px solid black; width:148px; -moz-border-radius:5px; -webkit-border-radius: 5px; */}",
    replace:
      ".projectabstract { float:left; width:150px; border:1px solid black; width:148px; -moz-border-radius:5px; -webkit-border-radius: 5px; }",
  })
  .addRule({
    includes: [
      //
      "https://www.libregraphicsmeeting.org/2012/wp/wp-content/plugins/gravityforms/css/forms-ver=1.5.1.1.css",
      "https://libregraphicsmeeting.org/2012/wp/wp-content/plugins/gravityforms/css/forms-ver=1.5.1.1.css",
      "https://www.libregraphicsmeeting.org/2013/wp/wp-content/plugins/gravityforms/css/forms-ver=1.5.1.1.css",
      "https://libregraphicsmeeting.org/2013/wp/wp-content/plugins/gravityforms/css/forms-ver=1.5.1.1.css",
      "https://www.libregraphicsmeeting.org/2014/wp/wp-content/plugins/gravityforms/css/forms-ver=1.5.1.1.css",
      "https://libregraphicsmeeting.org/2014/wp/wp-content/plugins/gravityforms/css/forms-ver=1.5.1.1.css",
    ],
    search: ".entry ul li:after {content:none; #}",
    replace: ".entry ul li:after {content:none; }",
  })
  .addRule({
    includes: [
      //
      "https://www.libregraphicsmeeting.org/2014/wp/wp-content/plugins/background-manager/resources/css/pub-ver=1.2.5.2.css",
      "https://libregraphicsmeeting.org/2014/wp/wp-content/plugins/background-manager/resources/css/pub-ver=1.2.5.2.css",
    ],
    search: "W -webkit-box-shadow:2px 2px 4px rgba(0,0,0,0.25);",
    replace: "-webkit-box-shadow:2px 2px 4px rgba(0,0,0,0.25);",
  });

// Get __dirname equivalent in ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);

// JSON middleware for APIs
app.use(express.json());

// Create queues with custom concurrency limits
const requestQueue = new Queue("request", { maxConcurrent: 100 });
const fetchQueue = new Queue("fetch", { maxConcurrent: 10 });
const parseQueue = new Queue("parse", { maxConcurrent: 100 });

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
        events,
        cache,
        getKey: (job) => job.data.uri,
      },
      next,
    );
  })
  .use(async (job, next) => {
    await fetchHttp({ job, cache, events }, next);
  })
  // process parse job
  .use(async (job, next) => {
    await addParseJob({ job, events }, next);
  });

parseQueue
  // guess mime type if not already set
  .use(async (job, next) => {
    await guessMimeType({ job, cache }, next);
  })

  // now parse the data
  .use(async (job, next) => {
    const { data: dataFromCache, metadata } = cache.get(job.data.cache.key);

    const data = dataPatcher.patch(job.data.uri, `${dataFromCache}`, (log) =>
      job.log(log),
    );

    if (!data || !metadata) {
      throw new Error(
        `No data or metadata found in cache ${job.data.cache.key}`,
      );
    }

    const mimeType = job.data.mimeType;

    switch (mimeType) {
      case "application/xhtml+xml":
      case "text/html": {
        await parseHtml({ job, events, data }, next);
        break;
      }
      case "text/css": {
        await parseCss({ job, events, data }, next);
        break;
      }
      case "application/javascript":
      //
      case "text/plain":
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
      case "image/vnd.microsoft.icon":
      case "application/vnd.oasis.opendocument.text":
      case "application/pdf":
      case "application/json":
      case "application/x-font-ttf":
      case "font/ttf":
      case "font/woff":
      case "font/woff2":
      case "application/vnd.ms-fontobject": // eot
      case "application/rss+xml":
      case "application/atom+xml":
      case "application/rdf+xml":
      case "application/rss+xml":
      case "application/rdf+xml":
      case "application/x-rss+xml":
      case "application/xml":
      case "application/x-www-form-urlencoded":
      case "application/x-shockwave-flash":
      case "application/epub+zip": {
        //
        break;
      }
      default: {
        throw new Error(
          `Unsupported content type: ${
            metadata.headers["content-type"] || "undefined"
          }`,
        );
      }
    }

    next();
  });

// Add debounce utility
const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

// Modify API endpoints
app.get("/api/stats", (req, res) => {
  const stats = {
    request: requestQueue.getStats(),
    fetch: fetchQueue.getStats(),
    parse: parseQueue.getStats()
  };
  res.json(stats);
});

app.get("/api/history", (req, res) => {
  const { status, search, queues, errorFilter, limit = 50 } = req.query;
  const selectedQueues = queues ? queues.split(',') : [];
  
  // Get filtered results from selected queues
  const results = {};
  selectedQueues.forEach(queueName => {
    const queue = {
      'request': requestQueue,
      'fetch': fetchQueue,
      'parse': parseQueue
    }[queueName];

    if (queue) {
      results[queueName] = queue.getFilteredHistory({ 
        status, 
        searchTerm: search, 
        errorFilter,
        limit 
      });
    }
  });
  
  // Combine results using round-robin
  const combined = {
    total: Object.values(results).reduce((sum, r) => sum + r.total, 0),
    jobs: []
  };
  
  let remaining = Math.min(limit, 
    Math.max(...Object.values(results).map(r => r.jobs.length))
  );
  
  while (remaining > 0) {
    for (const queueResults of Object.values(results)) {
      if (queueResults.jobs.length > 0) {
        combined.jobs.push(queueResults.jobs.shift());
      }
    }
    remaining--;
  }
  
  res.json(combined);
});

// API endpoint to get all jobs in queues
// app.get("/api/jobs", (req, res) => {
//   const allJobs = {
//     request: requestQueue.getAllJobs(),
//     fetch: fetchQueue.getAllJobs(),
//     parse: parseQueue.getAllJobs(),
//   };
//   res.json(allJobs);
// });

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
app.post("/api/jobs", async (req, res) => {
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
  emitQueueStats();
  res.json({ success: true, jobId });
});

// Split into two separate endpoints
app.post("/api/jobs/clear-history", (req, res) => {
  requestQueue.clearHistory();
  fetchQueue.clearHistory();
  parseQueue.clearHistory();
  requestTracker.clear();
  emitQueueStats();
  res.json({ success: true });
});

app.post("/api/jobs/clear-cache", (req, res) => {
  cache.clear();
  res.json({ success: true });
});

// Modify Socket.IO updates
const emitQueueStats = debounce(() => {
  const stats = {
    request: requestQueue.getStats(),
    fetch: fetchQueue.getStats(),
    parse: parseQueue.getStats()
  };
  io.emit('queueStats', stats);
  console.log('emitting queue stats');
}, 1000);

[requestQueue, fetchQueue, parseQueue].forEach(queue => {
  console.log("run emitQueueStats");
  queue.events.on("jobAdded", () => emitQueueStats());
  queue.events.on("jobStarted", () => emitQueueStats());
  queue.events.on("jobCompleted", () => emitQueueStats());
  queue.events.on("jobFailed", () => emitQueueStats());
  queue.events.on("jobProgress", () => emitQueueStats());
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
