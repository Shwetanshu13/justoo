"use client";

import { useState, useEffect } from "react";
import { api } from "@/admin/lib/api";
import toast from "react-hot-toast";
import Modal from "@/admin/components/Modal";
import {
    CurrencyRupeeIcon,
    CalendarDaysIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ShoppingBagIcon,
} from "@heroicons/react/24/outline";

const StatusBadge = ({ status }) => {
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "pending":
                return "bg-amber-50 text-amber-700 border border-amber-100";
            case "confirmed":
                return "bg-blue-50 text-blue-700 border border-blue-100";
            case "preparing":
                return "bg-indigo-50 text-indigo-700 border border-indigo-100";
            case "ready":
                return "bg-purple-50 text-purple-700 border border-purple-100";
            case "out_for_delivery":
                return "bg-orange-50 text-orange-700 border border-orange-100";
            case "delivered":
                return "bg-emerald-50 text-emerald-700 border border-emerald-100";
            case "cancelled":
                return "bg-red-50 text-red-700 border border-red-100";
            default:
                return "bg-gray-50 text-gray-700 border border-gray-100";
        }
    };

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(
                status
            )}`}
        >
            {status?.replace("_", " ")}
        </span>
    );
};

const OrderRow = ({ order, onViewDetails }) => {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <tr
            className="hover:bg-gray-50/50 cursor-pointer transition-colors duration-200 group"
            onClick={() => onViewDetails(order)}
        >
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                {order.order_id || order.id}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                    {order.customer_name}
                </div>
                <div className="text-xs text-gray-500">
                    {order.customer_email}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                ₹{order.total_amount?.toFixed(2)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={order.status} />
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(order.created_at)}
            </td>
        </tr>
    );
};

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [dateRange, setDateRange] = useState("all");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await api.get("/orders");
            const ok = response?.data?.success;
            const payload = response?.data?.data?.orders;

            if (ok && Array.isArray(payload)) {
                const normalized = payload.map((o) => ({
                    id: o.id,
                    order_id: o.id,
                    customer_name: o.customerName || "",
                    customer_email: o.customerEmail || "",
                    customer_phone: o.customerPhone || "",
                    total_amount: Number(o.totalAmount ?? 0),
                    status: o.status,
                    created_at: o.createdAt,
                    delivery_address: o.deliveryAddress,
                    items: (o.items || []).map((item) => ({
                        name: item.name,
                        quantity: item.quantity,
                        price: Number(item.price ?? 0),
                        total: Number(
                            item.total ??
                                item.quantity * Number(item.price ?? 0) ??
                                0
                        ),
                    })),
                }));
                setOrders(normalized);
            } else {
                setOrders([
                    {
                        id: "ORD-001",
                        order_id: "ORD-001",
                        customer_name: "John Doe",
                        customer_email: "john@example.com",
                        customer_phone: "+91 9876543210",
                        total_amount: 450.0,
                        status: "delivered",
                        created_at: "2024-01-15T10:30:00Z",
                        delivery_address: "123 Main St, Bangalore",
                        items: [
                            { name: "Product 1", quantity: 2, price: 200 },
                            { name: "Product 2", quantity: 1, price: 50 },
                        ],
                    },
                    {
                        id: "ORD-002",
                        order_id: "ORD-002",
                        customer_name: "Jane Smith",
                        customer_email: "jane@example.com",
                        customer_phone: "+91 9876543211",
                        total_amount: 320.0,
                        status: "out_for_delivery",
                        created_at: "2024-01-15T14:15:00Z",
                        delivery_address: "456 Oak Ave, Mumbai",
                        items: [{ name: "Product 3", quantity: 1, price: 320 }],
                    },
                    {
                        id: "ORD-003",
                        order_id: "ORD-003",
                        customer_name: "Bob Johnson",
                        customer_email: "bob@example.com",
                        customer_phone: "+91 9876543212",
                        total_amount: 180.0,
                        status: "preparing",
                        created_at: "2024-01-15T16:45:00Z",
                        delivery_address: "789 Pine Rd, Delhi",
                        items: [{ name: "Product 4", quantity: 3, price: 60 }],
                    },
                ]);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            toast.error("Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setShowModal(true);
    };

    const getFilteredOrders = () => {
        return orders.filter((order) => {
            const matchesSearch =
                String(order.order_id)
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                order.customer_name
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                order.customer_email
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase());

            const matchesStatus =
                selectedStatus === "all" || order.status === selectedStatus;

            let matchesDate = true;
            if (dateRange !== "all") {
                const orderDate = new Date(order.created_at);
                const now = new Date();

                switch (dateRange) {
                    case "today":
                        matchesDate =
                            orderDate.toDateString() === now.toDateString();
                        break;
                    case "week":
                        const weekAgo = new Date(
                            now.getTime() - 7 * 24 * 60 * 60 * 1000
                        );
                        matchesDate = orderDate >= weekAgo;
                        break;
                    case "month":
                        const monthAgo = new Date(
                            now.getTime() - 30 * 24 * 60 * 60 * 1000
                        );
                        matchesDate = orderDate >= monthAgo;
                        break;
                }
            }

            return matchesSearch && matchesStatus && matchesDate;
        });
    };

    const filteredOrders = getFilteredOrders();

    const getTotalRevenue = () => {
        return filteredOrders.reduce(
            (sum, order) => sum + (order.total_amount || 0),
            0
        );
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Orders Management
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Track and manage all customer orders
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="stats-card">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                                <CurrencyRupeeIcon className="w-6 h-6 text-primary-600" />
                            </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">
                                    Total Revenue
                                </dt>
                                <dd className="text-2xl font-bold text-gray-900">
                                    ₹{getTotalRevenue().toFixed(2)}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div className="stats-card">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                                <ShoppingBagIcon className="w-6 h-6 text-emerald-600" />
                            </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">
                                    Total Orders
                                </dt>
                                <dd className="text-2xl font-bold text-gray-900">
                                    {filteredOrders.length}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div className="stats-card">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                                <FunnelIcon className="w-6 h-6 text-indigo-600" />
                            </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">
                                    Average Order
                                </dt>
                                <dd className="text-2xl font-bold text-gray-900">
                                    ₹
                                    {filteredOrders.length
                                        ? (
                                              getTotalRevenue() /
                                              filteredOrders.length
                                          ).toFixed(2)
                                        : "0.00"}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card p-5">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field pl-10"
                        />
                    </div>

                    <div>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="input-field"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="preparing">Preparing</option>
                            <option value="ready">Ready</option>
                            <option value="out_for_delivery">
                                Out for Delivery
                            </option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div>
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="input-field"
                        >
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">Last 7 Days</option>
                            <option value="month">Last 30 Days</option>
                        </select>
                    </div>

                    <div className="text-sm text-gray-500 flex items-center justify-end">
                        Showing {filteredOrders.length} of {orders.length}{" "}
                        orders
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="card overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-2 border-gray-200 border-t-primary-600 rounded-full animate-spin"></div>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                            <ShoppingBagIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="text-sm font-medium text-gray-900">
                            No orders found
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Try adjusting your search or filters.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Order ID
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {filteredOrders.map((order) => (
                                    <OrderRow
                                        key={order.id}
                                        order={order}
                                        onViewDetails={handleViewDetails}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={`Order Details - ${
                    selectedOrder?.order_id || selectedOrder?.id
                }`}
                maxWidth="sm:max-w-3xl"
            >
                {selectedOrder && (
                    <div className="space-y-6">
                        {/* Customer Info */}
                        <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-100">
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-1 h-4 bg-primary-500 rounded-full"></span>
                                Customer Information
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                                <div>
                                    <span className="text-gray-500 block mb-1">
                                        Name
                                    </span>
                                    <p className="font-medium text-gray-900">
                                        {selectedOrder.customer_name}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-500 block mb-1">
                                        Email
                                    </span>
                                    <p className="font-medium text-gray-900">
                                        {selectedOrder.customer_email}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-500 block mb-1">
                                        Phone
                                    </span>
                                    <p className="font-medium text-gray-900">
                                        {selectedOrder.customer_phone || "N/A"}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-500 block mb-1">
                                        Address
                                    </span>
                                    <p className="font-medium text-gray-900">
                                        {selectedOrder.delivery_address ||
                                            "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-1 h-4 bg-primary-500 rounded-full"></span>
                                Order Items
                            </h4>
                            <div className="border border-gray-100 rounded-xl overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-100">
                                    <thead className="bg-gray-50/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Item
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Qty
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Price
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {selectedOrder.items?.length ? (
                                            selectedOrder.items.map(
                                                (item, index) => (
                                                    <tr key={index}>
                                                        <td className="px-4 py-3 text-sm text-gray-900">
                                                            {item.name}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">
                                                            {item.quantity}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">
                                                            ₹
                                                            {item.price?.toFixed(
                                                                2
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                            ₹
                                                            {(
                                                                item.total ??
                                                                item.quantity *
                                                                    Number(
                                                                        item.price ??
                                                                            0
                                                                    )
                                                            ).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                )
                                            )
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="4"
                                                    className="px-4 py-3 text-sm text-gray-500 text-center"
                                                >
                                                    No items available
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-100">
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-1 h-4 bg-primary-500 rounded-full"></span>
                                Order Summary
                            </h4>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">
                                        Status
                                    </span>
                                    <StatusBadge
                                        status={selectedOrder.status}
                                    />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">
                                        Order Date
                                    </span>
                                    <span className="font-medium text-gray-900">
                                        {new Date(
                                            selectedOrder.created_at
                                        ).toLocaleDateString()}
                                    </span>
                                </div>
                                {selectedOrder.delivery_time && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">
                                            Delivery Time
                                        </span>
                                        <span className="font-medium text-gray-900">
                                            {new Date(
                                                selectedOrder.delivery_time
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                                <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between items-center">
                                    <span className="font-semibold text-gray-900">
                                        Total Amount
                                    </span>
                                    <span className="text-lg font-bold text-primary-600">
                                        ₹
                                        {selectedOrder.total_amount?.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
