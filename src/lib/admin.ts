import { auth } from "./firebase";

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAdmin(): boolean {
  if (!auth?.currentUser || ADMIN_EMAILS.length === 0) return false;
  return ADMIN_EMAILS.includes(auth.currentUser.email?.toLowerCase() || "");
}
