export class RequestTracker {
  constructor() {
    this.requested = new Set();
  }

  hasBeenRequested(url) {
    return this.requested.has(url);
  }

  markAsRequested(url) {
    this.requested.add(url);
  }

  clear() {
    this.requested.clear();
  }
} 