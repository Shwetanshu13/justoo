"use client";

import { useAuth } from "@/admin/contexts/AuthContext";
import { useState, useEffect } from "react";
import {
    UsersIcon,
    ShoppingBagIcon,
    TruckIcon,
    CurrencyRupeeIcon,
    ChartBarIcon,
    ArrowUpIcon,
    ArrowDownIcon,
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
                backgroundColor: "#1f2937",
                titleColor: "#fff",
                bodyColor: "#d1d5db",
                borderColor: "#374151",
                borderWidth: 1,
                cornerRadius: 8,
                padding: 12,
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
                    color: "#f3f4f6",
                    drawBorder: false,
                },
                ticks: {
                    callback: (value) => "₹" + value.toLocaleString(),
                    font: {
                        family: "'Inter', sans-serif",
                        size: 11,
                    },
                    color: "#6b7280",
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
                    },
                    color: "#6b7280",
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
            duration: 500,
        },
    };

    const defaultData = {
        labels: [],
        datasets: [
            {
                label: "Revenue",
                data: [],
                backgroundColor: "#4f46e5",
                hoverBackgroundColor: "#4338ca",
                borderRadius: 4,
                barThickness: 24,
            },
        ],
    };

    return <Bar options={options} data={chartData || defaultData} />;
};

const StatsCard = ({ title, value, change, changeType, icon: Icon }) => {
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
                            <span className="ml-1.5 text-gray-400">
                                vs last period
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
    const [selectedRange, setSelectedRange] = useState("all");
    const [loading, setLoading] = useState(true);

    const ranges = [
        { key: "7d", label: "7 Days" },
        { key: "30d", label: "30 Days" },
        { key: "90d", label: "90 Days" },
        { key: "all", label: "All Time" },
    ];

    const filterTrend = (trend, range) => {
        if (!Array.isArray(trend)) return [];
        if (range === "all") return trend;

        const limitMap = { "7d": 7, "30d": 30, "90d": 90 };
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
                    hoverBackgroundColor: "#4338ca",
                    borderRadius: 4,
                    barThickness: 24,
                },
            ],
        };
    };

    useEffect(() => {
        setChartData(buildChartData(dailyTrend, selectedRange));
    }, [dailyTrend, selectedRange]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const resp = await adminAPI.getDashboardAnalytics();
            const payload = resp?.data?.data || {};

            setStats({
                totalOrders: payload?.orders?.totalOrders ?? 0,
                totalRevenue: payload?.orders?.revenue?.total ?? 0,
                activeRiders: payload?.users?.activeRiders ?? 0,
                inventoryAdmins: payload?.users?.inventoryAdminsCount ?? 0,
            });

            const dailyTrend = payload?.orders?.dailyTrend || [];
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
                <div className="h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="border-b border-gray-200 pb-5">
                <h1 className="text-2xl font-semibold text-gray-900">
                    Welcome back, {user?.username}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    Here's an overview of your business performance
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Orders"
                    value={stats.totalOrders.toLocaleString()}
                    icon={ShoppingBagIcon}
                />
                <StatsCard
                    title="Total Revenue"
                    value={`₹${stats.totalRevenue.toLocaleString()}`}
                    icon={CurrencyRupeeIcon}
                />
                <StatsCard
                    title="Active Riders"
                    value={stats.activeRiders.toString()}
                    icon={TruckIcon}
                />
                {user?.role === "superadmin" && (
                    <StatsCard
                        title="Inventory Admins"
                        value={stats.inventoryAdmins.toString()}
                        icon={UsersIcon}
                    />
                )}
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-lg border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 border-b border-gray-200">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">
                            Revenue Overview
                        </h2>
                        <p className="text-sm text-gray-500">
                            Track daily revenue performance
                        </p>
                    </div>
                    <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
                        {ranges.map((range) => (
                            <button
                                key={range.key}
                                onClick={() => setSelectedRange(range.key)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                    selectedRange === range.key
                                        ? "bg-white text-gray-900 shadow-sm"
                                        : "text-gray-600 hover:text-gray-900"
                                }`}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="p-5">
                    <div className="h-72">
                        <RevenueChart chartData={chartData} />
                    </div>
                </div>
            </div>
        </div>
    );
}
