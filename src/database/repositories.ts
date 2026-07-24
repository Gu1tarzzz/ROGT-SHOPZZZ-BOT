import { randomUUID } from "node:crypto";
import { DEFAULT_GUILD_SETTINGS, DEFAULT_STOCK_SETTINGS } from "../config/constants.js";
import type { Category, DatabaseFile, GuildSettings, HexColor, Order, Product, StockTransaction, StockReservation, StockAlert, RestockRequest, StockItem, Coupon, CouponUsage, ShoppingCart, OrderHistory, PurchaseLog, ShopStatistics, ProductTag, TaggedProduct, ShopAppearance, UserAccount } from "../types.js";
import { JsonStore } from "./jsonStore.js";

type Entity = Category | Product | Order;
const emptyFile = <T>(): DatabaseFile<T> => ({ version: 2, lastModified: new Date().toISOString(), data: {} });

class EntityRepository<T extends Entity> {
  public constructor(protected readonly store: JsonStore<DatabaseFile<T>>) {}

  public async all(guildId: string): Promise<T[]> {
    const file = await this.store.read();
    return Object.values(file.data).filter((item) => (item as T & { guildId?: string }).guildId === guildId || item.id.startsWith(`${guildId}:`));
  }

  public async find(id: string): Promise<T | undefined> {
    return (await this.store.read()).data[id];
  }

  public async save(item: T): Promise<T> {
    await this.store.update((file) => ({ ...file, data: { ...file.data, [item.id]: item } }));
    return item;
  }

  public async remove(id: string): Promise<void> {
    await this.store.update((file) => {
      const data = { ...file.data };
      delete data[id];
      return { ...file, data };
    });
  }
}

export class SettingsRepository {
  private readonly settingsStore = new JsonStore<DatabaseFile<Pick<GuildSettings, "tickets" | "bot" | "backOffice">>>("settings.json", emptyFile<Pick<GuildSettings, "tickets" | "bot" | "backOffice">>());
  private readonly shopStore = new JsonStore<DatabaseFile<GuildSettings["shop"]>>("shop.json", emptyFile<GuildSettings["shop"]>());
  private readonly paymentStore = new JsonStore<DatabaseFile<GuildSettings["payment"]>>("payment.json", emptyFile<GuildSettings["payment"]>());

  public async get(guildId: string): Promise<GuildSettings> {
    const [settingsFile, shopFile, paymentFile] = await Promise.all([this.settingsStore.read(), this.shopStore.read(), this.paymentStore.read()]);
    const defaults = structuredClone(DEFAULT_GUILD_SETTINGS);
    const current: GuildSettings = {
      shop: shopFile.data[guildId] ?? defaults.shop,
      payment: paymentFile.data[guildId] ?? defaults.payment,
      tickets: settingsFile.data[guildId]?.tickets ?? defaults.tickets,
      bot: settingsFile.data[guildId]?.bot ?? defaults.bot,
      backOffice: settingsFile.data[guildId]?.backOffice ?? defaults.backOffice
    };
    if (!settingsFile.data[guildId] || !shopFile.data[guildId] || !paymentFile.data[guildId]) await this.persist(guildId, current);
    return current;
  }

  public async update(guildId: string, mutator: (settings: GuildSettings) => GuildSettings): Promise<GuildSettings> {
    const result = mutator(structuredClone(await this.get(guildId)));
    await this.persist(guildId, result);
    return result;
  }

  private async persist(guildId: string, value: GuildSettings): Promise<void> {
    await Promise.all([
      this.shopStore.update((file) => ({ ...file, data: { ...file.data, [guildId]: value.shop } })),
      this.paymentStore.update((file) => ({ ...file, data: { ...file.data, [guildId]: value.payment } })),
      this.settingsStore.update((file) => ({ ...file, data: { ...file.data, [guildId]: { tickets: value.tickets, bot: value.bot, backOffice: value.backOffice } } }))
    ]);
  }
}

export class UserRepository {
  private readonly userStore = new JsonStore<DatabaseFile<UserAccount>>("users.json", emptyFile<UserAccount>());

