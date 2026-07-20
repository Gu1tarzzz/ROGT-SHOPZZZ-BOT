export type HexColor = `#${string}`;

export interface Category {
  id: string;
  guildId: string;
  name: string;
  description: string;
  position: number;
  hidden: boolean;
  featured: boolean;
  emoji?: string;
  createdAt: string;
  updatedAt: string;
}

export type ButtonColor = "Primary" | "Secondary" | "Success" | "Danger";

export interface Product {
  id: string;
  guildId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  thumbnailUrl?: string;
  stock: number;
  requiredRoleId?: string;
  hidden: boolean;
  buttonColor: ButtonColor;
  emoji?: string;
  status: "active" | "inactive";
  featured: boolean;
  tags: string[];
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
  bannerGif?: string;
  storeLogo?: string;
  status: "open" | "closed";
  supportText: string;
  authorName?: string;
  authorIcon?: string;
  marketplaceFeatures?: string[];
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
  locale: "th" | "en";
  maintenanceMode: boolean;
}

export type OrderStatus = "pending_payment" | "pending_review" | "approved" | "rejected" | "refunded" | "cancelled" | "closed";

export interface Order {
  id: string;
  guildId: string;
  channelId: string;
  customerId: string;
  customerName: string;
  productId?: string;
  productName: string;
  price: number;
  finalPrice: number;
  discountAmount: number;
  couponCode?: string;
  status: OrderStatus;
  type: "order" | "support";
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  slipMessageId?: string;
  staffNote?: string;
  customerNote?: string;
}

export type StockTransactionType = "purchase" | "restock" | "adjustment" | "refund" | "reservation" | "cancellation" | "bulk_add" | "bulk_delete";

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

export type StockItemStatus = "available" | "reserved" | "delivered" | "deleted";

export interface StockItem {
  id: string;
  guildId: string;
  productId: string;
  content: string;
  status: StockItemStatus;
  deliveredTo?: string;
  deliveredAt?: string;
  reservedUntil?: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  guildId: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  description?: string;
  expiresAt?: string;
  usageLimit?: number;
  usedCount: number;
  perUserLimit?: number;
  enabled: boolean;
  createdAt: string;
}

export interface CouponUsage {
  id: string;
  couponId: string;
  userId: string;
  orderId: string;
  discountAmount: number;
  usedAt: string;
}

export interface ShoppingCartItem {
  productId: string;
  quantity: number;
}

export interface ShoppingCart {
  customerId: string;
  guildId: string;
  items: ShoppingCartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface UserAccount {
  id: string;
  guildId: string;
  userId: string;
  userName: string;
  balance: number;
  points: number;
  totalSpent: number;
  totalOrders: number;
  warnings: number;
  notes?: string;
  blacklisted: boolean;
  blacklistedAt?: string;
  blacklistedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderHistory {
  id: string;
  guildId: string;
  customerId: string;
  customerName: string;
  productId?: string;
  productName: string;
  price: number;
  finalPrice: number;
  discountAmount: number;
  couponCode?: string;
  paymentStatus: "pending" | "paid" | "refunded";
  deliveryStatus: "pending" | "delivered" | "failed";
  deliveredItemId?: string;
  staffId?: string;
  status: OrderStatus;
  createdAt: string;
  completedAt?: string;
}

export type LogType = "purchase" | "delivery" | "refund" | "cancel" | "restock" | "adjustment" | "coupon_applied" | "stock_add" | "stock_remove" | "admin_action" | "error" | "ticket" | "system";

export interface ActivityLog {
  id: string;
  guildId: string;
  type: LogType;
  category: "commerce" | "stock" | "finance" | "user" | "admin" | "ticket" | "system";
  action: string;
  details: Record<string, unknown>;
  performedBy: string;
  performedByName?: string;
  targetId?: string;
  targetType?: "user" | "product" | "category" | "order" | "ticket";
  createdAt: string;
}

export interface ShopStatistics {
  guildId: string;
  date: string;
  totalOrders: number;
  totalRevenue: number;
  productsSold: number;
  newCustomers: number;
  refunds: number;
  refundAmount: number;
}

export interface DailyStats {
  guildId: string;
  date: string;
  orders: number;
  revenue: number;
  uniqueCustomers: number;
  topProductId?: string;
  topProductSales: number;
}

export interface ProductTag {
  id: string;
  guildId: string;
  name: string;
  color: HexColor;
  emoji?: string;
  createdAt: string;
}

export interface TaggedProduct {
  productId: string;
  tagId: string;
  guildId: string;
  createdAt: string;
}

export interface PurchaseLog {
  id: string;
  guildId: string;
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  price: number;
  finalPrice: number;
  discountAmount: number;
  couponCode?: string;
  quantity: number;
  stockItemId?: string;
  orderId?: string;
  deliveredAt: string;
  createdAt: string;
}

export interface ShopAppearance {
  guildId: string;
  bannerUrl?: string;
  bannerGif?: string;
  thumbnailUrl?: string;
  storeLogo?: string;
  colorTheme: HexColor;
  footerText: string;
  authorName?: string;
  authorIcon?: string;
  animatedBanner: boolean;
  showStatistics: boolean;
  featuredCategories: string[];
  featuredProducts: string[];
}

export interface GuildSettings {
  shop: ShopSettings;
  payment: PaymentSettings;
  tickets: TicketSettings;
  bot: BotSettings;
}

export interface DatabaseFile<T> {
  version: 2;
  lastModified: string;
  data: Record<string, T>;
}

export interface SearchResult {
  type: "category" | "product" | "user" | "order" | "stock" | "log";
  id: string;
  name: string;
  description?: string;
  guildId: string;
}

export const DEFAULT_STOCK_SETTINGS = {
  lowStockThreshold: 5,
  reservationDurationMinutes: 15,
  autoAlertsEnabled: true
} as const;
