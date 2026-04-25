import { AdminPayload } from "@/model/interface";

export async function setAuth(accessToken: string, admin: AdminPayload) {
  await fetch("/api/auth/set-cookie", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessToken, admin }),
  });
}

export async function clearAuth() {
  await fetch("/api/auth/clear-cookie", { method: "POST" });
}
