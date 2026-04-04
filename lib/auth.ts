import Cookies from "js-cookie";

const TOKEN_KEY = "token";
const ADMIN_KEY = "admin";

export interface AdminPayload {
  id: string;
  email: string;
  name: string;
}

export function setAuth(accessToken: string, admin: AdminPayload) {
  Cookies.set(TOKEN_KEY, accessToken, { expires: 1, path: "/" });
  Cookies.set(ADMIN_KEY, JSON.stringify(admin), { expires: 1, path: "/" });
}

export function getToken(): string | undefined {
  return Cookies.get(TOKEN_KEY);
}

export function getAdmin(): AdminPayload | null {
  const raw = Cookies.get(ADMIN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminPayload;
  } catch {
    return null;
  }
}

export function clearAuth() {
  Cookies.remove(TOKEN_KEY, { path: "/" });
  Cookies.remove(ADMIN_KEY, { path: "/" });
}
