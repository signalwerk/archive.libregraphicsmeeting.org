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
  constructor(name) {
    this.name = name;
    this.processors = [];
    this.jobs = [];
    this.history = [];
    this.events = new EventEmitter();
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
      //   this.events.emit("jobLog", job.id, entry);
    };

    this.jobs.push(job);
    this.events.emit("jobAdded", job);
    await this.processJob(job);
    return job.id;
  }

  // Process a job through all processors
  async processJob(job) {
    job.status = "in-progress";
    job.startedAt = new Date().toISOString();
    this.events.emit("jobStarted", job);

    let index = 0;
    const next = async (error, terminate) => {
      if (error) {
        return this.failJob(job, error);
      }

      // If terminate is true, complete the job without running remaining processors
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
