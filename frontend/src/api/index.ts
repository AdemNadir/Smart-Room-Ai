import { mockAuth } from "./mock/auth";

/**
 * The only door between the UI and the server.
 * Screens import `api` and never know whether data is mocked or real;
 * switching to the backend means replacing the implementations here.
 */
export const api = {
  auth: mockAuth,
};

/** True while the app runs on synthetic data (drives the "demo accounts" helper on the login page). */
export const IS_DEMO = true;

export { ApiError } from "./types";
export type { Role, User } from "./types";
