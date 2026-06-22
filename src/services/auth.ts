const TOKEN_KEY = "token";
const USER_KEY = "user";
export const AUTH_CHANGE_EVENT = "auth-change";

function notifyAuthChange(): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export const UserRole = {
  Admin: "Admin",
  Employee: "Employee",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse extends AuthUser {
  token: string;
}

export function setAuth({ token, ...user }: AuthResponse): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  notifyAuthChange();
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;

  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  notifyAuthChange();
}

export function isAuthenticated(): boolean {
  return !!getToken() && !!getUser();
}

export function isAdmin(): boolean {
  if (!isAuthenticated()) return false;

  return getUser()?.role === UserRole.Admin;
}
