"use client";

import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import {
    Bars3Icon,
    BellIcon,
    ChevronDownIcon,
    UserCircleIcon,
    ArrowRightOnRectangleIcon,
    SparklesIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/admin/contexts/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

export default function Header({ setSidebarOpen }) {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await logout();
            toast.success("Logged out successfully");
            router.push("/admin/login");
        } catch (error) {
            toast.error("Logout failed");
        }
    };

    return (
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
            <button
                type="button"
                className="px-4 border-r border-gray-100 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden transition-colors duration-200"
                onClick={() => setSidebarOpen(true)}
            >
                <span className="sr-only">Open sidebar</span>
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>

            <div className="flex-1 px-4 flex justify-between items-center">
                {/* Welcome message - visible on larger screens */}
                <div className="hidden sm:flex items-center gap-2">
                    <SparklesIcon className="h-5 w-5 text-primary-500" />
                    <span className="text-sm text-gray-500">
                        Welcome back,{" "}
                        <span className="font-semibold text-gray-900">
                            {user?.username}
                        </span>
                    </span>
                </div>

                <div className="flex items-center gap-3 ml-auto">
                    {/* Notification bell with modern styling */}
                    <button className="relative p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200">
                        <BellIcon className="h-5 w-5" />
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-gradient-to-r from-red-500 to-rose-500 ring-2 ring-white"></span>
                    </button>

                    {/* Profile dropdown */}
                    <Menu as="div" className="relative">
                        <div>
                            <Menu.Button className="flex items-center gap-3 p-1.5 pr-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/50 hover:from-gray-100 hover:to-gray-50 border border-gray-200/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-primary-500/25">
                                    {user?.username?.[0]?.toUpperCase()}
                                </div>
                                <div className="hidden sm:block text-left">
                                    <p className="text-sm font-medium text-gray-900">
                                        {user?.username}
                                    </p>
                                    <p className="text-xs text-gray-500 capitalize">
                                        {user?.role}
                                    </p>
                                </div>
                                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                            </Menu.Button>
                        </div>

                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-200"
                            enterFrom="transform opacity-0 scale-95 translate-y-1"
                            enterTo="transform opacity-100 scale-100 translate-y-0"
                            leave="transition ease-in duration-150"
                            leaveFrom="transform opacity-100 scale-100 translate-y-0"
                            leaveTo="transform opacity-0 scale-95 translate-y-1"
                        >
                            <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-2xl shadow-xl shadow-gray-200/50 py-2 bg-white ring-1 ring-gray-100 focus:outline-none overflow-hidden">
                                <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-100">
                                    <p className="text-sm text-gray-900 font-semibold">
                                        {user?.username}
                                    </p>
                                    <p className="text-xs text-gray-500 capitalize mt-0.5 flex items-center gap-1">
                                        <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                                        {user?.role}
                                    </p>
                                </div>

                                <div className="py-1 px-1">
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={() =>
                                                    router.push(
                                                        "/admin/dashboard/profile"
                                                    )
                                                }
                                                className={classNames(
                                                    active
                                                        ? "bg-gradient-to-r from-primary-50 to-purple-50 text-gray-900"
                                                        : "text-gray-700",
                                                    "group flex w-full items-center px-3 py-2.5 text-sm rounded-xl transition-all duration-200"
                                                )}
                                            >
                                                <UserCircleIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                                                Your Profile
                                            </button>
                                        )}
                                    </Menu.Item>

                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={handleLogout}
                                                className={classNames(
                                                    active
                                                        ? "bg-gradient-to-r from-red-50 to-rose-50 text-red-700"
                                                        : "text-gray-700",
                                                    "group flex w-full items-center px-3 py-2.5 text-sm rounded-xl transition-all duration-200"
                                                )}
                                            >
                                                <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                                                Sign out
                                            </button>
                                        )}
                                    </Menu.Item>
                                </div>
                            </Menu.Items>
                        </Transition>
                    </Menu>
                </div>
            </div>
        </div>
    );
}
