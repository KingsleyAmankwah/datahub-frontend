import { Network, OrderStatus, AgentStatus } from "./types";

export interface AdminPayload {
  id: string;
  email: string;
  name: string;
}

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

export interface BundleFormData {
  name: string;
  network: Network;
  dataMb: string;
  validityDays: string;
  costPrice: string;
  sellingPrice: string;
  description: string;
  sortOrder: string;
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

export interface CreateOrderPayload {
  bundleId: string;
  buyerPhone: string;
  recipientPhone: string;
}

export interface OrderPublicStatus {
  id: string;
  reference: string;
  status: OrderStatus;
  amount: number;
  recipientPhone: string;
  recipientNetwork: Network;
  createdAt: string;
  updatedAt?: string;
}

export interface GetAllOrdersParams {
  page: number;
  limit: number;
  status?: string;
}

export interface Agent {
  id: string;
  userId: string;
  businessName: string;
  status: AgentStatus;
  commissionRate: number;
  createdAt: string;
  user: {
    phoneNumber: string;
    name: string | null;
    walletBalance: number;
  };
}

export interface WalletTransaction {
  id: string;
  type: "TOPUP" | "DEDUCTION" | "REFUND";
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string | null;
  orderId: string | null;
  createdAt: string;
}

export interface PaginatedWalletTransactions {
  transactions: WalletTransaction[];
  total: number;
  page: number;
  pages: number;
}

export interface AgentOrder {
  id: string;
  reference: string;
  status: import("./types").OrderStatus;
  amount: number;
  recipientPhone: string;
  recipientNetwork: import("./types").Network;
  createdAt: string;
}

export interface PaginatedAgentOrders {
  orders: AgentOrder[];
  total: number;
  page: number;
  pages: number;
}
