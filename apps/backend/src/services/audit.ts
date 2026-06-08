/**
 * Backward-compatible re-export of the audit repository `createAuditLog`.
 * All existing imports of `audit` from this file continue to work.
 */

export { createAuditLog as audit } from "../repositories/audit.repository.js";
