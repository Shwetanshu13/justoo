"use client";

import { useState, useEffect, useMemo } from "react";
import {
    Bars3Icon,
    BellIcon,
    UserIcon,
    BoltIcon,
    CubeIcon,
    ChartBarIcon,
    ShoppingCartIcon,
    ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { usePathname } from "next/navigation";
import { inventoryAPI } from "@/lib/api";

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

export default function Header({ setSidebarOpen, user }) {
    const { logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await inventoryAPI.getNotifications();
                setNotifications(response.data.data);
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            }
        };
        fetchNotifications();
    }, []);

    const pageTitle = useMemo(() => {
        if (!pathname) return "Inventory Management System";
        if (pathname === "/dashboard") return "Command Center";
        if (pathname.startsWith("/dashboard/inventory"))
            return "Inventory Workspace";
        if (pathname.startsWith("/dashboard/orders"))
            return "Orders & Fulfillment";
        if (pathname.startsWith("/dashboard/reports"))
            return "Insights & Analytics";
        return "Inventory Management System";
    }, [pathname]);

    const handleLogout = async () => {
        try {
            await logout();
            toast.success("Logged out successfully");
            router.push("/login");
        } catch (error) {
            toast.error("Logout failed");
        }
    };

    const quickActions = [
        {
            name: "Add Item",
            href: "/dashboard/inventory/add",
            icon: CubeIcon,
        },
        {
            name: "View Orders",
            href: "/dashboard/orders",
            icon: ShoppingCartIcon,
        },
        {
            name: "Reports",
            href: "/dashboard/reports",
            icon: ChartBarIcon,
        },
    ];

    return (
        <div className="sticky top-0 z-40 flex h-20 shrink-0 items-center gap-x-4 border-b border-white/50 bg-white/90 px-4 shadow-[0_20px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:gap-x-6 sm:px-6 lg:px-10">
            <button
                type="button"
                className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
                onClick={() => setSidebarOpen(true)}
            >
                <span className="sr-only">Open sidebar</span>
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Separator */}
            <div
                className="h-6 w-px bg-gray-200 lg:hidden"
                aria-hidden="true"
            />

            <div className="flex flex-1 items-center justify-between gap-x-4 self-stretch lg:gap-x-6">
                <div className="flex flex-col justify-center">
                    <h1 className="text-2xl font-semibold leading-tight text-slate-900">
                        {pageTitle}
                    </h1>
                </div>
                <div className="flex items-center gap-x-4 lg:gap-x-6">
                    <Menu as="div" className="relative">
                        <MenuButton className="relative flex items-center gap-2 rounded-2xl border border-blue-100 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:border-blue-200 outline-none">
                            <BoltIcon className="h-5 w-5 text-blue-500" />
                            Quick Actions
                            <span className="absolute -right-1 -top-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">
                                {quickActions.length}
                            </span>
                        </MenuButton>
                        <MenuItems
                            transition
                            className="absolute right-0 z-10 mt-2.5 w-56 origin-top-right rounded-xl bg-white py-2 shadow-lg ring-1 ring-gray-900/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                        >
                            {quickActions.map((item) => (
                                <MenuItem key={item.name}>
                                    <button
                                        onClick={() => router.push(item.href)}
                                        className="group flex w-full items-center gap-x-3 px-3 py-2 text-sm font-semibold leading-6 text-gray-900 data-[focus]:bg-gray-50"
                                    >
                                        <item.icon
                                            className="h-5 w-5 flex-none text-gray-400 group-data-[focus]:text-blue-600"
                                            aria-hidden="true"
                                        />
                                        {item.name}
                                    </button>
                                </MenuItem>
                            ))}
                        </MenuItems>
                    </Menu>
                    <Menu as="div" className="relative">
                        <MenuButton className="relative rounded-2xl border border-slate-200 bg-white p-2 text-gray-400 hover:text-gray-500 outline-none">
                            <span className="sr-only">View notifications</span>
                            <BellIcon className="h-6 w-6" aria-hidden="true" />
                            {notifications.length > 0 && (
                                <span className="absolute -right-1 -top-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] text-white">
                                    {notifications.length}
                                </span>
                            )}
                        </MenuButton>
                        <MenuItems
                            transition
                            className="absolute right-0 z-10 mt-2.5 w-80 origin-top-right rounded-xl bg-white py-2 shadow-lg ring-1 ring-gray-900/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                        >
                            <div className="px-4 py-2 border-b border-gray-100">
                                <h3 className="text-sm font-semibold text-gray-900">
                                    Notifications
                                </h3>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="px-4 py-6 text-center text-sm text-gray-500">
                                        No new notifications
                                    </div>
                                ) : (
                                    notifications.map((notification) => (
                                        <MenuItem key={notification.id}>
                                            <button
                                                onClick={() =>
                                                    router.push(
                                                        notification.link
                                                    )
                                                }
                                                className="group flex w-full items-start gap-x-3 px-4 py-3 text-left hover:bg-gray-50"
                                            >
                                                <div
                                                    className={`mt-1 flex-none rounded-full p-1 ${
                                                        notification.type ===
                                                        "critical"
                                                            ? "bg-rose-50 text-rose-600"
                                                            : "bg-amber-50 text-amber-600"
                                                    }`}
                                                >
                                                    <ExclamationTriangleIcon className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {notification.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {notification.message}
                                                    </p>
                                                </div>
                                            </button>
                                        </MenuItem>
                                    ))
                                )}
                            </div>
                        </MenuItems>
                    </Menu>
                    <div
                        className="hidden lg:block lg:h-8 lg:w-px lg:bg-slate-200/80"
                        aria-hidden="true"
                    />
                    <button
                        onClick={handleLogout}
                        className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-900/10 hover:bg-slate-50"
                    >
                        Sign out
                    </button>
                </div>
            </div>
        </div>
    );
}
