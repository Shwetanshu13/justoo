"use client";

import { Fragment } from "react";
import {
    Dialog,
    DialogPanel,
    Transition,
    TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
    HomeIcon,
    CubeIcon,
    ShoppingCartIcon,
    ChartBarIcon,
    UserIcon,
    Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useAuth } from "@/inventory/contexts/AuthContext";

const navigation = [
    {
        name: "Overview",
        href: "/inventory/dashboard",
        icon: HomeIcon,
        description: "Pulse of your operations",
    },
    {
        name: "Inventory",
        href: "/inventory/dashboard/inventory",
        icon: CubeIcon,
        description: "Items, pricing & stock",
    },
    {
        name: "Orders",
        href: "/inventory/dashboard/orders",
        icon: ShoppingCartIcon,
        description: "Recent fulfillment activity",
    },
    {
        name: "Reports",
        href: "/inventory/dashboard/reports",
        icon: ChartBarIcon,
        description: "Insights & analytics",
    },
];

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

export default function Sidebar({ sidebarOpen, setSidebarOpen, currentPath }) {
    const { user } = useAuth();
    const isActiveRoute = (href) => {
        if (!currentPath) return false;
        if (href === "/inventory/dashboard") {
            return currentPath === "/inventory/dashboard";
        }
        return currentPath.startsWith(href);
    };

    const SidebarContent = () => (
        <div className="flex grow flex-col gap-y-6 overflow-y-auto bg-white/80 px-6 pb-6 pt-8 backdrop-blur-2xl shadow-[0_20px_60px_rgba(15,23,42,0.15)]">
            <div className="flex items-center justify-between">
                <Link
                    href="/inventory/dashboard"
                    className="flex items-center gap-3"
                    onClick={() => setSidebarOpen(false)}
                >
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg">
                        <CubeIcon className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                            Justoo
                        </p>
                        <p className="text-lg font-semibold text-gray-900">
                            Inventory OS
                        </p>
                    </div>
                </Link>
                <span className="gradient-chip text-xs">v2.0</span>
            </div>

            <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col">
                    <li>
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                            Navigation
                        </p>
                        <ul role="list" className="space-y-2">
                            {navigation.map((item) => {
                                const active = isActiveRoute(item.href);
                                return (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            className={classNames(
                                                "group relative block rounded-xl border border-transparent px-3 py-3 transition-all duration-200",
                                                active
                                                    ? "bg-blue-50 text-blue-700"
                                                    : "hover:bg-slate-50 text-slate-600"
                                            )}
                                            onClick={() =>
                                                setSidebarOpen(false)
                                            }
                                        >
                                            <div className="flex items-start gap-3">
                                                <div
                                                    className={classNames(
                                                        "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                                                        active
                                                            ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                                                            : "bg-white border border-slate-200 text-slate-400 group-hover:border-blue-200 group-hover:text-blue-500"
                                                    )}
                                                >
                                                    <item.icon
                                                        className="h-5 w-5"
                                                        aria-hidden="true"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <p
                                                        className={classNames(
                                                            "text-sm font-semibold",
                                                            active
                                                                ? "text-slate-900"
                                                                : "text-slate-600"
                                                        )}
                                                    >
                                                        {item.name}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </li>

                    <li className="mt-auto">
                        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                                {user?.username?.charAt(0)?.toUpperCase() || (
                                    <UserIcon className="h-4 w-4" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">
                                    {user?.username}
                                </p>
                                <p className="text-xs text-slate-500 capitalize truncate">
                                    {user?.role}
                                </p>
                            </div>
                        </div>
                    </li>
                </ul>
            </nav>
        </div>
    );

    return (
        <>
            {/* Mobile sidebar */}
            <Transition show={sidebarOpen} as={Fragment}>
                <Dialog
                    className="relative z-50 lg:hidden"
                    onClose={setSidebarOpen}
                >
                    <TransitionChild
                        as={Fragment}
                        enter="transition-opacity ease-linear duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity ease-linear duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-900/80" />
                    </TransitionChild>

                    <div className="fixed inset-0 flex">
                        <TransitionChild
                            as={Fragment}
                            enter="transition ease-in-out duration-300 transform"
                            enterFrom="-translate-x-full"
                            enterTo="translate-x-0"
                            leave="transition ease-in-out duration-300 transform"
                            leaveFrom="translate-x-0"
                            leaveTo="-translate-x-full"
                        >
                            <DialogPanel className="relative mr-16 flex w-full max-w-xs flex-1">
                                <TransitionChild
                                    as={Fragment}
                                    enter="ease-in-out duration-300"
                                    enterFrom="opacity-0"
                                    enterTo="opacity-100"
                                    leave="ease-in-out duration-300"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                                        <button
                                            type="button"
                                            className="-m-2.5 p-2.5"
                                            onClick={() =>
                                                setSidebarOpen(false)
                                            }
                                        >
                                            <span className="sr-only">
                                                Close sidebar
                                            </span>
                                            <XMarkIcon
                                                className="h-6 w-6 text-white"
                                                aria-hidden="true"
                                            />
                                        </button>
                                    </div>
                                </TransitionChild>
                                <SidebarContent />
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </Dialog>
            </Transition>

            {/* Static sidebar for desktop */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
                <SidebarContent />
            </div>
        </>
    );
}
