import db from '../config/db.js';
import {
    orders,
    orderItems,
    items,
    justooAdmins as admins,
    justooPayments as payments,
    justooRiders as riders,
    inventoryUsers,
} from '../db/schema.js';
import { eq, and, count, sum, avg, desc, sql } from 'drizzle-orm';

export const getOrderAnalytics = async (period = 'daily', startDate, endDate) => {
    const baseConditions = [];
    if (startDate && endDate) {
        baseConditions.push(sql`${orders.createdAt} >= ${startDate} AND ${orders.createdAt} <= ${endDate}`);
    }

    const totalOrdersResult = await db.select({ count: count() }).from(orders).where(and(...baseConditions));

    const ordersByStatusResult = await db
        .select({ status: orders.status, count: count() })
        .from(orders)
        .where(and(...baseConditions))
        .groupBy(orders.status);

    const revenueResult = await db
        .select({
            totalRevenue: sum(orders.totalAmount),
            avgOrderValue: avg(orders.totalAmount),
            maxOrderValue: sql`MAX(${orders.totalAmount})`,
            minOrderValue: sql`MIN(${orders.totalAmount})`,
        })
        .from(orders)
        .where(and(...baseConditions, eq(orders.status, 'delivered')));

    let dailyRevenueQuery = db
        .select({
            date: sql`DATE(${orders.createdAt})`,
            revenue: sum(orders.totalAmount),
            orderCount: count(),
        })
        .from(orders)
        .where(and(eq(orders.status, 'delivered')))
        .groupBy(sql`DATE(${orders.createdAt})`)
        .orderBy(sql`DATE(${orders.createdAt})`);

    if (startDate && endDate) {
        dailyRevenueQuery = dailyRevenueQuery.where(
            and(sql`${orders.createdAt} >= ${startDate}`, sql`${orders.createdAt} <= ${endDate}`),
        );
    } else {
        dailyRevenueQuery = dailyRevenueQuery.where(sql`${orders.createdAt} >= NOW() - INTERVAL '30 days'`);
    }

    const dailyRevenueResult = await dailyRevenueQuery;

    return {
        totalOrders: totalOrdersResult[0]?.count || 0,
        ordersByStatus: ordersByStatusResult.reduce((acc, curr) => {
            acc[curr.status] = curr.count;
            return acc;
        }, {}),
        revenue: {
            total: revenueResult[0]?.totalRevenue || 0,
            average: revenueResult[0]?.avgOrderValue || 0,
            highest: revenueResult[0]?.maxOrderValue || 0,
            lowest: revenueResult[0]?.minOrderValue || 0,
        },
        dailyTrend: dailyRevenueResult,
    };
};

export const getInventoryAnalytics = async (startDate, endDate) => {
    const baseConditions = [];
    if (startDate && endDate) {
        baseConditions.push(sql`${items.createdAt} >= ${startDate} AND ${items.createdAt} <= ${endDate}`);
    }

    const lowStockResult = await db
        .select()
        .from(items)
        .where(and(sql`${items.quantity} <= ${items.minStockLevel}`, ...baseConditions));

    const inventoryStatsResult = await db
        .select({
            totalItems: count(),
            totalValue: sum(sql`${items.price} * ${items.quantity}`),
            avgPrice: avg(items.price),
        })
        .from(items)
        .where(and(eq(items.isActive, 1), ...baseConditions));

    const categoryStatsResult = await db
        .select({
            category: items.category,
            itemCount: count(),
            totalValue: sum(sql`${items.price} * ${items.quantity}`),
        })
        .from(items)
        .where(and(eq(items.isActive, 1), ...baseConditions))
        .groupBy(items.category);

    const topSellingResult = await db
        .select({
            itemId: orderItems.itemId,
            itemName: items.name,
            totalSold: sum(orderItems.quantity),
            totalRevenue: sum(sql`${orderItems.quantity} * ${orderItems.unitPrice}`),
        })
        .from(orderItems)
        .innerJoin(items, eq(orderItems.itemId, items.id))
        .where(startDate && endDate ? sql`${orderItems.createdAt} >= ${startDate} AND ${orderItems.createdAt} <= ${endDate}` : undefined)
        .groupBy(orderItems.itemId, items.name)
        .orderBy(desc(sum(orderItems.quantity)))
        .limit(10);

    return {
        lowStockItems: lowStockResult,
        totalItems: inventoryStatsResult[0]?.totalItems || 0,
        totalInventoryValue: inventoryStatsResult[0]?.totalValue || 0,
        averageItemPrice: inventoryStatsResult[0]?.avgPrice || 0,
        categoryDistribution: categoryStatsResult,
        topSellingItems: topSellingResult,
    };
};

export const getUserAnalytics = async (startDate, endDate) => {
    const baseConditions = [];
    if (startDate && endDate) {
        baseConditions.push(sql`${admins.createdAt} >= ${startDate} AND ${admins.createdAt} <= ${endDate}`);
    }

    const usersByRoleResult = await db
        .select({ role: admins.role, count: count() })
        .from(admins)
        .where(and(...baseConditions))
        .groupBy(admins.role);

    let recentRegistrationsQuery = db.select({ count: count() }).from(admins);
    if (startDate && endDate) {
        recentRegistrationsQuery = recentRegistrationsQuery.where(
            sql`${admins.createdAt} >= ${startDate} AND ${admins.createdAt} <= ${endDate}`,
        );
    } else {
        recentRegistrationsQuery = recentRegistrationsQuery.where(sql`${admins.createdAt} >= NOW() - INTERVAL '30 days'`);
    }

    const recentRegistrationsResult = await recentRegistrationsQuery;

    const activeCustomersResult = await db
        .select({ count: sql`COUNT(DISTINCT ${orders.customerId})` })
        .from(orders)
        .where(startDate && endDate ? sql`${orders.createdAt} >= ${startDate} AND ${orders.createdAt} <= ${endDate}` : undefined);

    const activeRidersResult = await db.select({ count: count() }).from(riders).where(eq(riders.isActive, 1));

    const inventoryAdminsResult = await db.select({ count: count() }).from(inventoryUsers);

    return {
        usersByRole: usersByRoleResult.reduce((acc, curr) => {
            acc[curr.role] = curr.count;
            return acc;
        }, {}),
        recentRegistrations: recentRegistrationsResult[0]?.count || 0,
        activeCustomers: activeCustomersResult[0]?.count || 0,
        activeRiders: activeRidersResult[0]?.count || 0,
        inventoryAdminsCount: inventoryAdminsResult[0]?.count || 0,
    };
};

export const getPaymentAnalytics = async (startDate, endDate) => {
    const paymentConditions = [eq(payments.status, 'completed')];
    const orderConditions = [];

    if (startDate && endDate) {
        paymentConditions.push(sql`${payments.createdAt} >= ${startDate} AND ${payments.createdAt} <= ${endDate}`);
        orderConditions.push(sql`${orders.createdAt} >= ${startDate} AND ${orders.createdAt} <= ${endDate}`);
    }

    const paymentMethodsResult = await db
        .select({ method: payments.method, count: count(), total: sum(payments.amount) })
        .from(payments)
        .where(and(...paymentConditions))
        .groupBy(payments.method);

    const orderStatusResult = await db
        .select({ status: orders.status, count: count(), totalAmount: sum(orders.totalAmount) })
        .from(orders)
        .where(and(...orderConditions))
        .groupBy(orders.status);

    return { paymentMethods: paymentMethodsResult, orderStatus: orderStatusResult };
};
