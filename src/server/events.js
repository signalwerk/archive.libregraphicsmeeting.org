// events.js
// A single event emitter to broadcast queue events throughout the system
import { EventEmitter } from 'events';
export const queueEvents = new EventEmitter();
