import { Navigate, Outlet, useLocation } from "react-router";
import type { Role, User } from "@/api";
import { useAuth } from "./AuthContext";

/** Where each role lands after signing in. */
export function homeFor(user: User): string {
  return user.role === "admin" ? "/admin" : "/";
}

/** Wait for the session check, then send signed-out visitors to the login page. */
export function RequireAuth() {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) return <div className="sr-only" role="status">Loading…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

/** Only lets the given role through; everyone else goes to their own home. */
export function RequireRole({ role }: { role: Role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={homeFor(user)} replace />;
  return <Outlet />;
}
