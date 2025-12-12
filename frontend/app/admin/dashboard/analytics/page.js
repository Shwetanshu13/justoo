"use client";

import { useState, useEffect } from "react";
import { api } from "@/admin/lib/api";
import toast from "react-hot-toast";
import {
    ChartBarIcon,
    CurrencyRupeeIcon,
    ShoppingBagIcon,
    TruckIcon,
    UsersIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";

const MetricCard = ({
    title,
    value,
    change,
    changeType = "increase",
    icon: Icon,
}) => {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">
                        {value}
                    </p>
                    {change && (
                        <div className="mt-2 flex items-center text-xs">
                            <span
                                className={`inline-flex items-center gap-1 font-medium ${
                                    changeType === "increase"
                                        ? "text-indigo-600"
                                        : "text-gray-500"
                                }`}
                            >
                                {changeType === "increase" ? (
                                    <ArrowUpIcon className="h-3 w-3" />
                                ) : (
                                    <ArrowDownIcon className="h-3 w-3" />
                                )}
                                {change}
                            </span>
                        </div>
                    )}
                </div>
                <div className="h-12 w-12 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-indigo-600" />
                </div>
            </div>
        </div>
    );
};

const SparkLineChart = ({ data = [] }) => {
    if (!data.length) {
        return (
            <div className="flex items-center justify-center h-36 text-sm text-gray-400">
                <div className="text-center">
                    <ChartBarIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    No data available
                </div>
            </div>
        );
    }

    const values = data.map((d) => Number(d.value) || 0);
    const maxVal = Math.max(...values, 1);
    const points = data.map((d, i) => {
        const x = (i / Math.max(data.length - 1, 1)) * 100;
        const y = 100 - (Number(d.value) / maxVal) * 100;
        return `${x},${y}`;
    });

    const areaPoints = `0,100 ${points.join(" ")} 100,100`;

    return (
        <svg
            viewBox="0 0 100 100"
            className="w-full h-36"
            preserveAspectRatio="none"
        >
            <defs>
                <linearGradient
                    id="areaGradient"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                >
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon fill="url(#areaGradient)" points={areaPoints} />
            <polyline
                fill="none"
                stroke="#4f46e5"
                strokeWidth="2"
                points={points.join(" ")}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

const BarChart = ({ data = [] }) => {
    if (!data.length) {
        return (
            <div className="flex items-center justify-center h-32 text-sm text-gray-400">
                <div className="text-center">
                    <ChartBarIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    No data available
                </div>
            </div>
        );
    }
    const maxVal = Math.max(...data.map((d) => Number(d.value) || 0), 1);
    return (
        <div className="space-y-3">
            {data.map((d) => {
                const width = (Number(d.value) / maxVal) * 100;
                return (
                    <div key={d.label}>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium text-gray-700">
                                {d.label}
                            </span>
                            <span className="text-gray-500">{d.value}</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-2 rounded-full bg-indigo-600 transition-all duration-300"
                                style={{ width: `${width}%` }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const TopProducts = ({ products }) => {
    if (!products?.length) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-5">
                <h3 className="text-base font-semibold text-gray-900 mb-4">
                    Top Selling Products
                </h3>
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                    <ShoppingBagIcon className="h-10 w-10 mb-2 text-gray-300" />
                    <p className="text-sm">No data available</p>
                </div>
            </div>
        );
    }
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
                Top Selling Products
            </h3>
            <div className="space-y-3">
                {products.map((product, index) => (
                    <div
                        key={product.id}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                    >
                        <div className="flex items-center gap-3">
                            <span
                                className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                                    index === 0
                                        ? "bg-indigo-600 text-white"
                                        : index === 1
                                        ? "bg-indigo-100 text-indigo-700"
                                        : "bg-gray-100 text-gray-600"
                                }`}
                            >
                                {index + 1}
                            </span>
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    {product.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {product.sales} sold
                                </p>
                            </div>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                            ₹{product.revenue?.toLocaleString()}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const RecentOrders = ({ orders }) => {
    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case "delivered":
                return "bg-indigo-50 text-indigo-700";
            case "out_for_delivery":
                return "bg-gray-100 text-gray-700";
            case "preparing":
                return "bg-gray-50 text-gray-600";
            case "cancelled":
                return "bg-gray-800 text-white";
            default:
                return "bg-gray-100 text-gray-600";
        }
    };

    if (!orders?.length) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-5">
                <h3 className="text-base font-semibold text-gray-900 mb-4">
                    Recent Orders
                </h3>
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                    <TruckIcon className="h-10 w-10 mb-2 text-gray-300" />
                    <p className="text-sm">No recent orders</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
                Recent Orders
            </h3>
            <div className="space-y-3">
                {orders.map((order) => (
                    <div
                        key={order.id}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                    >
                        <div>
                            <p className="text-sm font-medium text-gray-900">
                                {order.order_id}
                            </p>
                            <p className="text-xs text-gray-500">
                                {order.customer_name}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">
                                ₹{order.total_amount?.toLocaleString()}
                            </p>
                            <span
                                className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getStatusStyle(
                                    order.status
                                )}`}
                            >
                                {order.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ExportActionCard = ({
    title,
    description,
    onClick,
    loading,
    disabled = false,
    badge = "CSV",
}) => {
    const isDisabled = disabled || loading;
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={isDisabled}
            aria-busy={loading}
            aria-pressed={loading}
            className="group relative w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-indigo-200 hover:shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-70"
        >
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-indigo-50 text-indigo-600">
                    {loading ? (
                        <div className="h-5 w-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                    ) : (
                        <DocumentArrowDownIcon className="h-5 w-5" />
                    )}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">
                            {title}
                        </p>
                        {badge ? (
                            <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
                                {badge}
                            </span>
                        ) : null}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{description}</p>
                </div>
                <span className="hidden items-center gap-1 text-xs font-semibold text-indigo-600 transition group-hover:translate-x-0.5 sm:inline-flex">
                    Download
                    <ArrowDownIcon className="h-3.5 w-3.5" />
                </span>
            </div>
        </button>
    );
};

export default function AnalyticsPage() {
    const [analytics, setAnalytics] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        activeRiders: 0,
        totalCustomers: 0,
        revenueChange: 0,
    });
    const [topProducts, setTopProducts] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [revenueTrend, setRevenueTrend] = useState([]);
    const [orderStatusDist, setOrderStatusDist] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [categoryDistribution, setCategoryDistribution] = useState([]);
    const [dateRange, setDateRange] = useState("30");
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(null);

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange]);

    const exportToCSV = (data, filename, headers) => {
        const csvContent = [
            headers.join(","),
            ...data.map((row) =>
                headers
                    .map((header) => {
                        const value =
                            row[header.toLowerCase().replace(/ /g, "_")] ||
                            row[header] ||
                            "";
                        return typeof value === "string" && value.includes(",")
                            ? `"${value}"`
                            : value;
                    })
                    .join(",")
            ),
        ].join("\n");

        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}_${
            new Date().toISOString().split("T")[0]
        }.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
    };

    const exportSalesReport = async () => {
        try {
            setExporting("sales");
            const salesData = revenueTrend.map((item) => ({
                Date: item.label,
                Revenue: item.value,
            }));

            if (!salesData.length) {
                toast.error("No sales data available to export");
                return;
            }

            exportToCSV(salesData, "sales_report", ["Date", "Revenue"]);
            toast.success("Sales report exported successfully");
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Failed to export sales report");
        } finally {
            setExporting(null);
        }
    };

    const exportOrdersReport = async () => {
        try {
            setExporting("orders");
            const ordersRes = await api.get("/orders", {
                params: { limit: 1000, sortOrder: "desc" },
            });
            const ordersList = ordersRes.data?.data?.orders || [];

            if (!ordersList.length) {
                toast.error("No orders data available to export");
                return;
            }

            const ordersData = ordersList.map((order) => ({
                Order_ID: order.id,
                Customer: order.customerName || order.customerEmail || "N/A",
                Amount: order.totalAmount || 0,
                Status: order.status || "unknown",
                Date: order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString()
                    : "N/A",
            }));

            exportToCSV(ordersData, "orders_report", [
                "Order_ID",
                "Customer",
                "Amount",
                "Status",
                "Date",
            ]);
            toast.success("Orders report exported successfully");
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Failed to export orders report");
        } finally {
            setExporting(null);
        }
    };

    const exportAnalyticsSummary = () => {
        try {
            setExporting("summary");
            const summaryData = [
                {
                    Metric: "Total Revenue",
                    Value: `₹${analytics.totalRevenue.toLocaleString()}`,
                },
                { Metric: "Total Orders", Value: analytics.totalOrders },
                {
                    Metric: "Average Order Value",
                    Value: `₹${analytics.averageOrderValue.toFixed(0)}`,
                },
                { Metric: "Active Riders", Value: analytics.activeRiders },
                { Metric: "Total Customers", Value: analytics.totalCustomers },
                {
                    Metric: "Revenue Change",
                    Value: `${analytics.revenueChange}%`,
                },
            ];

            exportToCSV(summaryData, "analytics_summary", ["Metric", "Value"]);
            toast.success("Analytics summary exported successfully");
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Failed to export analytics summary");
        } finally {
            setExporting(null);
        }
    };

    const fetchAnalytics = async () => {
        try {
            setLoading(true);

            const [dashboardRes, ordersRes] = await Promise.all([
                api.get(`/analytics/dashboard?days=${dateRange}`),
                api.get("/orders", { params: { limit: 5, sortOrder: "desc" } }),
            ]);

            const dashboardData =
                dashboardRes.data?.data || dashboardRes.data || {};
            const ordersData = dashboardData.orders || {};
            const usersData = dashboardData.users || {};
            const inventoryData = dashboardData.inventory || {};
            const paymentsData = dashboardData.payments || {};

            const totalRevenue = Number(ordersData.revenue?.total || 0);
            const totalOrders = Number(ordersData.totalOrders || 0);
            const averageOrderValue = Number(ordersData.revenue?.average || 0);
            const activeRiders = Number(usersData.activeRiders || 0);
            const totalCustomers = Number(
                usersData.activeCustomers || usersData.recentRegistrations || 0
            );

            const trendArr = ordersData.dailyTrend || [];
            const firstPoint = trendArr[0]?.revenue || 0;
            const lastPoint = trendArr[trendArr.length - 1]?.revenue || 0;
            const revenueChange = firstPoint
                ? ((lastPoint - firstPoint) / firstPoint) * 100
                : 0;

            setAnalytics({
                totalRevenue,
                totalOrders,
                averageOrderValue,
                activeRiders,
                totalCustomers,
                revenueChange: Number(revenueChange.toFixed(2)),
            });

            const trend = (ordersData.dailyTrend || []).map((item) => ({
                label: item.date,
                value: Number(item.revenue || 0),
            }));
            setRevenueTrend(trend);

            const orderStatus = ordersData.ordersByStatus || {};
            setOrderStatusDist(
                Object.keys(orderStatus).map((key) => ({
                    label: key,
                    value: Number(orderStatus[key] || 0),
                }))
            );

            setPaymentMethods(
                (paymentsData.paymentMethods || []).map((p) => ({
                    label: p.method || "Unknown",
                    value: Number(p.total || 0),
                }))
            );

            setCategoryDistribution(
                (inventoryData.categoryDistribution || []).map((c) => ({
                    label: c.category || "Uncategorized",
                    value: Number(c.itemCount || 0),
                }))
            );

            const topProductsMapped = (inventoryData.topSellingItems || []).map(
                (item) => ({
                    id: item.itemId,
                    name: item.itemName || "Unknown Product",
                    category: "General",
                    sales: Number(item.totalSold || 0),
                    revenue: Number(item.totalRevenue || 0),
                })
            );
            setTopProducts(topProductsMapped);

            const ordersList = ordersRes.data?.data?.orders || [];
            const recentOrdersMapped = ordersList.map((order) => ({
                id: order.id,
                order_id: order.id,
                customer_name:
                    order.customerName || order.customerEmail || "Customer",
                total_amount: Number(order.totalAmount || 0),
                status: order.status || "unknown",
            }));
            setRecentOrders(recentOrdersMapped);
        } catch (error) {
            console.error("Error fetching analytics:", error);
            toast.error("Failed to fetch analytics data");

            setAnalytics({
                totalRevenue: 0,
                totalOrders: 0,
                averageOrderValue: 0,
                activeRiders: 0,
                totalCustomers: 0,
                revenueChange: 0,
            });
            setTopProducts([]);
            setRecentOrders([]);
            setRevenueTrend([]);
            setOrderStatusDist([]);
            setPaymentMethods([]);
            setCategoryDistribution([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Analytics
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Business performance and insights
                    </p>
                </div>
                <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="input-field w-full sm:w-40"
                >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                    <option value="365">Last year</option>
                </select>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <MetricCard
                    title="Total Revenue"
                    value={`₹${analytics.totalRevenue.toLocaleString()}`}
                    change={
                        analytics.revenueChange
                            ? `${analytics.revenueChange > 0 ? "+" : ""}${
                                  analytics.revenueChange
                              }%`
                            : null
                    }
                    changeType={
                        analytics.revenueChange >= 0 ? "increase" : "decrease"
                    }
                    icon={CurrencyRupeeIcon}
                />
                <MetricCard
                    title="Total Orders"
                    value={analytics.totalOrders.toLocaleString()}
                    icon={ShoppingBagIcon}
                />
                <MetricCard
                    title="Avg Order Value"
                    value={`₹${analytics.averageOrderValue.toFixed(0)}`}
                    icon={ChartBarIcon}
                />
                <MetricCard
                    title="Active Riders"
                    value={analytics.activeRiders.toString()}
                    icon={TruckIcon}
                />
                <MetricCard
                    title="Customers"
                    value={analytics.totalCustomers.toString()}
                    icon={UsersIcon}
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-base font-semibold text-gray-900">
                                Revenue Trend
                            </h3>
                            <p className="text-xs text-gray-500">
                                Daily revenue over time
                            </p>
                        </div>
                        <CurrencyRupeeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <SparkLineChart data={revenueTrend} />
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-base font-semibold text-gray-900">
                                Order Status
                            </h3>
                            <p className="text-xs text-gray-500">
                                Distribution by status
                            </p>
                        </div>
                        <ShoppingBagIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <BarChart data={orderStatusDist} />
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-base font-semibold text-gray-900">
                                Payment Methods
                            </h3>
                            <p className="text-xs text-gray-500">
                                By transaction volume
                            </p>
                        </div>
                        <CurrencyRupeeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <BarChart data={paymentMethods} />
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-base font-semibold text-gray-900">
                                Categories
                            </h3>
                            <p className="text-xs text-gray-500">
                                Products by category
                            </p>
                        </div>
                        <ChartBarIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <BarChart data={categoryDistribution} />
                </div>
            </div>

            {/* Data Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TopProducts products={topProducts} />
                <RecentOrders orders={recentOrders} />
            </div>

            {/* Export */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
                <h3 className="text-base font-semibold text-gray-900 mb-4">
                    Export Reports
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                    Download your data as CSV files for external analysis
                </p>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <ExportActionCard
                        title="Sales Report"
                        description="Daily revenue trend with dates"
                        onClick={exportSalesReport}
                        loading={exporting === "sales"}
                        disabled={Boolean(exporting)}
                    />
                    <ExportActionCard
                        title="Orders Report"
                        description="Latest orders with customer and totals"
                        onClick={exportOrdersReport}
                        loading={exporting === "orders"}
                        disabled={Boolean(exporting)}
                    />
                    <ExportActionCard
                        title="Analytics Summary"
                        description="Snapshot of key KPIs in CSV"
                        onClick={exportAnalyticsSummary}
                        loading={exporting === "summary"}
                        disabled={Boolean(exporting)}
                    />
                </div>
            </div>
        </div>
    );
}
