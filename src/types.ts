export type HexColor = `#${string}`;

export interface Category {
  id: string;
  name: string;
  description: string;
  position: number;
  hidden: boolean;
  createdAt: string;
}

export type ButtonColor = "Primary" | "Secondary" | "Success" | "Danger";

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  stock: number;
  requiredRoleId?: string;
  hidden: boolean;
  buttonColor: ButtonColor;
  emoji?: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface ShopSettings {
  storeName: string;
  description: string;
  footer: string;
  embedColor: HexColor;
  thumbnail?: string;
  banner?: string;
  status: "open" | "closed";
  supportText: string;
  buttons: {
    browse: string;
    order: string;
    support: string;
    information: string;
  };
}

export interface PaymentSettings {
  enabled: boolean;
  trueMoneyWallet?: string;
  promptPay?: string;
  bankAccount?: string;
  bankName?: string;
  accountName?: string;
  qrImage?: string;
  paymentChannelId?: string;
  slipChannelId?: string;
  instructions: string;
}

export interface TicketSettings {
  categoryId?: string;
  supportCategoryId?: string;
  staffRoleIds: string[];
  transcriptChannelId?: string;
  ticketPrefix: string;
}

export interface BotSettings {
  ownerId?: string;
  staffRoleIds: string[];
  locale: "th";
  maintenanceMode: boolean;
}

export type OrderStatus = "pending_payment" | "pending_review" | "approved" | "rejected" | "refunded" | "cancelled" | "closed";

export interface Order {
  id: string;
  guildId: string;
  channelId: string;
  customerId: string;
  productId?: string;
  productName: string;
  price: number;
  status: OrderStatus;
  type: "order" | "support";
  createdAt: string;
  updatedAt: string;
  slipMessageId?: string;
  staffNote?: string;
}

export type StockTransactionType = "purchase" | "restock" | "adjustment" | "refund" | "reservation" | "cancellation";

export interface StockTransaction {
  id: string;
  guildId: string;
  productId: string;
  type: StockTransactionType;
  quantity: number;
  previousStock: number;
  newStock: number;
  orderId?: string;
  reason?: string;
  performedBy: string;
  createdAt: string;
}

export interface StockReservation {
  id: string;
  guildId: string;
  productId: string;
  customerId: string;
  orderId?: string;
  quantity: number;
  expiresAt: string;
  createdAt: string;
}

export type StockAlertType = "low_stock" | "out_of_stock" | "restock_request";

export interface StockAlert {
  id: string;
  guildId: string;
  productId: string;
  type: StockAlertType;
  threshold: number;
  currentStock: number;
  acknowledged: boolean;
  acknowledgedBy?: string;
  createdAt: string;
  acknowledgedAt?: string;
}

export interface RestockRequest {
  id: string;
  guildId: string;
  productId: string;
  requestedBy: string;
  requestedQuantity: number;
  status: "pending" | "approved" | "rejected";
  notes?: string;
  reviewedBy?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface GuildSettings {
  shop: ShopSettings;
  payment: PaymentSettings;
  tickets: TicketSettings;
  bot: BotSettings;
}

export interface DatabaseFile<T> {
  version: 1;
  data: Record<string, T>;
}
