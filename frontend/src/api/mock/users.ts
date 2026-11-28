import type { User } from "../types";

/**
 * DEMO DATA ONLY — synthetic accounts for running the interface before the backend exists.
 * This module is replaced by the real API; it must never be treated as authentication.
 */
export const DEMO_PASSWORD = "demo-1234";

export type DemoAccount = User & { hint: string };

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { id: "u-prof-a", displayName: "Prof. A", email: "prof.a@univ.test", role: "professor", hint: "Professor" },
  { id: "u-prof-b", displayName: "Prof. B", email: "prof.b@univ.test", role: "professor", hint: "Second professor" },
  { id: "u-admin", displayName: "Admin", email: "admin@univ.test", role: "admin", hint: "Administrator" },
];
