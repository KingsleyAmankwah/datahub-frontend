export async function setAgentToken(token: string) {
  await fetch("/api/auth/set-agent-cookie", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessToken: token }),
  });
}

export async function clearAgentAuth() {
  await fetch("/api/auth/clear-cookie", { method: "POST" });
}
