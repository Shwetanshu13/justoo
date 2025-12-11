"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/inventory/components/DashboardLayout";
import { orderAPI } from "@/inventory/lib/api";
import { formatCurrency, formatDateTime, ORDER_STATUS } from "@/inventory/lib/utils";
import { useAuth } from "@/inventory/contexts/AuthContext";
import {
    EyeIcon,
    MagnifyingGlassIcon,
    ArrowTrendingUpIcon,
    DocumentChartBarIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function OrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const { user } = useAuth();

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                ...(statusFilter !== "all" && { status: statusFilter }),
            };

            const response = await orderAPI.getAllOrders(params);
            setOrders(response.data.data);
        } catch (error) {
            toast.error("Failed to fetch orders");
            console.error("Fetch orders error:", error);
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const filteredOrders = useMemo(
        () =>
            orders.filter(
                (order) =>
                    order.id.toString().includes(searchTerm) ||
                    order.notes
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase())
            ),
        [orders, searchTerm]
    );

    const summary = useMemo(() => {
        const totalValue = filteredOrders.reduce(
            (sum, order) => sum + parseFloat(order.totalAmount),
            0
        );
        const completed = filteredOrders.filter(
            (o) => o.status === "completed"
        ).length;
        return {
            totalOrders: filteredOrders.length,
            totalValue,
            completed,
        };
    }, [filteredOrders]);

    const statusClasses = {
        placed: "bg-blue-50 text-blue-600",
        confirmed: "bg-indigo-50 text-indigo-600",
        preparing: "bg-amber-50 text-amber-600",
        ready: "bg-purple-50 text-purple-600",
        out_for_delivery: "bg-orange-50 text-orange-600",
        delivered: "bg-emerald-50 text-emerald-600",
        completed: "bg-emerald-50 text-emerald-600",
        cancelled: "bg-rose-50 text-rose-600",
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Orders
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Track and manage your customer orders.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">
                            Total Orders
                        </p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">
                            {summary.totalOrders}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">
                            Revenue
                        </p>
                        <p className="mt-2 text-2xl font-bold text-emerald-600">
                            {formatCurrency(summary.totalValue)}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">
                            Completed
                        </p>
                        <p className="mt-2 text-2xl font-bold text-blue-600">
                            {summary.completed}
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-200 bg-slate-50/50">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    placeholder="Search orders..."
                                    className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                />
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value)
                                }
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            >
                                <option value="all">All Status</option>
                                <option value="placed">Placed</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="preparing">Preparing</option>
                                <option value="ready">Ready</option>
                                <option value="out_for_delivery">
                                    Out for Delivery
                                </option>
                                <option value="delivered">Delivered</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 py-12 text-center">
                            <div className="rounded-full bg-slate-100 p-3">
                                <DocumentChartBarIcon className="h-6 w-6 text-slate-400" />
                            </div>
                            <div>
                                <p className="text-base font-semibold text-slate-900">
                                    No orders found
                                </p>
                                <p className="text-sm text-slate-500">
                                    Try adjusting your filters.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Order ID
                                        </th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Items
                                        </th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Total
                                        </th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Notes
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white">
                                    {filteredOrders.map((order) => (
                                        <tr
                                            key={order.id}
                                            onClick={() =>
                                                router.push(
                                                    `/inventory/dashboard/orders/${order.id}`
                                                )
                                            }
                                            className="hover:bg-slate-50 transition-colors cursor-pointer"
                                        >
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                #{order.id}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {formatDateTime(
                                                    order.createdAt
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {order.itemCount ||
                                                    order.items?.length ||
                                                    0}{" "}
                                                items
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                {formatCurrency(
                                                    order.totalAmount
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[
                                                        order.status
                                                        ]
                                                        }`}
                                                >
                                                    {ORDER_STATUS[order.status]
                                                        ?.text || order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">
                                                {order.notes || "-"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
