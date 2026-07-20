import { randomUUID } from "node:crypto";
import { DEFAULT_GUILD_SETTINGS } from "../config/constants.js";
import type { Category, DatabaseFile, GuildSettings, Order, Product } from "../types.js";
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

export const settingsRepository = new SettingsRepository();
export const categoryRepository = new CategoryRepository();
export const productRepository = new ProductRepository();
export const orderRepository = new OrderRepository();
