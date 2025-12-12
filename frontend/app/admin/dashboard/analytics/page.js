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
    CalendarDaysIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    BanknotesIcon,
} from "@heroicons/react/24/outline";

const MetricCard = ({ title, value, icon: Icon, color = "blue" }) => {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        purple: "bg-purple-50 text-purple-600",
        orange: "bg-orange-50 text-orange-600",
        red: "bg-red-50 text-red-600",
    };

    return (
        <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <div
                            className={`w-8 h-8 rounded-md flex items-center justify-center ${colorClasses[color]}`}
                        >
                            <Icon className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                                {title}
                            </dt>
                            <dd className="flex items-baseline">
                                <div className="text-2xl font-semibold text-gray-900">
                                    {value}
                                </div>
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SparkLineChart = ({ data = [], color = "#4f46e5" }) => {
    if (!data.length) {
        return <div className="text-sm text-gray-500">No data</div>;
    }

    const values = data.map((d) => Number(d.value) || 0);
    const maxVal = Math.max(...values, 1);
    const points = data.map((d, i) => {
        const x = (i / Math.max(data.length - 1, 1)) * 100;
        const y = 100 - (Number(d.value) / maxVal) * 100;
        return `${x},${y}`;
    });

    return (
        <svg viewBox="0 0 100 100" className="w-full h-40">
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                points={points.join(" ")}
                strokeLinecap="round"
            />
            {data.map((d, i) => {
                const x = (i / Math.max(data.length - 1, 1)) * 100;
                const y = 100 - (Number(d.value) / maxVal) * 100;
                return <circle key={i} cx={x} cy={y} r="1.8" fill={color} />;
            })}
        </svg>
    );
};

const BarChart = ({ data = [], color = "#6366f1" }) => {
    if (!data.length) {
        return <div className="text-sm text-gray-500">No data</div>;
    }
    const maxVal = Math.max(...data.map((d) => Number(d.value) || 0), 1);
    return (
        <div className="space-y-3">
            {data.map((d) => {
                const width = (Number(d.value) / maxVal) * 100;
                return (
                    <div key={d.label}>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span className="font-medium text-gray-800">
                                {d.label}
                            </span>
                            <span>{d.value}</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full">
                            <div
                                className="h-2 rounded-full"
                                style={{
                                    width: `${width}%`,
                                    backgroundColor: color,
                                }}
                            ></div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const TopProducts = ({ products }) => {
    return (
        <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Top Selling Products
                </h3>
                <div className="space-y-3">
                    {products.map((product, index) => (
                        <div
                            key={product.id}
                            className="flex items-center justify-between"
                        >
                            <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-md flex items-center justify-center">
                                    <span className="text-sm font-medium text-gray-600">
                                        {index + 1}
                                    </span>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">
                                        {product.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {product.category}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">
                                    ₹{product.revenue}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {product.sales} sold
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const RecentOrders = ({ orders }) => {
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "delivered":
                return "bg-green-100 text-green-800";
            case "out_for_delivery":
                return "bg-blue-100 text-blue-800";
            case "preparing":
                return "bg-yellow-100 text-yellow-800";
            case "cancelled":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Recent Orders
                </h3>
                <div className="space-y-3">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                        >
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <ShoppingBagIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">
                                        {order.order_id}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {order.customer_name}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">
                                    ₹{order.total_amount}
                                </p>
                                <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
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
        </div>
    );
};

export default function AnalyticsPage() {
    const [analytics, setAnalytics] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        activeRiders: 0,
        totalCustomers: 0,
        conversionRate: 0,
        revenueChange: 0,
    });
    const [topProducts, setTopProducts] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [revenueTrend, setRevenueTrend] = useState([]);
    const [orderStatusDist, setOrderStatusDist] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [categoryDistribution, setCategoryDistribution] = useState([]);
    const [dateRange, setDateRange] = useState("30"); // days
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);

            const [dashboardRes, ordersRes] = await Promise.all([
                api.get(`/analytics/dashboard?days=${dateRange}`),
                api.get("/orders", { params: { limit: 5, sortOrder: "desc" } }),
            ]);

            const dashboardData =
                dashboardRes.data?.data || dashboardRes.data || {};

            // Guard against missing orders block
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
            const errorMessage =
                error.response?.data?.message ||
                "Failed to fetch analytics data";
            toast.error(errorMessage);

            setAnalytics({
                totalRevenue: 0,
                totalOrders: 0,
                averageOrderValue: 0,
                activeRiders: 0,
                totalCustomers: 0,
                conversionRate: 0,
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="md:flex md:items-center md:justify-between mb-6">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Analytics & Reports
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Comprehensive business analytics and performance metrics
                    </p>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="block px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 90 days</option>
                        <option value="365">Last year</option>
                    </select>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
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
                    color="green"
                />
                <MetricCard
                    title="Total Orders"
                    value={analytics.totalOrders.toLocaleString()}
                    change={null}
                    changeType="increase"
                    icon={ShoppingBagIcon}
                    color="blue"
                />
                <MetricCard
                    title="Average Order Value"
                    value={`₹${analytics.averageOrderValue.toFixed(2)}`}
                    change={null}
                    changeType="increase"
                    icon={ChartBarIcon}
                    color="purple"
                />
                <MetricCard
                    title="Active Riders"
                    value={analytics.activeRiders}
                    change={null}
                    changeType="increase"
                    icon={TruckIcon}
                    color="orange"
                />
                <MetricCard
                    title="Total Customers"
                    value={analytics.totalCustomers}
                    change={null}
                    changeType="increase"
                    icon={UsersIcon}
                    color="blue"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Revenue Trends
                            </h3>
                            <p className="text-sm text-gray-500">
                                Delivered order revenue over time
                            </p>
                        </div>
                        <CurrencyRupeeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <SparkLineChart data={revenueTrend} color="#4f46e5" />
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Order Status
                            </h3>
                            <p className="text-sm text-gray-500">
                                Distribution of orders by status
                            </p>
                        </div>
                        <ShoppingBagIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <BarChart data={orderStatusDist} color="#22c55e" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Payment Mix
                            </h3>
                            <p className="text-sm text-gray-500">
                                Completed payments by method
                            </p>
                        </div>
                        <BanknotesIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <BarChart data={paymentMethods} color="#f59e0b" />
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Product Performance
                            </h3>
                            <p className="text-sm text-gray-500">
                                Items by category
                            </p>
                        </div>
                        <ChartBarIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <BarChart data={categoryDistribution} color="#3b82f6" />
                </div>
            </div>

            {/* Data Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TopProducts products={topProducts} />
                <RecentOrders orders={recentOrders} />
            </div>

            {/* Export Options */}
            <div className="mt-8 bg-white shadow rounded-lg p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Export Reports
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <ChartBarIcon className="h-4 w-4 mr-2" />
                        Sales Report (PDF)
                    </button>
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <ShoppingBagIcon className="h-4 w-4 mr-2" />
                        Orders Report (CSV)
                    </button>
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <UsersIcon className="h-4 w-4 mr-2" />
                        Customer Report (Excel)
                    </button>
                </div>
            </div>
        </div>
    );
}
