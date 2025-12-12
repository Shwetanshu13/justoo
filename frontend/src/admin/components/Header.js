"use client";

import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import {
    Bars3Icon,
    BellIcon,
    ChevronDownIcon,
    UserCircleIcon,
    ArrowRightOnRectangleIcon,
    MagnifyingGlassIcon,
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
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white border-b border-gray-200">
            <button
                type="button"
                className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
                onClick={() => setSidebarOpen(true)}
            >
                <span className="sr-only">Open sidebar</span>
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>

            <div className="flex-1 px-4 flex justify-between items-center">
                <div className="flex-1 flex">
                    <div className="w-full flex md:ml-0">
                        <div className="relative w-full max-w-md text-gray-500 focus-within:text-gray-600">
                            <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                />
                            </div>
                            <input
                                name="search"
                                id="search"
                                className="block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent sm:text-sm"
                                placeholder="Search..."
                                type="search"
                            />
                        </div>
                    </div>
                </div>

                <div className="ml-4 flex items-center md:ml-6 gap-4">
                    {/* Profile dropdown */}
                    <Menu as="div" className="relative">
                        <div>
                            <Menu.Button className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                                <span className="sr-only">Open user menu</span>
                                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                                    {user?.username?.[0]?.toUpperCase()}
                                </div>
                            </Menu.Button>
                        </div>

                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <p className="text-sm text-gray-900 font-medium">
                                        {user?.username}
                                    </p>
                                    <p className="text-xs text-gray-500 capitalize mt-0.5">
                                        {user?.role}
                                    </p>
                                </div>

                                <div className="py-1">
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
                                                        ? "bg-gray-50 text-gray-900"
                                                        : "text-gray-700",
                                                    "group flex w-full items-center px-4 py-2 text-sm"
                                                )}
                                            >
                                                <UserCircleIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
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
                                                        ? "bg-gray-50 text-gray-900"
                                                        : "text-gray-700",
                                                    "group flex w-full items-center px-4 py-2 text-sm"
                                                )}
                                            >
                                                <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
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