  public async findByUserId(guildId: string, userId: string): Promise<UserAccount | undefined> {
    const file = await this.userStore.read();
    return Object.values(file.data).find((user) => user.guildId === guildId && user.userId === userId);
  }

  public async findOrCreate(guildId: string, userId: string, userName?: string): Promise<UserAccount> {
    const existing = await this.findByUserId(guildId, userId);
    if (existing) return existing;
    
    const now = new Date().toISOString();
    const newUser: UserAccount = {
      id: `${guildId}:${userId}`,
      guildId,
      userId,
      userName: userName || `User_${userId.slice(0, 8)}`,
      balance: 0,
      points: 0,
      totalSpent: 0,
      totalOrders: 0,
      warnings: 0,
      blacklisted: false,
      createdAt: now,
      updatedAt: now
    };
    await this.userStore.update((file) => ({ ...file, data: { ...file.data, [newUser.id]: newUser } }));
    return newUser;
  }

  public async updateBalance(guildId: string, userId: string, amount: number): Promise<UserAccount> {
    const user = await this.findOrCreate(guildId, userId);
    const newBalance = user.balance + amount;
    if (newBalance < 0) {
      throw new Error("INSUFFICIENT_BALANCE");
    }
    user.balance = newBalance;
    user.updatedAt = new Date().toISOString();
    await this.userStore.update((file) => ({ ...file, data: { ...file.data, [user.id]: user } }));
    return user;
  }

  public async getBalance(guildId: string, userId: string): Promise<number> {
    const user = await this.findByUserId(guildId, userId);
    return user?.balance ?? 0;
  }
}

export class CategoryRepository extends EntityRepository<Category> {
  public constructor() { super(new JsonStore("categories.json", emptyFile<Category>())); }
  public async list(guildId: string, includeHidden = true): Promise<Category[]> {
    return (await this.all(guildId)).filter((c) => includeHidden || !c.hidden).sort((a, b) => a.position - b.position);
  }
  public create(guildId: string, input: Omit<Category, "id" | "position" | "createdAt" | "updatedAt">): Category {
    const now = new Date().toISOString();
    return { ...input, id: `${guildId}:${randomUUID()}`, position: 0, createdAt: now, updatedAt: now };
  }
}

export class ProductRepository extends EntityRepository<Product> {
  public constructor() { super(new JsonStore("products.json", emptyFile<Product>())); }
  public async list(guildId: string, includeHidden = true): Promise<Product[]> {
    return (await this.all(guildId)).filter((p) => includeHidden || (!p.hidden && p.status === "active"));
  }
  public create(guildId: string, input: Omit<Product, "id" | "createdAt" | "updatedAt">): Product {
    const now = new Date().toISOString();
    return { ...input, id: `${guildId}:${randomUUID()}`, createdAt: now, updatedAt: now };
  }
}

export class OrderRepository extends EntityRepository<Order> {
  public constructor() { super(new JsonStore("orders.json", emptyFile<Order>())); }
  public async byChannel(channelId: string): Promise<Order | undefined> {
    const file = await this.store.read();
    return Object.values(file.data).find((order) => order.channelId === channelId);
  }
  public create(input: Omit<Order, "id" | "createdAt" | "updatedAt">): Order {
    const now = new Date().toISOString();
    return { ...input, id: randomUUID(), createdAt: now, updatedAt: now };
  }
}

