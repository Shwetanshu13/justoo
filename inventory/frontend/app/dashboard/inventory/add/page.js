'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { inventoryAPI } from '@/lib/api';
import { UNITS } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AddItemPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch
    } = useForm({
        defaultValues: {
            name: '',
            description: '',
            price: '',
            quantity: '',
            minStockLevel: 10,
            discount: 0,
            unit: 'pieces',
            category: '',
            isActive: 1
        }
    });

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            // Convert string values to proper types
            const itemData = {
                ...data,
                price: parseFloat(data.price),
                quantity: parseInt(data.quantity),
                minStockLevel: parseInt(data.minStockLevel),
                discount: parseFloat(data.discount),
                isActive: parseInt(data.isActive)
            };

            await inventoryAPI.addItem(itemData);
            toast.success('Item added successfully!');
            router.push('/dashboard/inventory');
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to add item';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Add New Item</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Add a new item to your inventory system.
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
                    <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {/* Item Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Item Name *
                                </label>
                                <input
                                    type="text"
                                    {...register('name', {
                                        required: 'Item name is required',
                                        minLength: { value: 2, message: 'Name must be at least 2 characters' }
                                    })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    placeholder="Enter item name"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                                )}
                            </div>

                            {/* Category */}
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                                    Category
                                </label>
                                <input
                                    type="text"
                                    {...register('category')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    placeholder="Enter category"
                                />
                            </div>

                            {/* Price */}
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                                    Price ($) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    {...register('price', {
                                        required: 'Price is required',
                                        min: { value: 0, message: 'Price must be positive' }
                                    })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    placeholder="0.00"
                                />
                                {errors.price && (
                                    <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                                )}
                            </div>

                            {/* Discount */}
                            <div>
                                <label htmlFor="discount" className="block text-sm font-medium text-gray-700">
                                    Discount (%)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    {...register('discount', {
                                        min: { value: 0, message: 'Discount cannot be negative' },
                                        max: { value: 100, message: 'Discount cannot exceed 100%' }
                                    })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    placeholder="0.00"
                                />
                                {errors.discount && (
                                    <p className="mt-1 text-sm text-red-600">{errors.discount.message}</p>
                                )}
                            </div>

                            {/* Quantity */}
                            <div>
                                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                                    Initial Quantity *
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    {...register('quantity', {
                                        required: 'Quantity is required',
                                        min: { value: 0, message: 'Quantity cannot be negative' }
                                    })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    placeholder="0"
                                />
                                {errors.quantity && (
                                    <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
                                )}
                            </div>

                            {/* Unit */}
                            <div>
                                <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                                    Unit *
                                </label>
                                <select
                                    {...register('unit', { required: 'Unit is required' })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                >
                                    {Object.entries(UNITS).map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                                {errors.unit && (
                                    <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>
                                )}
                            </div>

                            {/* Min Stock Level */}
                            <div>
                                <label htmlFor="minStockLevel" className="block text-sm font-medium text-gray-700">
                                    Minimum Stock Level *
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    {...register('minStockLevel', {
                                        required: 'Minimum stock level is required',
                                        min: { value: 0, message: 'Minimum stock level cannot be negative' }
                                    })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    placeholder="10"
                                />
                                {errors.minStockLevel && (
                                    <p className="mt-1 text-sm text-red-600">{errors.minStockLevel.message}</p>
                                )}
                            </div>

                            {/* Status */}
                            <div>
                                <label htmlFor="isActive" className="block text-sm font-medium text-gray-700">
                                    Status
                                </label>
                                <select
                                    {...register('isActive')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                >
                                    <option value="1">Active</option>
                                    <option value="0">Inactive</option>
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <textarea
                                {...register('description')}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                placeholder="Enter item description"
                            />
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Adding...
                                    </div>
                                ) : (
                                    'Add Item'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
