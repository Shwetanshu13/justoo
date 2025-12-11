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
} from "@heroicons/react/24/outline";
import { useAuth } from "@/admin/contexts/AuthContext";
import Link from "next/link";

const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: HomeIcon },
    { name: "Orders", href: "/admin/dashboard/orders", icon: DocumentTextIcon },
    { name: "Riders", href: "/admin/dashboard/riders", icon: TruckIcon },
    {
        name: "Admins",
        href: "/admin/dashboard/admins",
        icon: UsersIcon,
        superAdminOnly: true,
    },
    {
        name: "Inventory Admins",
        href: "/admin/dashboard/inventory-admins",
        icon: ShieldCheckIcon,
        superAdminOnly: true,
    },
    { name: "Analytics", href: "/admin/dashboard/analytics", icon: ChartBarIcon },
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
        <div className="flex flex-col h-full bg-white border-r border-gray-200">
            <div className="flex items-center h-16 flex-shrink-0 px-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-primary-600 rounded-lg">
                        <ShieldCheckIcon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-gray-900 text-lg font-bold tracking-tight">
                        Justoo Admin
                    </span>
                </div>
            </div>

            <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
                <nav className="mt-2 flex-1 px-3 space-y-1">
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
                                        ? "bg-primary-50 text-primary-600"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                                    "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200"
                                )}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <item.icon
                                    className={classNames(
                                        isActive
                                            ? "text-primary-600"
                                            : "text-gray-400 group-hover:text-gray-500",
                                        "mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200"
                                    )}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="flex-shrink-0 border-t border-gray-200 p-4">
                <div className="flex items-center group w-full">
                    <div className="inline-block h-9 w-9 rounded-full overflow-hidden bg-gray-100">
                        <div className="h-full w-full flex items-center justify-center bg-primary-100 text-primary-600 font-medium">
                            {user?.username?.[0]?.toUpperCase()}
                        </div>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                            {user?.username}
                        </p>
                        <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700 capitalize">
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
