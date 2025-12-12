// Order Controller - Read Only for Admin Dashboard
import db from "../../config/db.js";
import {
    orders,
    orderItems,
    customers,
    customerAddresses,
    items,
} from "../../db/schema.js";
import {
    eq,
    and,
    desc,
    asc,
    count,
    sum,
    sql,
    between,
    inArray,
} from "drizzle-orm";
import { errorResponse, successResponse } from "../../utils/response.js";

// Get all orders with pagination and filtering
export const getAllOrders = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            userId,
            customerId,
            startDate,
            endDate,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = req.query;

        const pageNum = Number.parseInt(page) || 1;
        const limitNum = Number.parseInt(limit) || 10;
        const offset = (pageNum - 1) * limitNum;

        // Build query conditions
        const conditions = [];

        if (status) {
            conditions.push(eq(orders.status, status));
        }

        const customerFilter = userId || customerId; // accept either param name
        if (customerFilter) {
            conditions.push(
                eq(orders.customerId, Number.parseInt(customerFilter))
            );
        }

        if (startDate && endDate) {
            conditions.push(between(orders.createdAt, startDate, endDate));
        }

        // Build base query
        let query = db
            .select({
                id: orders.id,
                customerId: orders.customerId,
                status: orders.status,
                totalAmount: orders.totalAmount,
                itemCount: orders.itemCount,
                notes: orders.notes,
                createdAt: orders.createdAt,
                updatedAt: orders.updatedAt,
                customerName: customers.name,
                customerEmail: customers.email,
                customerPhone: customers.phone,
                deliveryAddress: customerAddresses.fullAddress,
            })
            .from(orders)
            .leftJoin(customers, eq(customers.id, orders.customerId))
            .leftJoin(
                customerAddresses,
                eq(customerAddresses.id, orders.deliveryAddressId)
            );

        // Apply conditions
        if (conditions.length > 0) {
            query = query.where(and(...conditions));
        }

        // Apply sorting
        const sortColumn = orders[sortBy] || orders.createdAt;
        query = query.orderBy(
            sortOrder === "desc" ? desc(sortColumn) : asc(sortColumn)
        );

        // Get orders with pagination
        const ordersList = await query.limit(limitNum).offset(offset);

        // Fetch order items in bulk
        const orderIds = ordersList.map((o) => o.id);
        let itemsByOrder = {};
        if (orderIds.length > 0) {
            const orderItemsRows = await db
                .select({
                    orderId: orderItems.orderId,
                    itemId: orderItems.itemId,
                    itemName: orderItems.itemName,
                    quantity: orderItems.quantity,
                    unitPrice: orderItems.unitPrice,
                    totalPrice: orderItems.totalPrice,
                    unit: orderItems.unit,
                    catalogName: items.name,
                    catalogPrice: items.price,
                })
                .from(orderItems)
                .leftJoin(items, eq(items.id, orderItems.itemId))
                .where(inArray(orderItems.orderId, orderIds));

            itemsByOrder = orderItemsRows.reduce((acc, row) => {
                const key = row.orderId;
                if (!acc[key]) acc[key] = [];
                acc[key].push({
                    itemId: row.itemId,
                    name: row.itemName || row.catalogName,
                    quantity: row.quantity,
                    price: Number(row.unitPrice ?? row.catalogPrice ?? 0),
                    total: Number(
                        row.totalPrice ??
                            (row.quantity || 0) *
                                Number(row.unitPrice ?? row.catalogPrice ?? 0)
                    ),
                    unit: row.unit,
                });
                return acc;
            }, {});
        }

        const enrichedOrders = ordersList.map((o) => ({
            ...o,
            items: itemsByOrder[o.id] || [],
        }));

        // Get total count
        let countQuery = db.select({ count: count() }).from(orders);
        if (conditions.length > 0) {
            countQuery = countQuery.where(and(...conditions));
        }
        const totalOrders = await countQuery;

        return successResponse(
            res,
            {
                orders: enrichedOrders,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(totalOrders[0].count / limitNum),
                    totalItems: totalOrders[0].count,
                    hasNext: pageNum * limitNum < totalOrders[0].count,
                    hasPrev: pageNum > 1,
                },
            },
            "Orders retrieved successfully"
        );
    } catch (error) {
        console.error("Error getting orders:", error);
        return errorResponse(res, "Failed to retrieve orders", 500);
    }
};

