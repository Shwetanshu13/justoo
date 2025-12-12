"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/inventory/components/DashboardLayout";
import LoadingSpinner from "@/inventory/components/LoadingSpinner";
import { inventoryAPI } from "@/inventory/lib/api";
import { UNITS } from "@/inventory/lib/utils";
import toast from "react-hot-toast";

export default function EditItemPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [item, setItem] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const router = useRouter();
    const params = useParams();
    const itemId = params.id;

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        reset,
        watch,
    } = useForm({
        defaultValues: {
            name: "",
            description: "",
            price: "",
            quantity: "",
            minStockLevel: 10,
            discount: 0,
            unit: "pieces",
            category: "",
            isActive: 1,
        },
    });

    // Load item data on mount
    useEffect(() => {
        const loadItem = async () => {
            try {
                setIsLoading(true);
                const response = await inventoryAPI.getItemById(itemId);
                const itemData = response.data.data;
                setItem(itemData);

                // Set image preview if item has an image
                if (itemData.image) {
                    setImagePreview(itemData.image);
                }

                // Populate form with existing data
                reset({
                    name: itemData.name || "",
                    description: itemData.description || "",
                    price: itemData.price || "",
                    quantity: itemData.quantity || "",
                    minStockLevel: itemData.minStockLevel || 10,
                    discount: itemData.discount || 0,
                    unit: itemData.unit || "pieces",
                    category: itemData.category || "",
                    isActive: itemData.isActive || 1,
                });
            } catch (error) {
                console.error("Error loading item:", error);
                const message =
                    error.response?.data?.message || "Failed to load item";
                toast.error(message);
                router.push("/inventory/dashboard/inventory");
            } finally {
                setIsLoading(false);
            }
        };

        if (itemId) {
            loadItem();
        }
    }, [itemId, reset, router]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith("image/")) {
                toast.error("Please select a valid image file");
                return;
            }

            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Image size must be less than 5MB");
                return;
            }

            setSelectedImage(file);
            const reader = new FileReader();
            reader.onload = (e) => setImagePreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        // If item had an existing image, keep the preview but mark for removal
        if (item?.image && !selectedImage) {
            setImagePreview(null);
        } else {
            setImagePreview(item?.image || null);
        }
    };

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            // Create FormData for file upload
            const formData = new FormData();

            // Add all form fields
            Object.keys(data).forEach((key) => {
                if (
                    data[key] !== undefined &&
                    data[key] !== null &&
                    data[key] !== ""
                ) {
                    formData.append(key, data[key]);
                }
            });

            // Add image if selected
            if (selectedImage) {
                formData.append("image", selectedImage);
            }

            await inventoryAPI.updateItem(itemId, formData);
            toast.success("Item updated successfully!");
            router.push("/inventory/dashboard/inventory");
        } catch (error) {
            const message =
                error.response?.data?.message || "Failed to update item";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex min-h-96 items-center justify-center">
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
                        The item you’re trying to edit could not be found.
                    </p>
                    <button
                        onClick={() =>
                            router.push("/inventory/dashboard/inventory")
                        }
                        className="inline-flex items-center px-4 py-2 rounded-2xl bg-blue-600 text-sm font-semibold text-white"
                    >
                        Back to Inventory
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="mx-auto max-w-5xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Edit Item
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Update details for{" "}
                            <span className="font-medium text-slate-700">
                                {item.name}
                            </span>
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="p-6 space-y-8"
                    >
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                            <div className="lg:col-span-2 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Item Name{" "}
                                        <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        {...register("name", {
                                            required: "Item name is required",
                                            minLength: {
                                                value: 2,
                                                message:
                                                    "Name must be at least 2 characters",
                                            },
                                        })}
                                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                        placeholder="Enter item name"
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-rose-600">
                                            {errors.name.message}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Category
                                        </label>
                                        <input
                                            type="text"
                                            {...register("category")}
                                            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                            placeholder="Category"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Unit{" "}
                                            <span className="text-rose-500">
                                                *
                                            </span>
                                        </label>
                                        <select
                                            {...register("unit", {
                                                required: "Unit is required",
                                            })}
                                            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                        >
                                            {Object.entries(UNITS).map(
                                                ([value, label]) => (
                                                    <option
                                                        key={value}
                                                        value={value}
                                                    >
                                                        {label}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                        {errors.unit && (
                                            <p className="mt-1 text-sm text-rose-600">
                                                {errors.unit.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Price{" "}
                                            <span className="text-rose-500">
                                                *
                                            </span>
                                        </label>
                                        <div className="relative">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                <span className="text-slate-500 sm:text-sm">
                                                    ₹
                                                </span>
                                            </div>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                {...register("price", {
                                                    required:
                                                        "Price is required",
                                                    min: {
                                                        value: 0,
                                                        message:
                                                            "Price must be positive",
                                                    },
                                                })}
                                                className="w-full rounded-lg border border-slate-200 bg-white pl-7 pr-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        {errors.price && (
                                            <p className="mt-1 text-sm text-rose-600">
                                                {errors.price.message}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Discount (%)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                {...register("discount", {
                                                    min: {
                                                        value: 0,
                                                        message:
                                                            "Discount cannot be negative",
                                                    },
                                                    max: {
                                                        value: 100,
                                                        message:
                                                            "Discount cannot exceed 100%",
                                                    },
                                                })}
                                                className="w-full rounded-lg border border-slate-200 bg-white pl-4 pr-8 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                                placeholder="0.00"
                                            />
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                <span className="text-slate-500 sm:text-sm">
                                                    %
                                                </span>
                                            </div>
                                        </div>
                                        {errors.discount && (
                                            <p className="mt-1 text-sm text-rose-600">
                                                {errors.discount.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Quantity{" "}
                                            <span className="text-rose-500">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            {...register("quantity", {
                                                required:
                                                    "Quantity is required",
                                                min: {
                                                    value: 0,
                                                    message:
                                                        "Quantity cannot be negative",
                                                },
                                            })}
                                            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                            placeholder="0"
                                        />
                                        {errors.quantity && (
                                            <p className="mt-1 text-sm text-rose-600">
                                                {errors.quantity.message}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Min Stock{" "}
                                            <span className="text-rose-500">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            {...register("minStockLevel", {
                                                required:
                                                    "Minimum stock level is required",
                                                min: {
                                                    value: 0,
                                                    message:
                                                        "Minimum stock level cannot be negative",
                                                },
                                            })}
                                            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                            placeholder="10"
                                        />
                                        {errors.minStockLevel && (
                                            <p className="mt-1 text-sm text-rose-600">
                                                {errors.minStockLevel.message}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Status
                                        </label>
                                        <select
                                            {...register("isActive")}
                                            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                        >
                                            <option value="1">Active</option>
                                            <option value="0">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 h-fit">
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Media
                                </label>
                                <p className="text-xs text-slate-500 mb-4">
                                    PNG or JPG up to 5MB
                                </p>
                                {imagePreview && (
                                    <div className="mb-4 rounded-lg border border-slate-200 bg-white p-2 text-center">
                                        <img
                                            src={imagePreview}
                                            alt="Item preview"
                                            className="mx-auto h-32 w-32 rounded-lg object-cover"
                                        />
                                        {item?.image && !selectedImage && (
                                            <p className="mt-2 text-xs text-slate-500">
                                                Current image
                                            </p>
                                        )}
                                        {selectedImage && (
                                            <p className="mt-2 text-xs text-emerald-600 font-medium">
                                                New image selected
                                            </p>
                                        )}
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="mt-2 text-xs font-medium text-rose-600 hover:text-rose-700"
                                        >
                                            Remove image
                                        </button>
                                    </div>
                                )}
                                <label
                                    htmlFor="image-upload"
                                    className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white px-4 py-8 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-colors"
                                >
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        id="image-upload"
                                    />
                                    <svg
                                        className="h-8 w-8 text-slate-400 mb-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                        />
                                    </svg>
                                    <p className="text-sm font-medium text-slate-700">
                                        Upload new image
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Drag & drop or click to browse
                                    </p>
                                </label>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() =>
                                    router.push(
                                        "/inventory/dashboard/inventory"
                                    )
                                }
                                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        Updating...
                                    </>
                                ) : (
                                    "Update Item"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
