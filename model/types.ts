export type OrderStatus =
  | "PENDING"
  | "PAYMENT_INITIATED"
  | "PAYMENT_SUCCESS"
  | "PAYMENT_FAILED"
  | "FULFILLMENT_INITIATED"
  | "FULFILLED"
  | "FULFILLMENT_FAILED"
  | "REFUNDED";

export type Network = "MTN" | "TELECEL" | "AIRTELTIGO";

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

export type AgentStatus = "PENDING" | "ACTIVE" | "SUSPENDED";
