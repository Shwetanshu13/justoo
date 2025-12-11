"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { inventoryAPI, orderAPI } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import {
    ChartBarIcon,
    DocumentChartBarIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    BoltIcon,
    ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function ReportsPage() {
    const [dashboardStats, setDashboardStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReportData();
    }, []);

    const fetchReportData = async () => {
        try {
            setLoading(true);
            const [statsResponse, ordersResponse] = await Promise.all([
                inventoryAPI.getDashboardStats(),
                orderAPI.getAllOrders({ limit: 10 }),
            ]);
            console.log(ordersResponse, statsResponse);
            setDashboardStats(statsResponse.data.data);
            setRecentOrders(ordersResponse.data.data);
        } catch (error) {
            toast.error("Failed to fetch report data");
            console.error("Report data error:", error);
        } finally {
            setLoading(false);
        }
    };

    const exportOrdersReport = async () => {
        try {
            const toastId = toast.loading("Generating report...");
            const response = await orderAPI.getAllOrders({ limit: 1000 });
            const orders = response.data.data;

            const headers = [
                "Order ID",
                "Date",
                "Status",
                "Items Count",
                "Total Amount",
                "Notes",
            ];
            const csvContent = [
                headers.join(","),
                ...orders.map((order) =>
                    [
                        order.id,
                        new Date(order.createdAt).toLocaleDateString(),
                        order.status,
                        order.itemCount,
                        order.totalAmount,
                        `"${(order.notes || "").replace(/"/g, '""')}"`,
                    ].join(",")
                ),
            ].join("\n");

            const blob = new Blob([csvContent], {
                type: "text/csv;charset=utf-8;",
            });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute(
                "download",
                `orders_report_${new Date().toISOString().split("T")[0]}.csv`
            );
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("Report downloaded successfully", { id: toastId });
        } catch (error) {
            toast.error("Failed to export report");
            console.error("Export error:", error);
        }
    };

    const exportInventoryReport = async () => {
        try {
            const toastId = toast.loading("Generating inventory report...");
            const response = await inventoryAPI.getAllItems({ limit: 1000 });
            const items = response.data.data;

            const headers = [
                "ID",
                "Name",
                "Category",
                "Price",
                "Quantity",
                "Unit",
                "Status",
                "Min Stock Level",
            ];
            const csvContent = [
                headers.join(","),
                ...items.map((item) =>
                    [
                        item.id,
                        `"${(item.name || "").replace(/"/g, '""')}"`,
                        `"${(item.category || "").replace(/"/g, '""')}"`,
                        item.price,
                        item.quantity,
                        item.unit,
                        item.quantity === 0
                            ? "Out of Stock"
                            : item.quantity <= item.minStockLevel
                            ? "Low Stock"
                            : "In Stock",
                        item.minStockLevel,
                    ].join(",")
                ),
            ].join("\n");

            const blob = new Blob([csvContent], {
                type: "text/csv;charset=utf-8;",
            });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute(
                "download",
                `inventory_report_${new Date().toISOString().split("T")[0]}.csv`
            );
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("Inventory report downloaded", { id: toastId });
        } catch (error) {
            toast.error("Failed to export inventory");
            console.error("Export error:", error);
        }
    };

    const generateSummaryReport = async () => {
        try {
            const toastId = toast.loading("Generating summary report...");

            // We already have dashboardStats from the initial fetch
            if (!dashboardStats) {
                toast.error("Dashboard stats not available");
                return;
            }

            const summaryData = [
                ["Metric", "Value"],
                ["Report Date", new Date().toLocaleDateString()],
                ["Total Items", dashboardStats.totalItems],
                [
                    "Total Inventory Value",
                    formatCurrency(dashboardStats.totalInventoryValue),
                ],
                ["In Stock Items", dashboardStats.inStockItems],
                ["Low Stock Items", dashboardStats.lowStockItems],
                ["Out of Stock Items", dashboardStats.outOfStockItems],
                ["Active Items", dashboardStats.activeItems || 0],
                ["Inactive Items", dashboardStats.inactiveItems || 0],
            ];

            const csvContent = summaryData
                .map((row) => row.join(","))
                .join("\n");

            const blob = new Blob([csvContent], {
                type: "text/csv;charset=utf-8;",
            });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute(
                "download",
                `summary_report_${new Date().toISOString().split("T")[0]}.csv`
            );
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("Summary report downloaded", { id: toastId });
        } catch (error) {
            toast.error("Failed to generate summary");
            console.error("Summary generation error:", error);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center py-20">
                    <div className="h-12 w-12 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    const reportCards = [
        {
            title: "Inventory Overview",
            stats: [
                {
                    label: "Total Items",
                    value: dashboardStats?.totalItems || 0,
                },
                {
                    label: "Total Value",
                    value: formatCurrency(
                        dashboardStats?.totalInventoryValue || 0
                    ),
                },
                { label: "In Stock", value: dashboardStats?.inStockItems || 0 },
                {
                    label: "Out of Stock",
                    value: dashboardStats?.outOfStockItems || 0,
                },
            ],
            icon: ChartBarIcon,
            color: "blue",
        },
        {
            title: "Stock Alerts",
            stats: [
                {
                    label: "Low Stock Items",
                    value: dashboardStats?.lowStockItems || 0,
                },
                {
                    label: "Critical Items",
                    value: dashboardStats?.outOfStockItems || 0,
                },
                {
                    label: "Active Items",
                    value: dashboardStats?.activeItems || 0,
                },
                {
                    label: "Inactive Items",
                    value: dashboardStats?.inactiveItems || 0,
                },
            ],
            icon: ArrowTrendingDownIcon,
            color: "red",
        },
        {
            title: "Recent Activity",
            stats: [
                { label: "Recent Orders", value: recentOrders.length },
                {
                    label: "Total Order Value",
                    value: formatCurrency(
                        recentOrders.reduce(
                            (sum, order) => sum + parseFloat(order.totalAmount),
                            0
                        )
                    ),
                },
                {
                    label: "Avg Order Value",
                    value: formatCurrency(
                        recentOrders.length > 0
                            ? recentOrders.reduce(
                                  (sum, order) =>
                                      sum + parseFloat(order.totalAmount),
                                  0
                              ) / recentOrders.length
                            : 0
                    ),
                },
                {
                    label: "Items Ordered",
                    value: recentOrders.reduce(
                        (sum, order) => sum + order.itemCount,
                        0
                    ),
                },
            ],
            icon: ArrowTrendingUpIcon,
            color: "green",
        },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Reports & Analytics
                        </h1>
                        <p className="text-slate-500 mt-1">
                            Insights into your inventory performance and order
                            activity.
                        </p>
                    </div>
                    <button
                        onClick={exportOrdersReport}
                        className="inline-flex items-center gap-2 rounded-lg bg-white border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                        Export Orders
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {reportCards.map((card, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div
                                    className={`p-2 rounded-lg ${
                                        card.color === "blue"
                                            ? "bg-blue-50 text-blue-600"
                                            : card.color === "red"
                                            ? "bg-rose-50 text-rose-600"
                                            : "bg-emerald-50 text-emerald-600"
                                    }`}
                                >
                                    <card.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">
                                        {card.title}
                                    </p>
                                </div>
                            </div>
                            <dl className="space-y-3">
                                {card.stats.map((stat, statIndex) => (
                                    <div
                                        key={statIndex}
                                        className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
                                    >
                                        <dt className="text-sm text-slate-500">
                                            {stat.label}
                                        </dt>
                                        <dd className="text-sm font-semibold text-slate-900">
                                            {stat.value}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <DocumentChartBarIcon className="h-5 w-5 text-slate-400" />
                            <h3 className="font-bold text-slate-900">
                                Recent Orders
                            </h3>
                        </div>
                        <span className="text-xs font-medium text-slate-500 bg-slate-200/50 px-2 py-1 rounded-full">
                            Last 10 entries
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Order ID
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
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                                {recentOrders.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="px-6 py-8 text-center text-slate-500"
                                        >
                                            No recent orders found
                                        </td>
                                    </tr>
                                ) : (
                                    recentOrders.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="hover:bg-slate-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                #{order.id}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {order.itemCount} items
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                {formatCurrency(
                                                    order.totalAmount
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        order.status ===
                                                        "completed"
                                                            ? "bg-emerald-50 text-emerald-600"
                                                            : order.status ===
                                                              "cancelled"
                                                            ? "bg-rose-50 text-rose-600"
                                                            : "bg-blue-50 text-blue-600"
                                                    }`}
                                                >
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {new Date(
                                                    order.createdAt
                                                ).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-slate-900">
                                Exports & Automations
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">
                                Trigger downstream workflows directly from
                                analytics.
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <button
                            onClick={exportInventoryReport}
                            className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center justify-center gap-2"
                        >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                            Export Inventory
                        </button>
                        <button
                            onClick={exportOrdersReport}
                            className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center justify-center gap-2"
                        >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                            Export Orders
                        </button>
                        <button
                            onClick={generateSummaryReport}
                            className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center justify-center gap-2"
                        >
                            <DocumentChartBarIcon className="h-4 w-4" />
                            Generate Summary
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