// Get order by ID with details
export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return errorResponse(res, "Order ID is required", 400);
        }

        // Get order details with customer and address
        const order = await db
            .select({
                id: orders.id,
                customerId: orders.customerId,
                status: orders.status,
                totalAmount: orders.totalAmount,
                itemCount: orders.itemCount,
                notes: orders.notes,
                createdAt: orders.createdAt,
                updatedAt: orders.updatedAt,
                customerName: customers.name,
                customerEmail: customers.email,
                customerPhone: customers.phone,
                deliveryAddress: customerAddresses.fullAddress,
            })
            .from(orders)
            .leftJoin(customers, eq(customers.id, orders.customerId))
            .leftJoin(
                customerAddresses,
                eq(customerAddresses.id, orders.deliveryAddressId)
            )
            .where(eq(orders.id, parseInt(id)))
            .limit(1);

        if (order.length === 0) {
            return errorResponse(res, "Order not found", 404);
        }

        // Get order items
        const items = await db
            .select({
                orderId: orderItems.orderId,
                itemId: orderItems.itemId,
                itemName: orderItems.itemName,
                quantity: orderItems.quantity,
                unitPrice: orderItems.unitPrice,
                totalPrice: orderItems.totalPrice,
                unit: orderItems.unit,
                catalogName: items.name,
                catalogPrice: items.price,
            })
            .from(orderItems)
            .leftJoin(items, eq(items.id, orderItems.itemId))
            .where(eq(orderItems.orderId, parseInt(id)));

        return successResponse(
            res,
            {
                order: order[0],
                items: items.map((row) => ({
                    itemId: row.itemId,
                    name: row.itemName || row.catalogName,
                    quantity: row.quantity,
                    price: Number(row.unitPrice ?? row.catalogPrice ?? 0),
                    total: Number(
                        row.totalPrice ??
                            (row.quantity || 0) *
                                Number(row.unitPrice ?? row.catalogPrice ?? 0)
                    ),
                    unit: row.unit,
                })),
            },
            "Order retrieved successfully"
        );
    } catch (error) {
        console.error("Error getting order:", error);
        return errorResponse(res, "Failed to retrieve order", 500);
    }
};

// Get order analytics
export const getOrderAnalytics = async (req, res) => {
    try {
        const { startDate, endDate, status } = req.query;

        // Build conditions
        const conditions = [];
        if (startDate && endDate) {
            conditions.push(between(orders.createdAt, startDate, endDate));
        }
        if (status) {
            conditions.push(eq(orders.status, status));
        }

        // Total orders
        let totalQuery = db.select({ count: count() }).from(orders);
        if (conditions.length > 0) {
            totalQuery = totalQuery.where(and(...conditions));
        }
        const totalOrders = await totalQuery;

        // Orders by status
        let statusQuery = db
            .select({
                status: orders.status,
                count: count(),
                totalRevenue: sum(orders.totalAmount),
            })
            .from(orders)
            .groupBy(orders.status);

        if (conditions.length > 0) {
            statusQuery = statusQuery.where(and(...conditions));
        }
        const ordersByStatus = await statusQuery;

        // Revenue analytics
        let revenueQuery = db
            .select({
                totalRevenue: sum(orders.totalAmount),
                avgOrderValue: sql`AVG(${orders.totalAmount})`,
                maxOrderValue: sql`MAX(${orders.totalAmount})`,
                minOrderValue: sql`MIN(${orders.totalAmount})`,
            })
            .from(orders);

        if (conditions.length > 0) {
            revenueQuery = revenueQuery.where(and(...conditions));
        }
        const revenueStats = await revenueQuery;

        // Recent orders (last 10)
        let recentQuery = db
            .select()
            .from(orders)
            .orderBy(desc(orders.createdAt))
            .limit(10);

        if (conditions.length > 0) {
            recentQuery = recentQuery.where(and(...conditions));
        }
        const recentOrders = await recentQuery;

        const analytics = {
            overview: {
                totalOrders: totalOrders[0].count,
                ordersByStatus: ordersByStatus,
                revenue: revenueStats[0],
            },
            recentOrders: recentOrders,
            timestamp: new Date().toISOString(),
        };

        return successResponse(
            res,
            "Order analytics retrieved successfully",
            analytics
        );
    } catch (error) {
        console.error("Error getting order analytics:", error);
        return errorResponse(res, "Failed to retrieve order analytics", 500);
    }
};
