import { EventEmitter } from "events";

const LCG = (s) => {
  return () => {
    s = Math.imul(48271, s) | 0 % 2147483647;
    return (s & 2147483647) / 2147483648;
  };
};

let rand = LCG(42);

function uuid(name) {
  return `${name}-${rand().toString(16).substring(2, 15)}${rand().toString(16).substring(2, 15)}`;
}

export class Queue {
  constructor(name, options = {}) {
    this.name = name;
    this.processors = [];
    this.jobs = [];
    this.history = [];
    this.events = new EventEmitter();
    this.maxConcurrent = options.maxConcurrent || 20; // Default to 20 concurrent jobs
    this.runningJobs = 0;
    this.pendingJobs = [];
  }

  // Register a new processor
  use(processor) {
    this.processors.push(processor);
    return this;
  }

  // Add a job to the queue
  async addJob(data) {
    const job = {
      id: uuid(this.name),
      data,
      status: "queued",
      createdAt: new Date().toISOString(),
      sort: performance.now(),
      logs: [],
      queueName: this.name,
    };

    job.log = (entry) => {
      job.logs.push({
        createdAt: new Date().toISOString(),
        text: entry,
      });
    };

    this.jobs.push(job);
    this.events.emit("jobAdded", job);
    
    // Check if we can process the job now or need to queue it
    if (this.runningJobs < this.maxConcurrent) {
      this.runningJobs++;
      await this.processJob(job);
    } else {
      this.pendingJobs.push(job);
    }
    
    return job.id;
  }

  // Process a job through all processors
  async processJob(job) {
    try {
      job.status = "in-progress";
      job.startedAt = new Date().toISOString();
      this.events.emit("jobStarted", job);

      let index = 0;
      const next = async (error, terminate) => {
        if (error) {
          return this.failJob(job, error);
        }

        if (terminate) {
          return this.completeJob(job);
        }

        const processor = this.processors[index];
        index++;

        if (!processor) {
          return this.completeJob(job);
        }

      try {
        await processor(job, next);
      } catch (err) {
        await this.failJob(job, err);
      }
    };

      await next();
    } finally {
      // Decrease running jobs counter and process next job if available
      this.runningJobs--;
      this.processNextJob();
    }
  }

  // New method to process next pending job
  processNextJob() {
    if (this.pendingJobs.length > 0 && this.runningJobs < this.maxConcurrent) {
      const nextJob = this.pendingJobs.shift();
      this.runningJobs++;
      this.processJob(nextJob);
    }
  }

  // Complete a job
  async completeJob(job) {
    job.status = "completed";
    job.finishedAt = new Date().toISOString();
    this.moveToHistory(job);
    this.events.emit("jobCompleted", job);
  }

  // Fail a job
  async failJob(job, error) {
    job.status = "failed";
    job.log(error.message);
    job.finishedAt = new Date().toISOString();
    this.moveToHistory(job);
    this.events.emit("jobFailed", job);
  }

  // Move job to history
  moveToHistory(job) {
    const index = this.jobs.findIndex((j) => j.id === job.id);
    if (index !== -1) {
      this.jobs.splice(index, 1);
      this.history.push(job);
    }
  }

  // Get all jobs
  getAllJobs() {
    return {
      active: this.jobs,
      history: this.history,
    };
  }

  // Get job by ID
  getJobById(id) {
    return (
      this.jobs.find((j) => j.id === id) ||
      this.history.find((j) => j.id === id)
    );
  }

  // Update job log
  updateJobLog(jobId, entry) {
    const job = this.getJobById(jobId);
    if (job) {
      if (Array.isArray(entry)) {
        job.log.push(...entry);
      } else {
        job.log.push(entry);
      }
    }
  }

  // Add this new method to the Queue class
  clearHistory() {
    this.history = [];
    this.events.emit("historyCleared");
  }
}
