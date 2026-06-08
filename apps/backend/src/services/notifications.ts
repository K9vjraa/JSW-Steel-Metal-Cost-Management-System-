/**
 * Backward-compatible re-export of the notification service.
 * All callers that import `notify` or `notificationBus` from this file
 * now use the same instance as `services/notification.service.ts`.
 */

export { notify, notificationBus } from "./notification.service.js";
