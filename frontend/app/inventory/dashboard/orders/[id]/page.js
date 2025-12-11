"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/inventory/components/DashboardLayout";
import { orderAPI } from "@/inventory/lib/api";
import {
    ArrowLeftIcon,
    CalendarIcon,
    UserIcon,
    MapPinIcon,
    TruckIcon,
    BanknotesIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { formatCurrency, formatDateTime, ORDER_STATUS } from "@/inventory/lib/utils";
import DashboardLayout from "@/inventory/components/DashboardLayout";
import LoadingSpinner from "@/inventory/components/LoadingSpinner";
import { orderAPI } from "@/inventory/lib/api";
import DashboardLayout from "@/inventory/components/DashboardLayout";
import LoadingSpinner from "@/inventory/components/LoadingSpinner";
import { orderAPI } from "@/inventory/lib/api";

export default function OrderDetailsPage({ params }) {
    const router = useRouter();
    const { id } = params;
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await orderAPI.getOrderById(id);
                setOrder(response.data.data);
            } catch (error) {
                toast.error("Failed to fetch order details");
                console.error("Fetch order error:", error);
                router.push("/inventory/dashboard/orders");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchOrder();
        }
    }, [id, router]);

    if (loading) {
        return (
            <DashboardLayout>
                <LoadingSpinner />
            </DashboardLayout>
        );
    }

    if (!order) {
        return null;
    }

    const statusInfo = ORDER_STATUS[order.order.status] || {
        text: order.order.status,
        color: "gray",
    };
    const statusColors = {
        blue: "bg-blue-50 text-blue-700 ring-blue-600/20",
        indigo: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
        amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
        purple: "bg-purple-50 text-purple-700 ring-purple-600/20",
        orange: "bg-orange-50 text-orange-700 ring-orange-600/20",
        emerald: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
        rose: "bg-rose-50 text-rose-700 ring-rose-600/20",
        gray: "bg-gray-50 text-gray-700 ring-gray-600/20",
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                        >
                            <ArrowLeftIcon className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                Order #{order.order.id}
                            </h1>
                            <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                                <CalendarIcon className="h-4 w-4" />
                                <span>
                                    {formatDateTime(order.order.createdAt)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span
                            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusColors[statusInfo.color]
                                }`}
                        >
                            {statusInfo.text}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content - Order Items */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                                <h3 className="font-semibold text-slate-900">
                                    Order Items
                                </h3>
                            </div>
                            <div className="divide-y divide-slate-200">
                                {order.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="p-6 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center">
                                                <span className="text-lg font-bold text-slate-400">
                                                    {item.itemName.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">
                                                    {item.itemName}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    {formatCurrency(
                                                        item.unitPrice
                                                    )}{" "}
                                                    / {item.unit}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-slate-900">
                                                {formatCurrency(
                                                    item.totalPrice
                                                )}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                Qty: {item.quantity}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-500">
                                        Subtotal
                                    </span>
                                    <span className="font-medium text-slate-900">
                                        {formatCurrency(order.order.subtotal)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-500">
                                        Delivery Fee
                                    </span>
                                    <span className="font-medium text-slate-900">
                                        {formatCurrency(
                                            order.order.deliveryFee
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-500">Tax</span>
                                    <span className="font-medium text-slate-900">
                                        {formatCurrency(order.order.taxAmount)}
                                    </span>
                                </div>
                                {parseFloat(order.order.discountAmount) > 0 && (
                                    <div className="flex justify-between text-sm mb-2 text-emerald-600">
                                        <span>Discount</span>
                                        <span className="font-medium">
                                            -
                                            {formatCurrency(
                                                order.order.discountAmount
                                            )}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between text-base font-bold mt-4 pt-4 border-t border-slate-200">
                                    <span className="text-slate-900">
                                        Total
                                    </span>
                                    <span className="text-blue-600">
                                        {formatCurrency(
                                            order.order.totalAmount
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Order Info */}
                    <div className="space-y-6">
                        {/* Customer Info */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <UserIcon className="h-5 w-5 text-slate-400" />
                                Customer Details
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider">
                                        Customer ID
                                    </p>
                                    <p className="text-sm font-medium text-slate-900">
                                        #{order.order.customerId}
                                    </p>
                                </div>
                                {order.order.notes && (
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-wider">
                                            Notes
                                        </p>
                                        <p className="text-sm text-slate-700 mt-1 bg-amber-50 p-3 rounded-lg border border-amber-100">
                                            {order.order.notes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Delivery Info */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <TruckIcon className="h-5 w-5 text-slate-400" />
                                Delivery Info
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider">
                                        Status
                                    </p>
                                    <p className="text-sm font-medium text-slate-900 capitalize">
                                        {order.order.status.replace(/_/g, " ")}
                                    </p>
                                </div>
                                {order.order.estimatedDeliveryTime && (
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-wider">
                                            Estimated Delivery
                                        </p>
                                        <p className="text-sm font-medium text-slate-900">
                                            {formatDateTime(
                                                order.order
                                                    .estimatedDeliveryTime
                                            )}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
