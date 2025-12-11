"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import LoadingSpinner from "@/components/LoadingSpinner";
import { inventoryAPI } from "@/lib/api";
import { formatCurrency, getStockStatus, UNITS } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
    PencilIcon,
    TrashIcon,
    ArrowLeftIcon,
    CubeIcon,
    TagIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ItemDetailPage() {
    const [item, setItem] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const params = useParams();
    const itemId = params.id;
    const { user } = useAuth();
    const isAdmin = user?.role === "admin";

    useEffect(() => {
        const loadItem = async () => {
            try {
                setIsLoading(true);
                const response = await inventoryAPI.getItemById(itemId);
                setItem(response.data.data);
            } catch (error) {
                console.error("Error loading item:", error);
                const message =
                    error.response?.data?.message || "Failed to load item";
                toast.error(message);
                router.push("/dashboard/inventory");
            } finally {
                setIsLoading(false);
            }
        };

        if (itemId) {
            loadItem();
        }
    }, [itemId, router]);

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this item?")) {
            return;
        }

        try {
            await inventoryAPI.deleteItem(itemId);
            toast.success("Item deleted successfully");
            router.push("/dashboard/inventory");
        } catch (error) {
            toast.error("Failed to delete item");
            console.error("Delete item error:", error);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-96">
                    <LoadingSpinner />
                </div>
            </DashboardLayout>
        );
    }

    if (!item) {
        return (
            <DashboardLayout>
                <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Item not found
                    </h3>
                    <p className="text-gray-500 mb-4">
                        The item you’re looking for could not be found.
                    </p>
                    <button
                        onClick={() => router.push("/dashboard/inventory")}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                        Back to Inventory
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    const stockStatus = getStockStatus(item.quantity, item.minStockLevel);
    const statusStyles = {
        in: "bg-emerald-50 text-emerald-600",
        low: "bg-amber-50 text-amber-600",
        out: "bg-rose-50 text-rose-600",
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <button
                        onClick={() => router.push("/dashboard/inventory")}
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeftIcon className="h-4 w-4" /> Back to inventory
                    </button>
                    {isAdmin && (
                        <div className="flex gap-3">
                            <Link
                                href={`/dashboard/inventory/edit/${item.id}`}
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                            >
                                <PencilIcon className="h-4 w-4" /> Edit
                            </Link>
                            <button
                                onClick={handleDelete}
                                className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-colors"
                            >
                                <TrashIcon className="h-4 w-4" /> Delete
                            </button>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-200">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-2xl font-bold text-slate-900">
                                        {item.name}
                                    </h1>
                                    <span
                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                            item.isActive
                                                ? "bg-emerald-100 text-emerald-800"
                                                : "bg-slate-100 text-slate-800"
                                        }`}
                                    >
                                        {item.isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500">
                                    SKU:{" "}
                                    <span className="font-mono text-slate-700">
                                        {item.id}
                                    </span>
                                </p>
                            </div>
                            <div className="flex items-center">
                                <span
                                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                                        statusStyles[stockStatus.status]
                                    }`}
                                >
                                    {stockStatus.text}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <div className="space-y-6">
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
                                        Category
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <span className="rounded-lg bg-white border border-slate-200 p-2 text-blue-600">
                                            <CubeIcon className="h-5 w-5" />
                                        </span>
                                        <p className="text-lg font-semibold text-slate-900">
                                            {item.category || "Uncategorized"}
                                        </p>
                                    </div>
                                </div>
                                {item.description && (
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
                                            Description
                                        </p>
                                        <p className="text-sm text-slate-600 leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>
                                )}
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
                                        Pricing
                                    </p>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-2xl font-bold text-slate-900">
                                            {formatCurrency(item.price)}
                                        </p>
                                        {item.discount > 0 && (
                                            <p className="text-xs font-medium text-emerald-600 bg-emerald-50 inline-block px-2 py-1 rounded-md w-fit">
                                                {item.discount}% discount
                                                applied
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-4">
                                        Stock Status
                                    </p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-slate-500 mb-1">
                                                Current stock
                                            </p>
                                            <p className="text-2xl font-bold text-slate-900">
                                                {item.quantity}{" "}
                                                <span className="text-sm font-normal text-slate-500">
                                                    {UNITS[item.unit] ||
                                                        item.unit}
                                                </span>
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500 mb-1">
                                                Minimum level
                                            </p>
                                            <p className="text-lg font-semibold text-slate-900">
                                                {item.minStockLevel}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
                                        Total Value
                                    </p>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {formatCurrency(
                                            item.price * item.quantity
                                        )}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
                                        Unit Type
                                    </p>
                                    <p className="text-lg font-semibold text-slate-900 capitalize">
                                        {UNITS[item.unit] || item.unit}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 pt-6 border-t border-slate-200">
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-slate-500">
                                    Created
                                </p>
                                <p className="text-sm font-medium text-slate-900">
                                    {new Date(item.createdAt).toLocaleString()}
                                </p>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-slate-500">
                                    Last Updated
                                </p>
                                <p className="text-sm font-medium text-slate-900">
                                    {new Date(item.updatedAt).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
