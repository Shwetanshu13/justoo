"use client";

import { useAuth } from "@/admin/contexts/AuthContext";
import { useState, useEffect, useMemo } from "react";
import {
    UsersIcon,
    ShoppingBagIcon,
    TruckIcon,
    CurrencyDollarIcon,
    ChartBarIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";
import { adminAPI } from "@/admin/lib/api";
import toast from "react-hot-toast";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const RevenueChart = ({ chartData }) => {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: "#f3f4f6",
                },
                ticks: {
                    callback: (value) => "₹" + value,
                    font: {
                        family: "'Inter', sans-serif",
                        size: 11,
                    },
                    color: "#6b7280",
                },
                border: {
                    display: false,
                },
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: {
                        family: "'Inter', sans-serif",
                        size: 11,
                    },
                    color: "#6b7280",
                },
                border: {
                    display: false,
                },
            },
        },
    };

    const defaultData = {
        labels: [],
        datasets: [
            {
                label: "Revenue",
                data: [],
                backgroundColor: "#4f46e5",
                borderRadius: 4,
                barThickness: 24,
            },
        ],
    };

    return <Bar options={options} data={chartData || defaultData} />;
};

const StatsCard = ({
    title,
    value,
    change,
    changeType,
    icon: Icon,
    color = "blue",
}) => {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        purple: "bg-purple-50 text-purple-600",
        orange: "bg-orange-50 text-orange-600",
    };

    // Fallback in case an icon isn't provided to avoid runtime element type errors
    const ResolvedIcon = Icon || CurrencyDollarIcon;

    return (
        <div className="bg-white overflow-hidden rounded-xl border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="p-5">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 truncate">
                            {title}
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-gray-900">
                            {value}
                        </p>
                    </div>
                    <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                        <ResolvedIcon className="w-6 h-6" />
                    </div>
                </div>
                {change && (
                    <div className="mt-4 flex items-center text-sm">
                        <span
                            className={`flex items-center font-medium ${
                                changeType === "increase"
                                    ? "text-green-600"
                                    : "text-red-600"
                            }`}
                        >
                            {changeType === "increase" ? (
                                <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                            ) : (
                                <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
                            )}
                            {change}
                        </span>
                        <span className="ml-2 text-gray-400">
                            vs last month
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        activeRiders: 0,
        inventoryAdmins: 0,
    });
    const [dailyTrend, setDailyTrend] = useState([]);
    const [chartData, setChartData] = useState(null);
    const [chartSummary, setChartSummary] = useState({
        totalRevenue: 0,
        averageRevenue: 0,
        days: 0,
    });
    // Default to all to ensure older months (e.g., September) are visible immediately
    const [selectedRange, setSelectedRange] = useState("all");
    const [loading, setLoading] = useState(true);

    const ranges = [
        { key: "7d", label: "7D" },
        { key: "30d", label: "30D" },
        { key: "90d", label: "90D" },
        { key: "all", label: "All" },
    ];

    const filterTrend = (trend, range) => {
        if (!Array.isArray(trend)) return [];
        if (range === "all") return trend;

        const limitMap = {
            "7d": 7,
            "30d": 30,
            "90d": 90,
        };
        const limit = limitMap[range] || trend.length;
        return trend.slice(-limit);
    };

    const buildChartData = (trend, range) => {
        const filtered = filterTrend(trend, range);
        const labels = filtered.map((item) => {
            const date = new Date(item.date);
            return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            });
        });
        const revenueData = filtered.map((item) => Number(item.revenue) || 0);

        return {
            labels,
            datasets: [
                {
                    label: "Revenue",
                    data: revenueData,
                    backgroundColor: "#4f46e5",
                    borderRadius: 4,
                    barThickness: 24,
                },
            ],
        };
    };

    const buildChartSummary = (trend, range) => {
        const filtered = filterTrend(trend, range);
        const totalRevenue = filtered.reduce(
            (sum, item) => sum + (Number(item.revenue) || 0),
            0
        );
        const days = filtered.length || 0;
        return {
            totalRevenue,
            averageRevenue: days ? totalRevenue / days : 0,
            days,
        };
    };

    useEffect(() => {
        setChartData(buildChartData(dailyTrend, selectedRange));
        setChartSummary(buildChartSummary(dailyTrend, selectedRange));
    }, [dailyTrend, selectedRange]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const resp = await adminAPI.getDashboardAnalytics();
            const payload = resp?.data?.data || {};
            // Map expected stats from dashboard payload if available
            setStats({
                totalOrders: payload?.orders?.totalOrders ?? 0,
                totalRevenue: payload?.orders?.revenue?.total ?? 0,
                activeRiders: payload?.users?.activeRiders ?? 0,
                inventoryAdmins: payload?.users?.inventoryAdminsCount ?? 0,
            });

            // Store trend for chart usage
            const dailyTrend = payload?.orders?.dailyTrend || [];
            // Sort by date ascending to ensure full history (e.g., September) appears correctly
            const sortedTrend = [...dailyTrend].sort(
                (a, b) => new Date(a.date) - new Date(b.date)
            );
            setDailyTrend(sortedTrend);
        } catch (err) {
            console.error("Dashboard data fetch error:", err);
            toast.error("Failed to load dashboard data");
            // Keep dummy data for fallback if needed, or just empty
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">
                    Welcome back, {user?.username}!
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    Here's what's happening with your business today.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <StatsCard
                    title="Total Orders"
                    value={stats.totalOrders.toLocaleString()}
                    color="blue"
                    icon={ShoppingBagIcon}
                />
                <StatsCard
                    title="Total Revenue"
                    value={`₹${stats.totalRevenue.toLocaleString()}`}
                    color="green"
                    icon={CurrencyDollarIcon}
                />
                <StatsCard
                    title="Active Riders"
                    value={stats.activeRiders}
                    color="purple"
                    icon={TruckIcon}
                />
                {user?.role === "superadmin" && (
                    <StatsCard
                        title="Inventory Admins"
                        value={stats.inventoryAdmins}
                        color="orange"
                        icon={UsersIcon}
                    />
                )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 h-full">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div>
                        <h3 className="text-base font-semibold leading-6 text-gray-900">
                            Revenue Overview
                        </h3>
                        <p className="text-sm text-gray-500">
                            Track daily revenue performance.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {ranges.map((range) => (
                            <button
                                key={range.key}
                                onClick={() => setSelectedRange(range.key)}
                                className={`rounded-lg px-3 py-1.5 text-sm font-medium border transition ${
                                    selectedRange === range.key
                                        ? "border-blue-200 bg-blue-50 text-blue-700"
                                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                }`}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-80 w-full">
                    <RevenueChart chartData={chartData} />
                </div>
            </div>
        </div>
    );
}
