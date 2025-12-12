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
            tooltip: {
                backgroundColor: "rgba(17, 24, 39, 0.95)",
                titleColor: "#fff",
                bodyColor: "#e5e7eb",
                borderColor: "rgba(99, 102, 241, 0.3)",
                borderWidth: 1,
                cornerRadius: 12,
                padding: 14,
                titleFont: {
                    family: "'Inter', sans-serif",
                    size: 13,
                    weight: "600",
                },
                bodyFont: {
                    family: "'Inter', sans-serif",
                    size: 12,
                },
                displayColors: false,
                callbacks: {
                    label: (context) =>
                        `Revenue: ₹${context.parsed.y.toLocaleString()}`,
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: "rgba(148, 163, 184, 0.1)",
                    drawBorder: false,
                },
                ticks: {
                    callback: (value) => "₹" + value.toLocaleString(),
                    font: {
                        family: "'Inter', sans-serif",
                        size: 11,
                        weight: "500",
                    },
                    color: "#94a3b8",
                    padding: 8,
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
                        weight: "500",
                    },
                    color: "#94a3b8",
                    padding: 4,
                },
                border: {
                    display: false,
                },
            },
        },
        interaction: {
            intersect: false,
            mode: "index",
        },
        animation: {
            duration: 750,
            easing: "easeInOutQuart",
        },
    };

    const defaultData = {
        labels: [],
        datasets: [
            {
                label: "Revenue",
                data: [],
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                    gradient.addColorStop(0, "rgba(99, 102, 241, 0.9)");
                    gradient.addColorStop(1, "rgba(139, 92, 246, 0.6)");
                    return gradient;
                },
                hoverBackgroundColor: "rgba(99, 102, 241, 1)",
                borderRadius: 8,
                barThickness: 28,
                borderSkipped: false,
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
    const colorConfig = {
        blue: {
            bg: "bg-gradient-to-br from-blue-500 to-cyan-500",
            iconBg: "bg-white/20",
            shadow: "shadow-blue-500/25",
        },
        green: {
            bg: "bg-gradient-to-br from-emerald-500 to-teal-500",
            iconBg: "bg-white/20",
            shadow: "shadow-emerald-500/25",
        },
        purple: {
            bg: "bg-gradient-to-br from-violet-500 to-purple-600",
            iconBg: "bg-white/20",
            shadow: "shadow-violet-500/25",
        },
        orange: {
            bg: "bg-gradient-to-br from-orange-500 to-amber-500",
            iconBg: "bg-white/20",
            shadow: "shadow-orange-500/25",
        },
    };

    const config = colorConfig[color] || colorConfig.blue;
    const ResolvedIcon = Icon || CurrencyDollarIcon;

    return (
        <div
            className={`relative overflow-hidden rounded-2xl ${config.bg} ${config.shadow} shadow-xl p-6 text-white transform hover:scale-[1.02] hover:shadow-2xl transition-all duration-300`}
        >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-20 w-20 rounded-full bg-white/10 blur-xl"></div>

            <div className="relative">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-white/80 truncate">
                            {title}
                        </p>
                        <p className="mt-2 text-3xl font-bold text-white">
                            {value}
                        </p>
                    </div>
                    <div
                        className={`p-3 rounded-xl ${config.iconBg} backdrop-blur-sm`}
                    >
                        <ResolvedIcon className="w-7 h-7 text-white" />
                    </div>
                </div>
                {change && (
                    <div className="mt-4 flex items-center text-sm">
                        <span
                            className={`flex items-center font-semibold px-2 py-1 rounded-lg ${
                                changeType === "increase"
                                    ? "bg-white/20 text-white"
                                    : "bg-red-400/30 text-white"
                            }`}
                        >
                            {changeType === "increase" ? (
                                <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                            ) : (
                                <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
                            )}
                            {change}
                        </span>
                        <span className="ml-2 text-white/70 text-xs">
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
                    backgroundColor: (context) => {
                        const ctx = context.chart.ctx;
                        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                        gradient.addColorStop(0, "rgba(99, 102, 241, 0.9)");
                        gradient.addColorStop(1, "rgba(139, 92, 246, 0.6)");
                        return gradient;
                    },
                    hoverBackgroundColor: "rgba(99, 102, 241, 1)",
                    borderRadius: 8,
                    barThickness: 28,
                    borderSkipped: false,
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
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="relative">
                    <div
                        className="h-12 w-12 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 animate-spin"
                        style={{
                            maskImage:
                                "conic-gradient(transparent 120deg, black)",
                            WebkitMaskImage:
                                "conic-gradient(transparent 120deg, black)",
                        }}
                    />
                    <div className="absolute inset-1 rounded-full bg-white" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-purple-600 to-pink-500 p-8 text-white shadow-xl shadow-primary-500/20">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
                <div className="relative">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">👋</span>
                        <h1 className="text-2xl font-bold">
                            Welcome back, {user?.username}!
                        </h1>
                    </div>
                    <p className="text-white/80 max-w-xl">
                        Here's what's happening with your business today. Track
                        your metrics and manage your operations.
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

            {/* Revenue Chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-slate-50">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <ChartBarIcon className="h-5 w-5 text-primary-500" />
                            Revenue Overview
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Track daily revenue performance across time periods.
                        </p>
                    </div>
                    <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
                        {ranges.map((range) => (
                            <button
                                key={range.key}
                                onClick={() => setSelectedRange(range.key)}
                                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                                    selectedRange === range.key
                                        ? "bg-white text-primary-700 shadow-sm"
                                        : "text-gray-600 hover:text-gray-900"
                                }`}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6">
                    <div className="h-80 w-full">
                        <RevenueChart chartData={chartData} />
                    </div>
                </div>
            </div>
        </div>
    );
}
