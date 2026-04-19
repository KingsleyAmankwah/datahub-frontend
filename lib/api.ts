import {
  AuditLog,
  Bundle,
  CreateOrderPayload,
  GetAllOrdersParams,
  Order,
  OrderPublicStatus,
  PaginatedOrders,
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
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string>),
  };

  if (authenticated) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok)
    throw new Error(
      `${init?.method ?? "GET"} ${path} failed: ${response.statusText}`,
    );

  // 204 No Content — return undefined
  if (response.status === 204) return undefined as T;

  return response.json();
}

// Shorthand helpers
const authFetch = <T>(path: string, init?: RequestInit) =>
  apiFetch<T>(path, init, true);

const publicFetch = <T>(path: string, init?: RequestInit) =>
  apiFetch<T>(path, init, false);

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
