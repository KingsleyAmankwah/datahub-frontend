export type OrderStatus =
  | "PENDING"
  | "PAYMENT_INITIATED"
  | "PAYMENT_FAILED"
  | "FULFILLMENT_INITIATED"
  | "FULFILLMENT_FAILED"
  | "FULFILLED";

export type Network = "MTN" | "TELECEL" | "AIRTELTIGO";

export interface User {
  id: string;
  phoneNumber: string;
}

export interface Bundle {
  id: string;
  name: string;
  network: Network;
  dataMb?: number;
  validityDays: number;
  costPrice: number;
  sellingPrice: number;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Payment {
  provider: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  providerRef?: string;
  initiatedAt: string;
  completedAt?: string;
}

export interface Fulfillment {
  provider: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  attemptCount: number;
  lastAttemptAt?: string;
  completedAt?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Order {
  id: string;
  reference: string;
  user: User;
  recipientPhone: string;
  recipientNetwork: Network;
  bundle?: Bundle;
  amount: number;
  status: OrderStatus;
  payment?: Payment;
  fulfillment?: Fulfillment;
  createdAt: string;
  updatedAt?: string;
}

export interface PaginatedOrders {
  orders: Order[];
  total: number;
  page: number;
  pages: number;
}

export interface PaginatedBundles {
  bundles: Bundle[];
  total: number;
  page: number;
  pages: number;
}

export interface CreateOrderPayload {
  bundleId: string;
  buyerPhone: string;
  recipientPhone: string;
}

export interface GetAllOrdersParams {
  page: number;
  limit: number;
  status?: string;
}

export interface GetAllBundlesParams {
  page: number;
  limit: number;
  search?: string;
  network?: Network;
  isActive?: boolean;
}

export type CreateBundlePayload = {
  name: string;
  network: Network;
  dataMb: number;
  validityDays: number;
  costPrice: number;
  sellingPrice: number;
  description?: string;
  sortOrder?: number;
};

export type UpdateBundlePayload = {
  name?: string;
  costPrice?: number;
  sellingPrice?: number;
  isActive?: boolean;
  sortOrder?: number;
};

export type BundlePayload = CreateBundlePayload;
