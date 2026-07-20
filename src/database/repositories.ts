import { randomUUID } from "node:crypto";
import { DEFAULT_GUILD_SETTINGS, DEFAULT_STOCK_SETTINGS } from "../config/constants.js";
import type { Category, DatabaseFile, GuildSettings, Order, Product, StockTransaction, StockReservation, StockAlert, RestockRequest } from "../types.js";
import { JsonStore } from "./jsonStore.js";

type Entity = Category | Product | Order;
const emptyFile = <T>(): DatabaseFile<T> => ({ version: 1, data: {} });

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
  private readonly settingsStore = new JsonStore<DatabaseFile<Pick<GuildSettings, "tickets" | "bot">>>("settings.json", emptyFile<Pick<GuildSettings, "tickets" | "bot">>());
  private readonly shopStore = new JsonStore<DatabaseFile<GuildSettings["shop"]>>("shop.json", emptyFile<GuildSettings["shop"]>());
  private readonly paymentStore = new JsonStore<DatabaseFile<GuildSettings["payment"]>>("payment.json", emptyFile<GuildSettings["payment"]>());

  public async get(guildId: string): Promise<GuildSettings> {
    const [settingsFile, shopFile, paymentFile] = await Promise.all([this.settingsStore.read(), this.shopStore.read(), this.paymentStore.read()]);
    const defaults = structuredClone(DEFAULT_GUILD_SETTINGS);
    const current: GuildSettings = {
      shop: shopFile.data[guildId] ?? defaults.shop,
      payment: paymentFile.data[guildId] ?? defaults.payment,
      tickets: settingsFile.data[guildId]?.tickets ?? defaults.tickets,
      bot: settingsFile.data[guildId]?.bot ?? defaults.bot
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
      this.settingsStore.update((file) => ({ ...file, data: { ...file.data, [guildId]: { tickets: value.tickets, bot: value.bot } } }))
    ]);
  }
}

export class CategoryRepository extends EntityRepository<Category> {
  public constructor() { super(new JsonStore("categories.json", emptyFile<Category>())); }
  public async list(guildId: string, includeHidden = true): Promise<Category[]> {
    return (await this.all(guildId)).filter((c) => includeHidden || !c.hidden).sort((a, b) => a.position - b.position);
  }
  public create(guildId: string, input: Omit<Category, "id" | "position" | "createdAt">): Category {
    return { ...input, id: `${guildId}:${randomUUID()}`, position: 0, createdAt: new Date().toISOString() };
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
}

export const settingsRepository = new SettingsRepository();
export const categoryRepository = new CategoryRepository();
export const productRepository = new ProductRepository();
export const orderRepository = new OrderRepository();
export const stockRepository = new StockRepository();
