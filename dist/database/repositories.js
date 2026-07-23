import { randomUUID } from "node:crypto";
import { DEFAULT_GUILD_SETTINGS } from "../config/constants.js";
import { JsonStore } from "./jsonStore.js";
const emptyFile = () => ({ version: 2, lastModified: new Date().toISOString(), data: {} });
class EntityRepository {
    store;
    constructor(store) {
        this.store = store;
    }
    async all(guildId) {
        const file = await this.store.read();
        return Object.values(file.data).filter((item) => item.guildId === guildId || item.id.startsWith(`${guildId}:`));
    }
    async find(id) {
        return (await this.store.read()).data[id];
    }
    async save(item) {
        await this.store.update((file) => ({ ...file, data: { ...file.data, [item.id]: item } }));
        return item;
    }
    async remove(id) {
        await this.store.update((file) => {
            const data = { ...file.data };
            delete data[id];
            return { ...file, data };
        });
    }
}
export class SettingsRepository {
    settingsStore = new JsonStore("settings.json", emptyFile());
    shopStore = new JsonStore("shop.json", emptyFile());
    paymentStore = new JsonStore("payment.json", emptyFile());
    async get(guildId) {
        const [settingsFile, shopFile, paymentFile] = await Promise.all([this.settingsStore.read(), this.shopStore.read(), this.paymentStore.read()]);
        const defaults = structuredClone(DEFAULT_GUILD_SETTINGS);
        const current = {
            shop: shopFile.data[guildId] ?? defaults.shop,
            payment: paymentFile.data[guildId] ?? defaults.payment,
            tickets: settingsFile.data[guildId]?.tickets ?? defaults.tickets,
            bot: settingsFile.data[guildId]?.bot ?? defaults.bot,
            backOffice: settingsFile.data[guildId]?.backOffice ?? defaults.backOffice
        };
        if (!settingsFile.data[guildId] || !shopFile.data[guildId] || !paymentFile.data[guildId])
            await this.persist(guildId, current);
        return current;
    }
    async update(guildId, mutator) {
        const result = mutator(structuredClone(await this.get(guildId)));
        await this.persist(guildId, result);
        return result;
    }
    async persist(guildId, value) {
        await Promise.all([
            this.shopStore.update((file) => ({ ...file, data: { ...file.data, [guildId]: value.shop } })),
            this.paymentStore.update((file) => ({ ...file, data: { ...file.data, [guildId]: value.payment } })),
            this.settingsStore.update((file) => ({ ...file, data: { ...file.data, [guildId]: { tickets: value.tickets, bot: value.bot, backOffice: value.backOffice } } }))
        ]);
    }
}
export class CategoryRepository extends EntityRepository {
    constructor() { super(new JsonStore("categories.json", emptyFile())); }
    async list(guildId, includeHidden = true) {
        return (await this.all(guildId)).filter((c) => includeHidden || !c.hidden).sort((a, b) => a.position - b.position);
    }
    create(guildId, input) {
        const now = new Date().toISOString();
        return { ...input, id: `${guildId}:${randomUUID()}`, position: 0, createdAt: now, updatedAt: now };
    }
}
export class ProductRepository extends EntityRepository {
    constructor() { super(new JsonStore("products.json", emptyFile())); }
    async list(guildId, includeHidden = true) {
        return (await this.all(guildId)).filter((p) => includeHidden || (!p.hidden && p.status === "active"));
    }
    create(guildId, input) {
        const now = new Date().toISOString();
        return { ...input, id: `${guildId}:${randomUUID()}`, createdAt: now, updatedAt: now };
    }
}
export class OrderRepository extends EntityRepository {
    constructor() { super(new JsonStore("orders.json", emptyFile())); }
    async byChannel(channelId) {
        const file = await this.store.read();
        return Object.values(file.data).find((order) => order.channelId === channelId);
    }
    create(input) {
        const now = new Date().toISOString();
        return { ...input, id: randomUUID(), createdAt: now, updatedAt: now };
    }
}
export class StockRepository {
    transactionStore = new JsonStore("stockTransactions.json", emptyFile());
    reservationStore = new JsonStore("stockReservations.json", emptyFile());
    alertStore = new JsonStore("stockAlerts.json", emptyFile());
    restockRequestStore = new JsonStore("restockRequests.json", emptyFile());
    stockItemStore = new JsonStore("stockItems.json", emptyFile());
    couponStore = new JsonStore("coupons.json", emptyFile());
    couponUsageStore = new JsonStore("couponUsages.json", emptyFile());
    cartStore = new JsonStore("shoppingCarts.json", emptyFile());
    orderHistoryStore = new JsonStore("orderHistory.json", emptyFile());
    purchaseLogStore = new JsonStore("purchaseLogs.json", emptyFile());
    statisticsStore = new JsonStore("shopStatistics.json", emptyFile());
    productTagStore = new JsonStore("productTags.json", emptyFile());
    taggedProductStore = new JsonStore("taggedProducts.json", emptyFile());
    shopAppearanceStore = new JsonStore("shopAppearance.json", emptyFile());
    async logTransaction(guildId, productId, type, quantity, previousStock, performedBy, orderId, reason) {
        const transaction = {
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
    async getTransactionHistory(productId, limit = 50) {
        const file = await this.transactionStore.read();
        return Object.values(file.data)
            .filter((t) => t.productId === productId)
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .slice(0, limit);
    }
    async createReservation(guildId, productId, customerId, quantity, orderId, durationMinutes = 15) {
        const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
        const reservation = {
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
    async getActiveReservations(productId) {
        const file = await this.reservationStore.read();
        const now = new Date().toISOString();
        return Object.values(file.data).filter((r) => r.productId === productId && r.expiresAt > now);
    }
    async cancelReservation(reservationId) {
        await this.reservationStore.update((file) => {
            const data = { ...file.data };
            delete data[reservationId];
            return { ...file, data };
        });
    }
    async cleanupExpiredReservations() {
        const file = await this.reservationStore.read();
        const now = new Date().toISOString();
        const expired = Object.entries(file.data).filter(([_, r]) => r.expiresAt <= now);
        if (expired.length === 0)
            return 0;
        await this.reservationStore.update((file) => {
            const data = { ...file.data };
            expired.forEach(([id]) => delete data[id]);
            return { ...file, data };
        });
        return expired.length;
    }
    async createAlert(guildId, productId, type, threshold, currentStock) {
        const alert = {
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
    async getUnacknowledgedAlerts(guildId, productId) {
        const file = await this.alertStore.read();
        return Object.values(file.data)
            .filter((a) => a.guildId === guildId && !a.acknowledged && (!productId || a.productId === productId))
            .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }
    async acknowledgeAlert(alertId, acknowledgedBy) {
        await this.alertStore.update((file) => {
            const alert = file.data[alertId];
            if (alert) {
                file.data[alertId] = { ...alert, acknowledged: true, acknowledgedBy, acknowledgedAt: new Date().toISOString() };
            }
            return file;
        });
    }
    async createRestockRequest(guildId, productId, requestedBy, requestedQuantity, notes) {
        const request = {
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
    async getPendingRestockRequests(guildId) {
        const file = await this.restockRequestStore.read();
        return Object.values(file.data)
            .filter((r) => r.guildId === guildId && r.status === "pending")
            .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }
    async reviewRestockRequest(requestId, status, reviewedBy) {
        await this.restockRequestStore.update((file) => {
            const request = file.data[requestId];
            if (request) {
                file.data[requestId] = { ...request, status, reviewedBy, reviewedAt: new Date().toISOString() };
            }
            return file;
        });
    }
    // Stock Item Management (Inventory System)
    async addStockItem(guildId, productId, content) {
        const item = {
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
    async addStockItemsBulk(guildId, productId, contents) {
        const items = contents.map((content) => ({
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
    async getAvailableStockItems(productId, limit = 1) {
        const file = await this.stockItemStore.read();
        return Object.values(file.data)
            .filter((item) => item.productId === productId && item.status === "available")
            .slice(0, limit);
    }
    async reserveStockItem(itemId, durationMinutes = 15) {
        const reservedUntil = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
        await this.stockItemStore.update((file) => {
            const item = file.data[itemId];
            if (item) {
                file.data[itemId] = { ...item, status: "reserved", reservedUntil };
            }
            return file;
        });
    }
    async deliverStockItem(itemId, deliveredTo) {
        const now = new Date().toISOString();
        await this.stockItemStore.update((file) => {
            const item = file.data[itemId];
            if (item) {
                file.data[itemId] = { ...item, status: "delivered", deliveredTo, deliveredAt: now, reservedUntil: undefined };
            }
            return file;
        });
    }
    async deleteStockItem(itemId) {
        await this.stockItemStore.update((file) => {
            const item = file.data[itemId];
            if (item) {
                file.data[itemId] = { ...item, status: "deleted" };
            }
            return file;
        });
    }
    async bulkDeleteStockItems(productId, itemIds) {
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
    async getStockItemsByProduct(productId, status) {
        const file = await this.stockItemStore.read();
        const items = Object.values(file.data).filter((item) => item.productId === productId);
        if (status)
            return items.filter((item) => item.status === status);
        return items;
    }
    async exportStockItems(productId) {
        return this.getStockItemsByProduct(productId);
    }
    // Coupon Management
    async createCoupon(guildId, code, type, value, description, expiresAt, usageLimit, perUserLimit) {
        const coupon = {
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
    async getCouponByCode(guildId, code) {
        const file = await this.couponStore.read();
        return Object.values(file.data).find((c) => c.guildId === guildId && c.code === code.toUpperCase() && c.enabled);
    }
    async useCoupon(couponId, userId, orderId, discountAmount) {
        const file = await this.couponStore.read();
        const coupon = file.data[couponId];
        if (!coupon || !coupon.enabled)
            return false;
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)
            return false;
        if (coupon.expiresAt && new Date(coupon.expiresAt) <= new Date())
            return false;
        const usage = {
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
    async getCouponUsageByUser(couponId, userId) {
        const file = await this.couponUsageStore.read();
        return Object.values(file.data).filter((u) => u.couponId === couponId && u.userId === userId);
    }
    async toggleCoupon(couponId, enabled) {
        await this.couponStore.update((file) => {
            const coupon = file.data[couponId];
            if (coupon) {
                file.data[couponId] = { ...coupon, enabled };
            }
            return file;
        });
    }
    // Shopping Cart Management
    async getOrCreateCart(customerId, guildId) {
        const file = await this.cartStore.read();
        const existing = Object.values(file.data).find((c) => c.customerId === customerId && c.guildId === guildId);
        if (existing)
            return existing;
        const cart = {
            customerId,
            guildId,
            items: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        await this.cartStore.update((f) => ({ ...f, data: { ...f.data, [customerId]: cart } }));
        return cart;
    }
    async addToCart(customerId, guildId, productId, quantity = 1) {
        const cart = await this.getOrCreateCart(customerId, guildId);
        const existingItem = cart.items.find((i) => i.productId === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
        }
        else {
            cart.items.push({ productId, quantity });
        }
        cart.updatedAt = new Date().toISOString();
        await this.cartStore.update((f) => ({ ...f, data: { ...f.data, [customerId]: cart } }));
        return cart;
    }
    async removeFromCart(customerId, guildId, productId) {
        const cart = await this.getOrCreateCart(customerId, guildId);
        cart.items = cart.items.filter((i) => i.productId !== productId);
        cart.updatedAt = new Date().toISOString();
        await this.cartStore.update((f) => ({ ...f, data: { ...f.data, [customerId]: cart } }));
        return cart;
    }
    async clearCart(customerId, guildId) {
        await this.cartStore.update((file) => {
            const cart = Object.values(file.data).find((c) => c.customerId === customerId && c.guildId === guildId);
            if (cart) {
                delete file.data[cart.customerId];
            }
            return file;
        });
    }
    // Order History Management
    async logOrderHistory(order) {
        await this.orderHistoryStore.update((file) => ({ ...file, data: { ...file.data, [order.id]: order } }));
    }
    async getOrderHistory(guildId, customerId, limit = 50) {
        const file = await this.orderHistoryStore.read();
        let orders = Object.values(file.data).filter((o) => o.guildId === guildId);
        if (customerId)
            orders = orders.filter((o) => o.customerId === customerId);
        return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
    }
    // Purchase Log Management
    async logPurchase(log) {
        const purchaseLog = {
            id: randomUUID(),
            createdAt: new Date().toISOString(),
            ...log
        };
        await this.purchaseLogStore.update((file) => ({ ...file, data: { ...file.data, [purchaseLog.id]: purchaseLog } }));
        return purchaseLog;
    }
    async getPurchaseLogs(guildId, productId, limit = 100) {
        const file = await this.purchaseLogStore.read();
        let logs = Object.values(file.data).filter((l) => l.guildId === guildId);
        if (productId)
            logs = logs.filter((l) => l.productId === productId);
        return logs.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
    }
    // Statistics Management
    async recordStatistics(stats) {
        await this.statisticsStore.update((file) => ({ ...file, data: { ...file.data, [stats.date]: stats } }));
    }
    async getStatistics(guildId, startDate, endDate) {
        const file = await this.statisticsStore.read();
        return Object.values(file.data)
            .filter((s) => s.guildId === guildId && s.date >= startDate && s.date <= endDate)
            .sort((a, b) => a.date.localeCompare(b.date));
    }
    // Product Tags Management
    async createTag(guildId, name, color, emoji) {
        const tag = {
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
    async tagProduct(productId, tagId, guildId) {
        const tagged = {
            productId,
            tagId,
            guildId,
            createdAt: new Date().toISOString()
        };
        await this.taggedProductStore.update((file) => ({ ...file, data: { ...file.data, [`${productId}:${tagId}`]: tagged } }));
    }
    async getProductTags(productId) {
        const [taggedFile, tagsFile] = await Promise.all([this.taggedProductStore.read(), this.productTagStore.read()]);
        const taggedIds = Object.values(taggedFile.data).filter((t) => t.productId === productId).map((t) => t.tagId);
        return Object.values(tagsFile.data).filter((t) => taggedIds.includes(t.id));
    }
    // Shop Appearance Management
    async updateShopAppearance(appearance) {
        await this.shopAppearanceStore.update((file) => ({ ...file, data: { ...file.data, [appearance.guildId]: appearance } }));
    }
    async getShopAppearance(guildId) {
        const file = await this.shopAppearanceStore.read();
        return file.data[guildId];
    }
}
export const settingsRepository = new SettingsRepository();
export const categoryRepository = new CategoryRepository();
export const productRepository = new ProductRepository();
export const orderRepository = new OrderRepository();
export const stockRepository = new StockRepository();
