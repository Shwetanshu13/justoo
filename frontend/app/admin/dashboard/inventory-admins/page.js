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
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                    className="btn-primary"
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
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                                    >
                                        Username
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                                    >
                                        Email
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                                    >
                                        Role
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                                    >
                                        Status
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                                    >
                                        Last Login
                                    </th>
                                    <th
                                        scope="col"
                                        className="relative px-6 py-4"
                                    >
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {inventoryAdmins.map((admin) => (
                                    <tr
                                        key={admin.id}
                                        className="hover:bg-gray-50/50 cursor-pointer transition-colors duration-200"
                                        onClick={() => openModal("view", admin)}
                                    >
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                            {admin.username}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {admin.email}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    admin.role === "admin"
                                                        ? "bg-primary-50 text-primary-700 border border-primary-100"
                                                        : "bg-gray-100 text-gray-700 border border-gray-200"
                                                }`}
                                            >
                                                {admin.role}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    admin.isActive
                                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                                        : "bg-red-50 text-red-700 border border-red-100"
                                                }`}
                                            >
                                                {admin.isActive
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {admin.lastLogin
                                                ? new Date(
                                                      admin.lastLogin
                                                  ).toLocaleDateString()
                                                : "Never"}
                                        </td>
                                        <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openModal(
                                                            "edit",
                                                            admin
                                                        );
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(admin.id);
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {inventoryAdmins.length === 0 && (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                                <PlusIcon className="h-6 w-6 text-gray-400" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-900">
                                No admins found
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Get started by creating a new inventory admin.
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
                footer={null}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
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
                                className="input-field"
                                placeholder="Enter username"
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
                                className="input-field"
                                placeholder="Enter email address"
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
                                    className="input-field"
                                    placeholder={
                                        modalMode === "create"
                                            ? "Enter password"
                                            : "Enter new password"
                                    }
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
                                className="input-field"
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>

                    {modalMode !== "view" && (
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary">
                                {modalMode === "create"
                                    ? "Create Admin"
                                    : "Save Changes"}
                            </button>
                        </div>
                    )}
                </form>
            </Modal>
        </div>
    );
}
