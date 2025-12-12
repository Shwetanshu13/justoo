"use client";

import { useState, useEffect } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import Modal from "@/admin/components/Modal";
import toast from "react-hot-toast";
import { inventoryAdminAPI } from "@/admin/lib/api";
import { useAuth } from "@/admin/contexts/AuthContext";

export default function InventoryAdminsPage() {
    const [inventoryAdmins, setInventoryAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState("create"); // 'create' or 'edit'
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        role: "user",
    });

    useEffect(() => {
        fetchInventoryAdmins();
    }, []);

    const fetchInventoryAdmins = async () => {
        try {
            setLoading(true);
            const response = await inventoryAdminAPI.getAllInventoryAdmins();
            setInventoryAdmins(response.data.data || []);
        } catch (error) {
            console.error("Error fetching inventory admins:", error);
            toast.error("Failed to fetch inventory admins");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === "create") {
                await inventoryAdminAPI.createInventoryAdmin(formData);
                toast.success("Inventory admin created successfully");
            } else if (modalMode === "edit") {
                await inventoryAdminAPI.updateInventoryAdmin(
                    selectedAdmin.id,
                    formData
                );
                toast.success("Inventory admin updated successfully");
            }

            setShowModal(false);
            resetForm();
            fetchInventoryAdmins();
        } catch (error) {
            console.error("Error saving inventory admin:", error);
            toast.error(
                error.response?.data?.message ||
                    "Failed to save inventory admin"
            );
        }
    };

    const handleDelete = async (adminId) => {
        if (
            window.confirm(
                "Are you sure you want to delete this inventory admin?"
            )
        ) {
            try {
                await inventoryAdminAPI.deleteInventoryAdmin(adminId);
                toast.success("Inventory admin deleted successfully");
                fetchInventoryAdmins();
            } catch (error) {
                console.error("Error deleting inventory admin:", error);
                toast.error("Failed to delete inventory admin");
            }
        }
    };

    const openModal = (mode, admin = null) => {
        setModalMode(mode);
        setSelectedAdmin(admin);

        if (mode === "create") {
            resetForm();
        } else if (admin) {
            setFormData({
                username: admin.username || "",
                email: admin.email || "",
                password: "",
                role: admin.role || "user",
            });
        }

        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            username: "",
            email: "",
            password: "",
            role: "user",
        });
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Only superadmin can access this page
    if (user?.role !== "superadmin") {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900">
                        Access Denied
                    </h3>
                    <p className="text-gray-600">
                        You don't have permission to access this page.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Inventory Admins
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage inventory system administrators and users.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => openModal("create")}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 shadow-sm transition-colors"
                >
                    <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
                    Add Inventory Admin
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-gray-200 border-t-primary-600 rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Username
                                </th>
                                <th
                                    scope="col"
                                    className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Email
                                </th>
                                <th
                                    scope="col"
                                    className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Role
                                </th>
                                <th
                                    scope="col"
                                    className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Status
                                </th>
                                <th
                                    scope="col"
                                    className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Last Login
                                </th>
                                <th scope="col" className="relative px-5 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {inventoryAdmins.map((admin) => (
                                <tr
                                    key={admin.id}
                                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                                    onClick={() => openModal("view", admin)}
                                >
                                    <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-gray-900">
                                        {admin.username}
                                    </td>
                                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">
                                        {admin.email}
                                    </td>
                                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                                                admin.role === "admin"
                                                    ? "bg-primary-50 text-primary-700 border border-primary-200"
                                                    : "bg-gray-50 text-gray-700 border border-gray-200"
                                            }`}
                                        >
                                            {admin.role}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                                                admin.isActive
                                                    ? "bg-green-50 text-green-700 border border-green-200"
                                                    : "bg-red-50 text-red-700 border border-red-200"
                                            }`}
                                        >
                                            {admin.isActive
                                                ? "Active"
                                                : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">
                                        {admin.lastLogin
                                            ? new Date(
                                                  admin.lastLogin
                                              ).toLocaleDateString()
                                            : "Never"}
                                    </td>
                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openModal("edit", admin);
                                                }}
                                                className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(admin.id);
                                                }}
                                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {inventoryAdmins.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500">
                                No inventory admins found.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={
                    modalMode === "create"
                        ? "Add Inventory Admin"
                        : modalMode === "edit"
                        ? "Edit Inventory Admin"
                        : "View Inventory Admin"
                }
            >
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Username
                            </label>
                            <input
                                type="text"
                                name="username"
                                id="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                disabled={modalMode === "view"}
                                required
                                className="block w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                disabled={modalMode === "view"}
                                required
                                className="block w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50"
                            />
                        </div>

                        {modalMode !== "view" && (
                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    {modalMode === "create"
                                        ? "Password"
                                        : "New Password (leave blank to keep current)"}
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    id="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required={modalMode === "create"}
                                    className="block w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>
                        )}

                        <div>
                            <label
                                htmlFor="role"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Role
                            </label>
                            <select
                                name="role"
                                id="role"
                                value={formData.role}
                                onChange={handleInputChange}
                                disabled={modalMode === "view"}
                                className="block w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50"
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>

                    {modalMode !== "view" && (
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 shadow-sm transition-colors"
                            >
                                {modalMode === "create" ? "Create" : "Update"}
                            </button>
                        </div>
                    )}
                </form>
            </Modal>
        </div>
    );
}