export class StockRepository {
  private readonly transactionStore = new JsonStore<DatabaseFile<StockTransaction>>("stockTransactions.json", emptyFile<StockTransaction>());
  private readonly reservationStore = new JsonStore<DatabaseFile<StockReservation>>("stockReservations.json", emptyFile<StockReservation>());
  private readonly alertStore = new JsonStore<DatabaseFile<StockAlert>>("stockAlerts.json", emptyFile<StockAlert>());
  private readonly restockRequestStore = new JsonStore<DatabaseFile<RestockRequest>>("restockRequests.json", emptyFile<RestockRequest>());
  private readonly stockItemStore = new JsonStore<DatabaseFile<StockItem>>("stockItems.json", emptyFile<StockItem>());
  private readonly couponStore = new JsonStore<DatabaseFile<Coupon>>("coupons.json", emptyFile<Coupon>());
  private readonly couponUsageStore = new JsonStore<DatabaseFile<CouponUsage>>("couponUsages.json", emptyFile<CouponUsage>());
  private readonly cartStore = new JsonStore<DatabaseFile<ShoppingCart>>("shoppingCarts.json", emptyFile<ShoppingCart>());
  private readonly orderHistoryStore = new JsonStore<DatabaseFile<OrderHistory>>("orderHistory.json", emptyFile<OrderHistory>());
  private readonly purchaseLogStore = new JsonStore<DatabaseFile<PurchaseLog>>("purchaseLogs.json", emptyFile<PurchaseLog>());
  private readonly statisticsStore = new JsonStore<DatabaseFile<ShopStatistics>>("shopStatistics.json", emptyFile<ShopStatistics>());
  private readonly productTagStore = new JsonStore<DatabaseFile<ProductTag>>("productTags.json", emptyFile<ProductTag>());
  private readonly taggedProductStore = new JsonStore<DatabaseFile<TaggedProduct>>("taggedProducts.json", emptyFile<TaggedProduct>());
  private readonly shopAppearanceStore = new JsonStore<DatabaseFile<ShopAppearance>>("shopAppearance.json", emptyFile<ShopAppearance>());

  public async logTransaction(guildId: string, productId: string, type: StockTransaction["type"], quantity: number, previousStock: number, performedBy: string, orderId?: string, reason?: string): Promise<StockTransaction> {
    const transaction: StockTransaction = {
      id: randomUUID(),
      guildId,
      productId,
      type,
      quantity,
      previousStock,
      newStock: previousStock + quantity,
      orderId,
      reason,
      performedBy,
      createdAt: new Date().toISOString()
    };
    await this.transactionStore.update((file) => ({ ...file, data: { ...file.data, [transaction.id]: transaction } }));
    return transaction;
  }

