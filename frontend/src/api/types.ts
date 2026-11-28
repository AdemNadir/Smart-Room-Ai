/** Domain types shared by the UI. They mirror the data model in the project specification (section 6). */

export type Role = "professor" | "admin";

export type User = {
  id: string;
  displayName: string;
  email: string;
  role: Role;
};

/** An error with a message that is safe to show to the person using the app. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly code: "invalid_credentials" | "network" | "unknown" = "unknown",
  ) {
    super(message);
    this.name = "ApiError";
  }
}
