"use client";

import { useAuth } from "@/admin/contexts/AuthContext";
import { useState, useEffect } from "react";
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
                        <Icon className="w-6 h-6" />
                    </div>
                </div>
                {change && (
                    <div className="mt-4 flex items-center text-sm">
                        <span
                            className={`flex items-center font-medium ${changeType === "increase"
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

const RecentActivity = ({ activities }) => {
    return (
        <div className="bg-white rounded-xl border border-gray-200 h-full">
            <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-base font-semibold leading-6 text-gray-900">
                    Recent Activity
                </h3>
            </div>
            <div className="px-6 py-6">
                <div className="flow-root">
                    <ul className="-mb-8">
                        {activities.map((activity, index) => (
                            <li key={activity.id}>
                                <div className="relative pb-8">
                                    {index !== activities.length - 1 && (
                                        <span
                                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                            aria-hidden="true"
                                        />
                                    )}
                                    <div className="relative flex space-x-3">
                                        <div>
                                            <span
                                                className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${activity.type === "order"
                                                        ? "bg-blue-500"
                                                        : activity.type ===
                                                            "admin"
                                                            ? "bg-indigo-500"
                                                            : activity.type ===
                                                                "rider"
                                                                ? "bg-purple-500"
                                                                : "bg-gray-500"
                                                    }`}
                                            >
                                                {activity.type === "order" && (
                                                    <ShoppingBagIcon className="w-4 h-4 text-white" />
                                                )}
                                                {activity.type === "admin" && (
                                                    <UsersIcon className="w-4 h-4 text-white" />
                                                )}
                                                {activity.type === "rider" && (
                                                    <TruckIcon className="w-4 h-4 text-white" />
                                                )}
                                            </span>
                                        </div>
                                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    {activity.description}
                                                </p>
                                            </div>
                                            <div className="text-right text-sm whitespace-nowrap text-gray-400">
                                                {activity.time}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
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
    const [activities, setActivities] = useState([]);
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);

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

            // Process chart data
            const dailyTrend = payload?.orders?.dailyTrend || [];
            const labels = dailyTrend.map((item) => {
                const date = new Date(item.date);
                return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                });
            });
            const revenueData = dailyTrend.map((item) => item.revenue);

            setChartData({
                labels: labels,
                datasets: [
                    {
                        label: "Revenue",
                        data: revenueData,
                        backgroundColor: "#4f46e5",
                        borderRadius: 4,
                        barThickness: 24,
                    },
                ],
            });

            setActivities(
                payload?.recentActivities ?? [
                    {
                        id: 1,
                        type: "order",
                        description: "New order #ORD-001 placed",
                        time: "2 minutes ago",
                    },
                    {
                        id: 2,
                        type: "admin",
                        description: "New inventory admin added",
                        time: "1 hour ago",
                    },
                    {
                        id: 3,
                        type: "rider",
                        description: "Rider John completed delivery",
                        time: "2 hours ago",
                    },
                    {
                        id: 4,
                        type: "order",
                        description: "Order #ORD-002 delivered",
                        time: "3 hours ago",
                    },
                ]
            );
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
                    change="+12%"
                    changeType="increase"
                    icon={ShoppingBagIcon}
                    color="blue"
                />
                <StatsCard
                    title="Total Revenue"
                    value={`₹${stats.totalRevenue.toLocaleString()}`}
                    change="+8%"
                    changeType="increase"
                    icon={CurrencyDollarIcon}
                    color="green"
                />
                <StatsCard
                    title="Active Riders"
                    value={stats.activeRiders}
                    change="+2"
                    changeType="increase"
                    icon={TruckIcon}
                    color="purple"
                />
                {user?.role === "superadmin" && (
                    <StatsCard
                        title="Inventory Admins"
                        value={stats.inventoryAdmins}
                        change="+1"
                        changeType="increase"
                        icon={UsersIcon}
                        color="orange"
                    />
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 h-full">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-base font-semibold leading-6 text-gray-900">
                                Revenue Overview
                            </h3>
                            <ChartBarIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="h-80 w-full">
                            <RevenueChart chartData={chartData} />
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <RecentActivity activities={activities} />
                </div>
            </div>
        </div>
    );
}
