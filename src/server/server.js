// server.js
import { EventEmitter } from "events";
import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { Queue } from "./queue.js";

export class WebServer {
  constructor(options = {}) {
    // Initialize configurable components
    this.cache = options.cache;
    this.dataPatcher = options.dataPatcher;
    this.requestTracker = options.requestTracker;

    // Initialize queues with custom settings
    this.queues = {
      request: new Queue("request", {
        maxConcurrent: options.requestConcurrency || 100,
      }),
      fetch: new Queue("fetch", {
        maxConcurrent: options.fetchConcurrency || 10,
      }),
      parse: new Queue("parse", {
        maxConcurrent: options.parseConcurrency || 100,
      }),
    };

    // Initialize express and socket.io
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = new SocketIOServer(this.server);
    this.events = new EventEmitter();

    // Setup middleware
    this.app.use(express.json());

    // Initialize server
    this.setupEventHandlers();
    this.setupRoutes();
    this.setupSocketHandlers();
  }

  // Configure queue processors
  configureQueues(processors) {
    if (processors.request) {
      processors.request.forEach((processor) => {
        this.queues.request.use(processor);
      });
    }

    if (processors.fetch) {
      processors.fetch.forEach((processor) => {
        this.queues.fetch.use(processor);
      });
    }

    if (processors.parse) {
      processors.parse.forEach((processor) => {
        this.queues.parse.use(processor);
      });
    }
  }

  setupEventHandlers() {
    this.events.on("createRequestJob", (data) => {
      let { cache, ...dataWithoutCache } = data;
      this.queues.request.addJob(dataWithoutCache);
    });

    this.events.on("createFetchJob", (data) => {
      this.queues.fetch.addJob(data);
    });

    this.events.on("createParseJob", (data) => {
      this.queues.parse.addJob(data);
    });
  }

  // Add debounce utility
  debounce(fn, delay) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  }

  setupRoutes() {
    // Stats endpoint
    this.app.get("/api/stats", (req, res) => {
      const stats = {
        request: this.queues.request.getStats(),
        fetch: this.queues.fetch.getStats(),
        parse: this.queues.parse.getStats(),
      };
      res.json(stats);
    });

    // History endpoint
    this.app.get("/api/history", (req, res) => {
      const { status, search, queues, errorFilter, limit = 50 } = req.query;
      const selectedQueues = queues ? queues.split(",") : [];

      const results = {};
      selectedQueues.forEach((queueName) => {
        const queue = this.queues[queueName];
        if (queue) {
          results[queueName] = queue.getFilteredHistory({
            status,
            searchTerm: search,
            errorFilter,
            limit,
          });
        }
      });

      // Combine results using round-robin
      const combined = {
        total: Object.values(results).reduce((sum, r) => sum + r.total, 0),
        jobs: [],
      };

      let remaining = Math.min(
        limit,
        Math.max(...Object.values(results).map((r) => r.jobs.length)),
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

    // Job detail endpoint
    this.app.get("/api/jobs/:id", (req, res) => {
      const job = Object.values(this.queues)
        .map((queue) => queue.getJobById(req.params.id))
        .find((job) => job);

      if (job) {
        res.json(job);
      } else {
        res.status(404).json({ error: "Job not found" });
      }
    });

    // Add job endpoint
    this.app.post("/api/jobs", async (req, res) => {
      const { type, data } = req.body;
      const queue = this.queues[type];

      if (!queue) {
        return res.status(400).json({ error: "Invalid queue type" });
      }

      const jobId = queue.addJob(data);
      this.emitQueueStats();
      res.json({ success: true, jobId });
    });

    // Clear history endpoint
    this.app.post("/api/jobs/clear-history", (req, res) => {
      Object.values(this.queues).forEach((queue) => queue.clearHistory());
      this.requestTracker.clear();
      this.emitQueueStats();
      res.json({ success: true });
    });

    // Clear cache endpoint
    this.app.post("/api/jobs/clear-cache", (req, res) => {
      this.cache.clear();
      res.json({ success: true });
    });
  }

  setupSocketHandlers() {
    const emitQueueStats = this.debounce(() => {
      const stats = {
        request: this.queues.request.getStats(),
        fetch: this.queues.fetch.getStats(),
        parse: this.queues.parse.getStats(),
      };
      this.io.emit("queueStats", stats);
      this.io.emit("historyUpdate");
    }, 250);

    // Store reference for use in other methods
    this.emitQueueStats = emitQueueStats;

    // Setup queue event handlers
    Object.values(this.queues).forEach((queue) => {
      queue.events.on("jobAdded", emitQueueStats);
      queue.events.on("jobStarted", emitQueueStats);
      queue.events.on("jobCompleted", emitQueueStats);
      queue.events.on("jobFailed", emitQueueStats);
      queue.events.on("jobProgress", emitQueueStats);
      queue.events.on("jobLog", (job) => {
        this.io.emit("jobUpdate", job);
      });
    });

    // Socket connection handler
    this.io.on("connection", (socket) => {
      console.log("A client connected");
      socket.emit("initialData", {
        request: this.queues.request.getAllJobs(),
        fetch: this.queues.fetch.getAllJobs(),
        parse: this.queues.parse.getAllJobs(),
      });
    });
  }

  start(port = 3000) {
    return new Promise((resolve) => {
      this.server.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
        resolve();
      });
    });
  }

  stop() {
    return new Promise((resolve) => {
      this.server.close(() => {
        console.log("Server stopped");
        resolve();
      });
    });
  }
}
