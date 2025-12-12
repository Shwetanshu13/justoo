"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/inventory/components/DashboardLayout";
import { inventoryAPI } from "@/inventory/lib/api";
import { formatCurrency, getStockStatus, UNITS } from "@/inventory/lib/utils";
import { useAuth } from "@/inventory/contexts/AuthContext";
import {
    PlusIcon,
    MagnifyingGlassIcon,
    CubeIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import Link from "next/link";

export default function InventoryPage() {
    const router = useRouter();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("all");
    const [sortBy, setSortBy] = useState("name");
    const [sortOrder, setSortOrder] = useState("asc");
    const { user } = useAuth();
    const isAdmin = user?.role === "admin";

    const fetchItems = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                sortBy,
                sortOrder,
                ...(filter !== "all" && { filter }),
            };

            const response = await inventoryAPI.getAllItems(params);
            setItems(response.data.data);
        } catch (error) {
            toast.error("Failed to fetch inventory items");
            console.error("Fetch items error:", error);
        } finally {
            setLoading(false);
        }
    }, [filter, sortBy, sortOrder]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const filteredItems = useMemo(
        () =>
            items.filter(
                (item) =>
                    item.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    item.category
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase())
            ),
        [items, searchTerm]
    );

    const overviewMetrics = useMemo(() => {
        const totalValue = filteredItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );
        const stockHealth = filteredItems.reduce(
            (acc, item) => {
                const status = getStockStatus(
                    item.quantity,
                    item.minStockLevel
                ).status;
                acc[status] = (acc[status] || 0) + 1;
                return acc;
            },
            { in: 0, low: 0, out: 0 }
        );

        return {
            totalItems: filteredItems.length,
            totalValue,
            stockHealth,
        };
    }, [filteredItems]);

    const statusStyles = {
        in: "bg-emerald-50 text-emerald-600",
        low: "bg-amber-50 text-amber-600",
        out: "bg-rose-50 text-rose-600",
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Inventory
                        </h1>
                        <p className="text-slate-500 mt-1">
                            Manage your products, stock levels, and pricing.
                        </p>
                    </div>
                    {isAdmin && (
                        <Link
                            href="/inventory/dashboard/inventory/add"
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            <PlusIcon className="h-4 w-4" />
                            Add Item
                        </Link>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">
                            Total Items
                        </p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">
                            {overviewMetrics.totalItems}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">
                            Inventory Value
                        </p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">
                            {formatCurrency(overviewMetrics.totalValue)}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">
                            Healthy Stock
                        </p>
                        <p className="mt-2 text-2xl font-bold text-emerald-600">
                            {overviewMetrics.stockHealth.in}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">
                            Alerts
                        </p>
                        <p className="mt-2 text-2xl font-bold text-rose-600">
                            {overviewMetrics.stockHealth.low +
                                overviewMetrics.stockHealth.out}
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-200 bg-slate-50/50">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    placeholder="Search items..."
                                    className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                />
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            </div>

                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            >
                                <option value="all">All Status</option>
                                <option value="in-stock">In Stock</option>
                                <option value="low-stock">Low Stock</option>
                                <option value="out-of-stock">
                                    Out of Stock
                                </option>
                            </select>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            >
                                <option value="name">Sort by Name</option>
                                <option value="category">
                                    Sort by Category
                                </option>
                                <option value="price">Sort by Price</option>
                                <option value="quantity">
                                    Sort by Quantity
                                </option>
                                <option value="createdAt">Sort by Date</option>
                            </select>

                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            >
                                <option value="asc">Ascending</option>
                                <option value="desc">Descending</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 py-12 text-center">
                            <div className="rounded-full bg-slate-100 p-3">
                                <CubeIcon className="h-6 w-6 text-slate-400" />
                            </div>
                            <div>
                                <p className="text-base font-semibold text-slate-900">
                                    No items found
                                </p>
                                <p className="text-sm text-slate-500">
                                    Try adjusting your filters or search terms.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Item
                                        </th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Stock
                                        </th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white">
                                    {filteredItems.map((item) => {
                                        const stockStatus = getStockStatus(
                                            item.quantity,
                                            item.minStockLevel
                                        );
                                        return (
                                            <tr
                                                key={item.id}
                                                onClick={() =>
                                                    router.push(
                                                        `/inventory/dashboard/inventory/${item.id}`
                                                    )
                                                }
                                                className="hover:bg-slate-50 transition-colors cursor-pointer"
                                            >
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-medium text-slate-900">
                                                            {item.name}
                                                        </p>
                                                        {item.description && (
                                                            <p className="text-xs text-slate-500 truncate max-w-[200px]">
                                                                {
                                                                    item.description
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {item.category || "-"}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-slate-900">
                                                            {formatCurrency(
                                                                item.price
                                                            )}
                                                        </span>
                                                        {item.discount > 0 && (
                                                            <span className="text-xs text-emerald-600 font-medium">
                                                                {item.discount}%
                                                                off
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm text-slate-900">
                                                            {item.quantity}{" "}
                                                            <span className="text-slate-500 text-xs">
                                                                {UNITS[
                                                                    item.unit
                                                                ] || item.unit}
                                                            </span>
                                                        </span>
                                                        <span className="text-xs text-slate-400">
                                                            Min:{" "}
                                                            {item.minStockLevel}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            statusStyles[
                                                                stockStatus
                                                                    .status
                                                            ]
                                                        }`}
                                                    >
                                                        {stockStatus.text}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