  public async getTransactionHistory(productId: string, limit = 50): Promise<StockTransaction[]> {
    const file = await this.transactionStore.read();
    return Object.values(file.data)
      .filter((t) => t.productId === productId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }

  public async createReservation(guildId: string, productId: string, customerId: string, quantity: number, orderId?: string, durationMinutes = 15): Promise<StockReservation> {
    const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
    const reservation: StockReservation = {
      id: randomUUID(),
      guildId,
      productId,
      customerId,
      orderId,
      quantity,
      expiresAt,
      createdAt: new Date().toISOString()
    };
    await this.reservationStore.update((file) => ({ ...file, data: { ...file.data, [reservation.id]: reservation } }));
    return reservation;
  }

  public async getActiveReservations(productId: string): Promise<StockReservation[]> {
    const file = await this.reservationStore.read();
    const now = new Date().toISOString();
    return Object.values(file.data).filter((r) => r.productId === productId && r.expiresAt > now);
  }

  public async cancelReservation(reservationId: string): Promise<void> {
    await this.reservationStore.update((file) => {
      const data = { ...file.data };
      delete data[reservationId];
      return { ...file, data };
    });
  }

  public async cleanupExpiredReservations(): Promise<number> {
    const file = await this.reservationStore.read();
    const now = new Date().toISOString();
    const expired = Object.entries(file.data).filter(([_, r]) => r.expiresAt <= now);
    if (expired.length === 0) return 0;
    await this.reservationStore.update((file) => {
      const data = { ...file.data };
      expired.forEach(([id]) => delete data[id]);
      return { ...file, data };
    });
    return expired.length;
  }

  public async createAlert(guildId: string, productId: string, type: StockAlert["type"], threshold: number, currentStock: number): Promise<StockAlert> {
    const alert: StockAlert = {
      id: randomUUID(),
      guildId,
      productId,
      type,
      threshold,
      currentStock,
      acknowledged: false,
      createdAt: new Date().toISOString()
    };
    await this.alertStore.update((file) => ({ ...file, data: { ...file.data, [alert.id]: alert } }));
    return alert;
  }

  public async getUnacknowledgedAlerts(guildId: string, productId?: string): Promise<StockAlert[]> {
    const file = await this.alertStore.read();
    return Object.values(file.data)
      .filter((a) => a.guildId === guildId && !a.acknowledged && (!productId || a.productId === productId))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  public async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<void> {
    await this.alertStore.update((file) => {
      const alert = file.data[alertId];
      if (alert) {
        file.data[alertId] = { ...alert, acknowledged: true, acknowledgedBy, acknowledgedAt: new Date().toISOString() };
      }
      return file;
    });
  }

  public async createRestockRequest(guildId: string, productId: string, requestedBy: string, requestedQuantity: number, notes?: string): Promise<RestockRequest> {
    const request: RestockRequest = {
      id: randomUUID(),
      guildId,
      productId,
      requestedBy,
      requestedQuantity,
      status: "pending",
      notes,
      createdAt: new Date().toISOString()
    };
    await this.restockRequestStore.update((file) => ({ ...file, data: { ...file.data, [request.id]: request } }));
    return request;
  }

  public async getPendingRestockRequests(guildId: string): Promise<RestockRequest[]> {
    const file = await this.restockRequestStore.read();
    return Object.values(file.data)
      .filter((r) => r.guildId === guildId && r.status === "pending")
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  public async reviewRestockRequest(requestId: string, status: "approved" | "rejected", reviewedBy: string): Promise<void> {
    await this.restockRequestStore.update((file) => {
      const request = file.data[requestId];
      if (request) {
        file.data[requestId] = { ...request, status, reviewedBy, reviewedAt: new Date().toISOString() };
      }
      return file;
    });
  }

  // Stock Item Management (Inventory System)
  public async addStockItem(guildId: string, productId: string, content: string): Promise<StockItem> {
    const item: StockItem = {
      id: randomUUID(),
      guildId,
      productId,
      content,
      status: "available",
      createdAt: new Date().toISOString()
    };
    await this.stockItemStore.update((file) => ({ ...file, data: { ...file.data, [item.id]: item } }));
    return item;
  }

  public async addStockItemsBulk(guildId: string, productId: string, contents: string[]): Promise<StockItem[]> {
    const items = contents.map((content): StockItem => ({
      id: randomUUID(),
      guildId,
      productId,
      content,
      status: "available",
      createdAt: new Date().toISOString()
    }));
    await this.stockItemStore.update((file) => {
      const newData = { ...file.data };
      items.forEach((item) => { newData[item.id] = item; });
      return { ...file, data: newData };
    });
    return items;
  }

  public async getAvailableStockItems(productId: string, limit = 1): Promise<StockItem[]> {
    const file = await this.stockItemStore.read();
    return Object.values(file.data)
      .filter((item) => item.productId === productId && item.status === "available")
      .slice(0, limit);
  }

  public async reserveStockItem(itemId: string, durationMinutes = 15): Promise<void> {
    const reservedUntil = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
    await this.stockItemStore.update((file) => {
      const item = file.data[itemId];
      if (item) {
        file.data[itemId] = { ...item, status: "reserved", reservedUntil };
      }
      return file;
    });
  }

  public async deliverStockItem(itemId: string, deliveredTo: string): Promise<void> {
    const now = new Date().toISOString();
    await this.stockItemStore.update((file) => {
      const item = file.data[itemId];
      if (item) {
        file.data[itemId] = { ...item, status: "delivered", deliveredTo, deliveredAt: now, reservedUntil: undefined };
      }
      return file;
    });
  }

  public async deleteStockItem(itemId: string): Promise<void> {
    await this.stockItemStore.update((file) => {
      const item = file.data[itemId];
      if (item) {
        file.data[itemId] = { ...item, status: "deleted" };
      }
      return file;
    });
  }

  public async bulkDeleteStockItems(productId: string, itemIds: string[]): Promise<number> {
    let deleted = 0;
    await this.stockItemStore.update((file) => {
      const data = { ...file.data };
      itemIds.forEach((id) => {
        if (data[id] && data[id].productId === productId) {
          data[id] = { ...data[id], status: "deleted" };
          deleted++;
        }
      });
      return { ...file, data };
    });
    return deleted;
  }

  public async getStockItemsByProduct(productId: string, status?: StockItem["status"]): Promise<StockItem[]> {
    const file = await this.stockItemStore.read();
    const items = Object.values(file.data).filter((item) => item.productId === productId);
    if (status) return items.filter((item) => item.status === status);
    return items;
  }

  public async exportStockItems(productId: string): Promise<StockItem[]> {
    return this.getStockItemsByProduct(productId);
  }

  // Coupon Management
  public async createCoupon(guildId: string, code: string, type: Coupon["type"], value: number, description?: string, expiresAt?: string, usageLimit?: number, perUserLimit?: number): Promise<Coupon> {
    const coupon: Coupon = {
      id: randomUUID(),
      guildId,
      code: code.toUpperCase(),
      type,
      value,
      description,
      expiresAt,
      usageLimit,
      usedCount: 0,
      perUserLimit,
      enabled: true,
      createdAt: new Date().toISOString()
    };
    await this.couponStore.update((file) => ({ ...file, data: { ...file.data, [coupon.id]: coupon } }));
    return coupon;
  }

  public async getCouponByCode(guildId: string, code: string): Promise<Coupon | undefined> {
    const file = await this.couponStore.read();
    return Object.values(file.data).find((c) => c.guildId === guildId && c.code === code.toUpperCase() && c.enabled);
  }

  public async useCoupon(couponId: string, userId: string, orderId: string, discountAmount: number): Promise<boolean> {
    const file = await this.couponStore.read();
    const coupon = file.data[couponId];
    if (!coupon || !coupon.enabled) return false;
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return false;
    if (coupon.expiresAt && new Date(coupon.expiresAt) <= new Date()) return false;
    
    const usage: CouponUsage = {
      id: randomUUID(),
      couponId,
      userId,
      orderId,
      discountAmount,
      usedAt: new Date().toISOString()
    };
    await Promise.all([
      this.couponUsageStore.update((f) => ({ ...f, data: { ...f.data, [usage.id]: usage } })),
      this.couponStore.update((f) => ({ ...f, data: { ...f.data, [couponId]: { ...coupon, usedCount: coupon.usedCount + 1 } } }))
    ]);
    return true;
  }

  public async getCouponUsageByUser(couponId: string, userId: string): Promise<CouponUsage[]> {
    const file = await this.couponUsageStore.read();
    return Object.values(file.data).filter((u) => u.couponId === couponId && u.userId === userId);
  }

  public async toggleCoupon(couponId: string, enabled: boolean): Promise<void> {
    await this.couponStore.update((file) => {
      const coupon = file.data[couponId];
      if (coupon) {
        file.data[couponId] = { ...coupon, enabled };
      }
      return file;
    });
  }

  // Shopping Cart Management
  public async getOrCreateCart(customerId: string, guildId: string): Promise<ShoppingCart> {
    const file = await this.cartStore.read();
    const existing = Object.values(file.data).find((c) => c.customerId === customerId && c.guildId === guildId);
    if (existing) return existing;
    
    const cart: ShoppingCart = {
      customerId,
      guildId,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await this.cartStore.update((f) => ({ ...f, data: { ...f.data, [customerId]: cart } }));
    return cart;
  }

  public async addToCart(customerId: string, guildId: string, productId: string, quantity = 1): Promise<ShoppingCart> {
    const cart = await this.getOrCreateCart(customerId, guildId);
    const existingItem = cart.items.find((i) => i.productId === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }
    cart.updatedAt = new Date().toISOString();
    await this.cartStore.update((f) => ({ ...f, data: { ...f.data, [customerId]: cart } }));
    return cart;
  }

  public async removeFromCart(customerId: string, guildId: string, productId: string): Promise<ShoppingCart> {
    const cart = await this.getOrCreateCart(customerId, guildId);
    cart.items = cart.items.filter((i) => i.productId !== productId);
    cart.updatedAt = new Date().toISOString();
    await this.cartStore.update((f) => ({ ...f, data: { ...f.data, [customerId]: cart } }));
    return cart;
  }

  public async clearCart(customerId: string, guildId: string): Promise<void> {
    await this.cartStore.update((file) => {
      const cart = Object.values(file.data).find((c) => c.customerId === customerId && c.guildId === guildId);
      if (cart) {
        delete file.data[cart.customerId];
      }
      return file;
    });
  }

  // Order History Management
  public async logOrderHistory(order: OrderHistory): Promise<void> {
    await this.orderHistoryStore.update((file) => ({ ...file, data: { ...file.data, [order.id]: order } }));
  }

  public async getOrderHistory(guildId: string, customerId?: string, limit = 50): Promise<OrderHistory[]> {
    const file = await this.orderHistoryStore.read();
    let orders = Object.values(file.data).filter((o) => o.guildId === guildId);
    if (customerId) orders = orders.filter((o) => o.customerId === customerId);
    return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
  }

  // Purchase Log Management
  public async logPurchase(log: Omit<PurchaseLog, "id" | "createdAt">): Promise<PurchaseLog> {
    const purchaseLog: PurchaseLog = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      ...log
    };
    await this.purchaseLogStore.update((file) => ({ ...file, data: { ...file.data, [purchaseLog.id]: purchaseLog } }));
    return purchaseLog;
  }

  public async getPurchaseLogs(guildId: string, productId?: string, limit = 100): Promise<PurchaseLog[]> {
    const file = await this.purchaseLogStore.read();
    let logs = Object.values(file.data).filter((l) => l.guildId === guildId);
    if (productId) logs = logs.filter((l) => l.productId === productId);
    return logs.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
  }

  // Statistics Management
  public async recordStatistics(stats: ShopStatistics): Promise<void> {
    await this.statisticsStore.update((file) => ({ ...file, data: { ...file.data, [stats.date]: stats } }));
  }

  public async getStatistics(guildId: string, startDate: string, endDate: string): Promise<ShopStatistics[]> {
    const file = await this.statisticsStore.read();
    return Object.values(file.data)
      .filter((s) => s.guildId === guildId && s.date >= startDate && s.date <= endDate)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  // Product Tags Management
  public async createTag(guildId: string, name: string, color: HexColor, emoji?: string): Promise<ProductTag> {
    const tag: ProductTag = {
      id: randomUUID(),
      guildId,
      name,
      color,
      emoji,
      createdAt: new Date().toISOString()
    };
    await this.productTagStore.update((file) => ({ ...file, data: { ...file.data, [tag.id]: tag } }));
    return tag;
  }

  public async tagProduct(productId: string, tagId: string, guildId: string): Promise<void> {
    const tagged: TaggedProduct = {
      productId,
      tagId,
      guildId,
      createdAt: new Date().toISOString()
    };
    await this.taggedProductStore.update((file) => ({ ...file, data: { ...file.data, [`${productId}:${tagId}`]: tagged } }));
  }

  public async getProductTags(productId: string): Promise<ProductTag[]> {
    const [taggedFile, tagsFile] = await Promise.all([this.taggedProductStore.read(), this.productTagStore.read()]);
    const taggedIds = Object.values(taggedFile.data).filter((t) => t.productId === productId).map((t) => t.tagId);
    return Object.values(tagsFile.data).filter((t) => taggedIds.includes(t.id));
  }

  // Shop Appearance Management
  public async updateShopAppearance(appearance: ShopAppearance): Promise<void> {
    await this.shopAppearanceStore.update((file) => ({ ...file, data: { ...file.data, [appearance.guildId]: appearance } }));
  }

  public async getShopAppearance(guildId: string): Promise<ShopAppearance | undefined> {
    const file = await this.shopAppearanceStore.read();
    return file.data[guildId];
  }
}

export const settingsRepository = new SettingsRepository();
export const categoryRepository = new CategoryRepository();
export const productRepository = new ProductRepository();
export const orderRepository = new OrderRepository();
export const stockRepository = new StockRepository();
