import Cookies from "js-cookie";

const TOKEN_KEY = "agent_token";

export function setAgentToken(token: string) {
  Cookies.set(TOKEN_KEY, token, { expires: 1, path: "/" });
}

export function getAgentToken(): string | undefined {
  return Cookies.get(TOKEN_KEY);
}

export function clearAgentAuth() {
  Cookies.remove(TOKEN_KEY, { path: "/" });
}
