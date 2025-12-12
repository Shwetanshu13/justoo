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
import { useAuth } from "@/inventory/contexts/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { usePathname } from "next/navigation";
import { inventoryAPI } from "@/inventory/lib/api";

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

export default function Header({ setSidebarOpen, user }) {
    const { logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const pageTitle = useMemo(() => {
        if (!pathname) return "Inventory Management System";
        if (pathname === "/inventory/dashboard") return "Command Center";
        if (pathname.startsWith("/inventory/dashboard/inventory"))
            return "Inventory Workspace";
        if (pathname.startsWith("/inventory/dashboard/orders"))
            return "Orders & Fulfillment";
        if (pathname.startsWith("/inventory/dashboard/reports"))
            return "Insights & Analytics";
        return "Inventory Management System";
    }, [pathname]);

    const handleLogout = async () => {
        try {
            await logout();
            toast.success("Logged out successfully");
            router.push("/inventory/login");
        } catch (error) {
            toast.error("Logout failed");
        }
    };

    const quickActions = [
        {
            name: "Add Item",
            href: "/inventory/dashboard/inventory/add",
            icon: CubeIcon,
        },
        {
            name: "View Orders",
            href: "/inventory/dashboard/orders",
            icon: ShoppingCartIcon,
        },
        {
            name: "Reports",
            href: "/inventory/dashboard/reports",
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
