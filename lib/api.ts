import {
  Agent,
  AgentOrder,
  AuditLog,
  Bundle,
  CreateOrderPayload,
  GetAllOrdersParams,
  Order,
  OrderPublicStatus,
  PaginatedAgentOrders,
  PaginatedOrders,
  PaginatedWalletTransactions,
} from "@/model/interface";
import {
  CreateBundlePayload,
  Network,
  UpdateBundlePayload,
} from "@/model/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api";

function getToken(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : undefined;
}

async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  authenticated = false,
  tokenOverride?: string,
  unauthorizedRedirect?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string>),
  };

  if (authenticated) {
    const token = tokenOverride ?? getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (
    response.status === 401 &&
    unauthorizedRedirect &&
    typeof window !== "undefined"
  ) {
    const { clearAuth } = await import("@/lib/auth");
    clearAuth();
    window.location.href = unauthorizedRedirect;
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      body?.message ??
        `${init?.method ?? "GET"} ${path} failed: ${response.statusText}`,
    );
  }

  // 204 No Content — return undefined
  if (response.status === 204) return undefined as T;

  return response.json();
}

// Shorthand helpers
const authFetch = <T>(path: string, init?: RequestInit) =>
  apiFetch<T>(path, init, true, undefined, "/login");

const publicFetch = <T>(path: string, init?: RequestInit) =>
  apiFetch<T>(path, init, false);

function agentFetch<T>(path: string, init?: RequestInit) {
  if (typeof document === "undefined") return apiFetch<T>(path, init, false);
  const match = document.cookie.match(/(?:^|;\s*)agent_token=([^;]*)/);
  const token = match ? decodeURIComponent(match[1]) : undefined;
  return apiFetch<T>(path, init, true, token, "/store/agent/login");
}

// ─── Orders API  ─────────────────────────────────────────────────

export const ordersApi = {
  getAll(params: GetAllOrdersParams): Promise<PaginatedOrders> {
    const q = new URLSearchParams({
      page: params.page.toString(),
      limit: params.limit.toString(),
      ...(params.status && { status: params.status }),
    });
    return authFetch<PaginatedOrders>(`/orders?${q}`);
  },

  getById(id: string): Promise<Order> {
    return authFetch<Order>(`/orders/${id}`);
  },

  getAuditLog(id: string): Promise<AuditLog[]> {
    return authFetch<AuditLog[]>(`/orders/${id}/audit`);
  },

  getStatus(id: string): Promise<OrderPublicStatus> {
    return publicFetch<OrderPublicStatus>(`/orders/${id}/status`);
  },

  lookup(reference: string, phone: string): Promise<Order> {
    return publicFetch<Order>("/orders/lookup", {
      method: "POST",
      body: JSON.stringify({ reference, phone }),
    });
  },

  lookupAudit(reference: string, phone: string): Promise<AuditLog[]> {
    return publicFetch<AuditLog[]>("/orders/lookup/audit", {
      method: "POST",
      body: JSON.stringify({ reference, phone }),
    });
  },

  create(payload: CreateOrderPayload): Promise<Order> {
    return publicFetch<Order>("/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

// ─── Bundles API ──────────────────────────────────────────────────────────────

export const bundlesApi = {
  getAll(network?: Network): Promise<Bundle[]> {
    const q = new URLSearchParams(network ? { network } : {});
    const qs = q.toString();
    return publicFetch<Bundle[]>(`/bundles${qs ? `?${qs}` : ""}`);
  },

  getOne(id: string): Promise<Bundle> {
    return publicFetch<Bundle>(`/bundles/${id}`);
  },

  create(payload: CreateBundlePayload): Promise<Bundle> {
    return authFetch<Bundle>("/bundles", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update(id: string, payload: UpdateBundlePayload): Promise<Bundle> {
    return authFetch<Bundle>(`/bundles/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  deactivate(id: string): Promise<void> {
    return authFetch<void>(`/bundles/${id}`, { method: "DELETE" });
  },
};

// ─── Agents API ───────────────────────────────────────────────────────────────
export const agentsApi = {
  list(status?: string): Promise<Agent[]> {
    const q = new URLSearchParams(status ? { status } : {});
    const qs = q.toString();
    return authFetch<Agent[]>(`/agents/admin/list${qs ? `?${qs}` : ""}`);
  },

  approve(id: string): Promise<void> {
    return authFetch<void>(`/agents/admin/${id}/approve`, { method: "POST" });
  },

  suspend(id: string): Promise<void> {
    return authFetch<void>(`/agents/admin/${id}/suspend`, { method: "POST" });
  },
};

// ─── Agent Auth API ───────────────────────────────────────────────────────────

export const agentAuthApi = {
  register(payload: {
    businessName: string;
    name: string;
    phoneNumber: string;
    pin: string;
  }) {
    return publicFetch<{ id: string; businessName: string; status: string }>(
      "/agents/apply",
      { method: "POST", body: JSON.stringify(payload) },
    );
  },

  login(payload: { phoneNumber: string; pin: string }) {
    return publicFetch<{ accessToken: string }>("/auth/agent/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

// ─── Agent Profile & Wallet API ───────────────────────────────────────────────

export const agentProfileApi = {
  getProfile() {
    return agentFetch<Agent>("/agents/profile");
  },

  topUp(payload: { amount: number; payerPhone: string }) {
    return agentFetch<{ providerRef: string }>("/agents/wallet/topup", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getTransactions(page = 1, limit = 20) {
    return agentFetch<PaginatedWalletTransactions>(
      `/agents/wallet/transactions?page=${page}&limit=${limit}`,
    );
  },
};

// ─── Agent Orders API ─────────────────────────────────────────────────────────

export const agentOrdersApi = {
  place(payload: {
    bundleId: string;
    recipientPhone: string;
    recipientNetwork: string;
  }) {
    return agentFetch<AgentOrder>("/agents/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getAll(page = 1, limit = 20) {
    return agentFetch<PaginatedAgentOrders>(
      `/agents/orders?page=${page}&limit=${limit}`,
    );
  },
};
