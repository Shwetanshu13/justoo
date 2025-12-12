"use client";

import { Fragment } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Dialog, Transition } from "@headlessui/react";
import {
    HomeIcon,
    UsersIcon,
    CubeIcon,
    TruckIcon,
    DocumentTextIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    XMarkIcon,
    ShieldCheckIcon,
    SparklesIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/admin/contexts/AuthContext";
import Link from "next/link";

const navigation = [
    {
        name: "Dashboard",
        href: "/admin/dashboard",
        icon: HomeIcon,
        gradient: "from-blue-500 to-cyan-500",
    },
    {
        name: "Orders",
        href: "/admin/dashboard/orders",
        icon: DocumentTextIcon,
        gradient: "from-violet-500 to-purple-500",
    },
    {
        name: "Riders",
        href: "/admin/dashboard/riders",
        icon: TruckIcon,
        gradient: "from-orange-500 to-amber-500",
    },
    {
        name: "Admins",
        href: "/admin/dashboard/admins",
        icon: UsersIcon,
        gradient: "from-pink-500 to-rose-500",
        superAdminOnly: true,
    },
    {
        name: "Inventory Admins",
        href: "/admin/dashboard/inventory-admins",
        icon: ShieldCheckIcon,
        gradient: "from-teal-500 to-emerald-500",
        superAdminOnly: true,
    },
    {
        name: "Analytics",
        href: "/admin/dashboard/analytics",
        icon: ChartBarIcon,
        gradient: "from-indigo-500 to-blue-500",
    },
];

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
    const pathname = usePathname();
    const { user } = useAuth();

    // Filter navigation based on user role
    const filteredNavigation = navigation.filter((item) => {
        if (item.superAdminOnly && user?.role !== "superadmin") {
            return false;
        }
        return true;
    });

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-gradient-to-b from-white via-white to-gray-50/80 border-r border-gray-100">
            {/* Logo Section */}
            <div className="flex items-center h-16 flex-shrink-0 px-6 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-primary-600 via-primary-500 to-purple-600 rounded-xl shadow-lg shadow-primary-500/30">
                        <SparklesIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <span className="text-gray-900 text-lg font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
                            Justoo
                        </span>
                        <span className="text-xs font-medium text-primary-600 ml-1.5 px-1.5 py-0.5 bg-primary-50 rounded-md">
                            Admin
                        </span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 flex flex-col overflow-y-auto pt-6 pb-4">
                <nav className="flex-1 px-4 space-y-1.5">
                    {filteredNavigation.map((item) => {
                        const isActive =
                            pathname === item.href ||
                            pathname.startsWith(item.href + "/");
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={classNames(
                                    isActive
                                        ? "bg-gradient-to-r from-primary-50 to-purple-50 text-primary-700 shadow-sm border border-primary-100/50"
                                        : "text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-50 hover:text-gray-900 border border-transparent",
                                    "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                                )}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <div
                                    className={classNames(
                                        isActive
                                            ? `bg-gradient-to-br ${item.gradient} shadow-lg`
                                            : "bg-gray-100 group-hover:bg-gradient-to-br group-hover:" +
                                                  item.gradient,
                                        "p-2 rounded-lg mr-3 transition-all duration-200"
                                    )}
                                >
                                    <item.icon
                                        className={classNames(
                                            isActive
                                                ? "text-white"
                                                : "text-gray-500 group-hover:text-white",
                                            "flex-shrink-0 h-4 w-4 transition-colors duration-200"
                                        )}
                                        aria-hidden="true"
                                    />
                                </div>
                                <span className="font-medium">{item.name}</span>
                                {isActive && (
                                    <div className="ml-auto h-2 w-2 rounded-full bg-gradient-to-r from-primary-500 to-purple-500"></div>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* User Profile Card */}
            <div className="flex-shrink-0 border-t border-gray-100 p-4 bg-gradient-to-r from-gray-50 to-slate-50">
                <div className="flex items-center group w-full p-3 rounded-xl hover:bg-white hover:shadow-md transition-all duration-200 cursor-pointer">
                    <div className="inline-block h-10 w-10 rounded-xl overflow-hidden bg-gradient-to-br from-primary-500 to-purple-600 shadow-lg shadow-primary-500/25">
                        <div className="h-full w-full flex items-center justify-center text-white font-semibold text-sm">
                            {user?.username?.[0]?.toUpperCase()}
                        </div>
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                            {user?.username}
                        </p>
                        <p className="text-xs font-medium text-gray-500 capitalize flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                            {user?.role}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile sidebar */}
            <Transition.Root show={sidebarOpen} as={Fragment}>
                <Dialog
                    as="div"
                    className="relative z-40 md:hidden"
                    onClose={setSidebarOpen}
                >
                    <Transition.Child
                        as={Fragment}
                        enter="transition-opacity ease-linear duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity ease-linear duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 flex z-40">
                        <Transition.Child
                            as={Fragment}
                            enter="transition ease-in-out duration-300 transform"
                            enterFrom="-translate-x-full"
                            enterTo="translate-x-0"
                            leave="transition ease-in-out duration-300 transform"
                            leaveFrom="translate-x-0"
                            leaveTo="-translate-x-full"
                        >
                            <Dialog.Panel className="relative flex-1 flex flex-col max-w-xs w-full">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-in-out duration-300"
                                    enterFrom="opacity-0"
                                    enterTo="opacity-100"
                                    leave="ease-in-out duration-300"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                                        <button
                                            type="button"
                                            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
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
                                </Transition.Child>
                                <SidebarContent />
                            </Dialog.Panel>
                        </Transition.Child>
                        <div className="flex-shrink-0 w-14">
                            {/* Force sidebar to shrink to fit close icon */}
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>

            {/* Static sidebar for desktop */}
            <div className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0">
                <SidebarContent />
            </div>
        </>
    );
}
