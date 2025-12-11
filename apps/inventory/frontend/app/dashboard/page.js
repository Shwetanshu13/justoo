"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { inventoryAPI } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import {
    CubeIcon,
    ExclamationTriangleIcon,
    ChartBarIcon,
    ShoppingCartIcon,
    BoltIcon,
    ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Dashboard() {
    const router = useRouter();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const response = await inventoryAPI.getDashboardStats();
            setStats(response.data.data);
        } catch (error) {
            toast.error("Failed to fetch dashboard stats");
            console.error("Dashboard stats error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <LoadingSpinner />
            </DashboardLayout>
        );
    }

    const statCards = [
        {
            name: "Total Items",
            stat: stats?.totalItems || 0,
            trend: "+12%",
            icon: CubeIcon,
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            name: "In Stock",
            stat: stats?.inStockItems || 0,
            trend: "Good",
            icon: ChartBarIcon,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
        },
        {
            name: "Out of Stock",
            stat: stats?.outOfStockItems || 0,
            trend: "Action needed",
            icon: ExclamationTriangleIcon,
            color: "text-rose-600",
            bg: "bg-rose-50",
        },
        {
            name: "Low Stock",
            stat: stats?.lowStockItems || 0,
            trend: "Warning",
            icon: ExclamationTriangleIcon,
            color: "text-amber-600",
            bg: "bg-amber-50",
        },
    ];

    const quickActions = [
        {
            label: "Add Item",
            icon: CubeIcon,
            action: "/dashboard/inventory/add",
            color: "text-blue-600",
            bg: "bg-blue-50",
            description: "Create new inventory item",
        },
        {
            label: "View Inventory",
            icon: ChartBarIcon,
            action: "/dashboard/inventory",
            color: "text-indigo-600",
            bg: "bg-indigo-50",
            description: "Manage your catalog",
        },
        {
            label: "View Orders",
            icon: ShoppingCartIcon,
            action: "/dashboard/orders",
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            description: "Check fulfillment status",
        },
        {
            label: "Reports",
            icon: ChartBarIcon,
            action: "/dashboard/reports",
            color: "text-amber-600",
            bg: "bg-amber-50",
            description: "View analytics & insights",
        },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Dashboard Overview
                        </h1>
                        <p className="text-slate-500 mt-1">
                            Welcome back, here's what's happening with your
                            inventory today.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((item) => (
                        <div
                            key={item.name}
                            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div
                                    className={`p-2 rounded-lg ${item.bg} ${item.color}`}
                                >
                                    <item.icon className="h-6 w-6" />
                                </div>
                                {item.trend && (
                                    <span
                                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                                            item.name === "Out of Stock"
                                                ? "bg-rose-50 text-rose-600"
                                                : item.name === "Low Stock"
                                                ? "bg-amber-50 text-amber-600"
                                                : "bg-emerald-50 text-emerald-600"
                                        }`}
                                    >
                                        {item.trend}
                                    </span>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    {item.name}
                                </p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">
                                    {item.stat}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">
                            Quick Actions
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {quickActions.map((action) => (
                                <button
                                    key={action.label}
                                    onClick={() => router.push(action.action)}
                                    className="flex items-start p-4 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/50 transition-all text-left group"
                                >
                                    <div
                                        className={`p-2 rounded-lg mr-4 ${action.bg} ${action.color} group-hover:scale-110 transition-transform`}
                                    >
                                        <action.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900 group-hover:text-blue-700">
                                            {action.label}
                                        </p>
                                        <p className="text-sm text-slate-500 mt-0.5">
                                            {action.description}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-xl p-6 text-white">
                        <div className="flex items-center gap-2 mb-6">
                            <BoltIcon className="h-5 w-5 text-yellow-400" />
                            <h3 className="font-bold">System Status</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-white/10 pb-3">
                                <span className="text-slate-300 text-sm">
                                    Database
                                </span>
                                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                    Operational
                                </span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/10 pb-3">
                                <span className="text-slate-300 text-sm">
                                    API Gateway
                                </span>
                                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                    Operational
                                </span>
                            </div>
                            <div className="flex justify-between items-center pb-1">
                                <span className="text-slate-300 text-sm">
                                    Sync Service
                                </span>
                                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                    Operational
                                </span>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-white/10">
                            <p className="text-xs text-slate-400">
                                Last checked: Just now
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
