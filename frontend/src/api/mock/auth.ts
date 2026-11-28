import { ApiError, type User } from "../types";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "./users";

const STORAGE_KEY = "smart-room.demo-session";
const LATENCY_MS = 450; // lets loading states be seen and tested

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

function toUser({ hint: _hint, ...user }: (typeof DEMO_ACCOUNTS)[number]): User {
  return user;
}

function readSession(): User | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null; // storage unavailable or corrupted: behave as signed out
  }
}

export const mockAuth = {
  async me(): Promise<User | null> {
    await wait(120);
    return readSession();
  },

  async login(email: string, password: string): Promise<User> {
    await wait(LATENCY_MS);
    const account = DEMO_ACCOUNTS.find((a) => a.email === email.trim().toLowerCase());
    // One generic message for both cases: never reveal which part was wrong.
    if (!account || password !== DEMO_PASSWORD) {
      throw new ApiError("The email or password is not correct.", "invalid_credentials");
    }
    const user = toUser(account);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch {
      /* session simply will not survive a refresh */
    }
    return user;
  },

  async logout(): Promise<void> {
    await wait(80);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* nothing to clear */
    }
  },
};
