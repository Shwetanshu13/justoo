"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/admin/contexts/AuthContext";
import { api } from "@/admin/lib/api";
import toast from "react-hot-toast";
import Modal from "@/admin/components/Modal";
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    UserIcon,
    ShieldCheckIcon,
} from "@heroicons/react/24/outline";

const AdminCard = ({ admin, onEdit, onDelete, currentUserId }) => {
    const getRoleConfig = (role) => {
        switch (role) {
            case "superadmin":
                return {
                    bg: "bg-red-50",
                    text: "text-red-700",
                    border: "border-red-100",
                    iconBg: "bg-red-100 text-red-600",
                };
            case "admin":
                return {
                    bg: "bg-blue-50",
                    text: "text-blue-700",
                    border: "border-blue-100",
                    iconBg: "bg-blue-100 text-blue-600",
                };
            case "inventory_admin":
                return {
                    bg: "bg-emerald-50",
                    text: "text-emerald-700",
                    border: "border-emerald-100",
                    iconBg: "bg-emerald-100 text-emerald-600",
                };
            default:
                return {
                    bg: "bg-gray-50",
                    text: "text-gray-700",
                    border: "border-gray-100",
                    iconBg: "bg-gray-100 text-gray-600",
                };
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const parsed = new Date(dateString);
        if (isNaN(parsed.getTime())) return "N/A";
        return parsed.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const roleConfig = getRoleConfig(admin.role);

    return (
        <div className="card p-6 hover:shadow-md transition-shadow duration-200 group">
            <div className="flex items-start justify-between">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <div
                            className={`h-12 w-12 rounded-xl ${roleConfig.iconBg} flex items-center justify-center`}
                        >
                            <UserIcon className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                            {admin.username}
                        </h3>
                        <p className="text-sm text-gray-500">{admin.email}</p>
                    </div>
                </div>
                <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${roleConfig.bg} ${roleConfig.text} border ${roleConfig.border}`}
                >
                    {admin.role.replace("_", " ")}
                </span>
            </div>

            <div className="mt-4 flex items-center text-xs text-gray-500">
                <ShieldCheckIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                Created on {formatDate(admin.created_at)}
            </div>

            {admin.id !== currentUserId && (
                <div className="mt-5 pt-5 border-t border-gray-100 flex justify-end gap-2">
                    <button
                        onClick={() => onEdit(admin)}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                    >
                        <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onDelete(admin)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default function AdminsPage() {
    const { user } = useAuth();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState("all");
    const [showModal, setShowModal] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        role: "inventory_admin",
    });

    useEffect(() => {
        fetchAdmins();
    }, []);

    useEffect(() => {
        if (editingAdmin) {
            setFormData({
                username: editingAdmin.username || "",
                email: editingAdmin.email || "",
                password: "",
                role: editingAdmin.role || "inventory_admin",
            });
        } else {
            setFormData({
                username: "",
                email: "",
                password: "",
                role: "inventory_admin",
            });
        }
    }, [editingAdmin, showModal]);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const response = await api.get("/");
            const responseData = response.data || response;

            if (responseData.success) {
                const adminsList = Array.isArray(responseData.data)
                    ? responseData.data
                    : [];
                // Normalize date keys for the UI
                const normalized = adminsList.map((admin) => ({
                    ...admin,
                    created_at: admin.created_at || admin.createdAt,
                    updated_at: admin.updated_at || admin.updatedAt,
                }));
                setAdmins(normalized);
            } else {
                toast.error(responseData.error || "Failed to fetch admins");
            }
        } catch (error) {
            console.error("Error fetching admins:", error);
            toast.error("Failed to fetch admins");
        } finally {
            setLoading(false);
        }
    };

    const handleAddAdmin = () => {
        setEditingAdmin(null);
        setShowModal(true);
    };

    const handleEditAdmin = (admin) => {
        setEditingAdmin(admin);
        setShowModal(true);
    };

    const handleDeleteAdmin = async (admin) => {
        if (
            window.confirm(`Are you sure you want to delete ${admin.username}?`)
        ) {
            try {
                const response = await api.delete(`/${admin.id}`);
                const responseData = response.data || response;

                if (responseData.success) {
                    toast.success("Admin deleted successfully");
                    fetchAdmins();
                } else {
                    toast.error(responseData.error || "Failed to delete admin");
                }
            } catch (error) {
                console.error("Error deleting admin:", error);
                toast.error("Failed to delete admin");
            }
        }
    };

    const handleSubmitAdmin = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);

            let response;
            if (editingAdmin) {
                const updateData = { ...formData };
                if (!updateData.password) {
                    delete updateData.password;
                }
                response = await api.put(`/${editingAdmin.id}`, updateData);
            } else {
                response = await api.post("/add", formData);
            }

            const responseData = response.data || response;

            if (responseData.success) {
                toast.success(
                    `Admin ${editingAdmin ? "updated" : "created"} successfully`
                );
                setShowModal(false);
                fetchAdmins();
            } else {
                toast.error(
                    responseData.error ||
                        `Failed to ${editingAdmin ? "update" : "create"} admin`
                );
            }
        } catch (error) {
            console.error("Error submitting admin:", error);
            toast.error(
                `Failed to ${editingAdmin ? "update" : "create"} admin`
            );
        } finally {
            setSubmitting(false);
        }
    };

    const filteredAdmins = admins.filter((admin) => {
        const matchesSearch =
            admin.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            admin.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole =
            selectedRole === "all" || admin.role === selectedRole;
        return matchesSearch && matchesRole;
    });

    if (user?.role !== "superadmin") {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900">
                        Access Denied
                    </h3>
                    <p className="text-gray-600">
                        You don't have permission to manage admins.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Admin Management
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage system administrators and their permissions
                    </p>
                </div>
                <button onClick={handleAddAdmin} className="btn-primary">
                    <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
                    Add Admin
                </button>
            </div>

            {/* Filters */}
            <div className="card p-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search admins..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field pl-10"
                        />
                    </div>

                    <div>
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="input-field"
                        >
                            <option value="all">All Roles</option>
                            <option value="superadmin">Super Admin</option>
                            <option value="admin">Admin</option>
                            <option value="inventory_admin">
                                Inventory Admin
                            </option>
                        </select>
                    </div>

                    <div className="text-sm text-gray-500 flex items-center justify-end">
                        Showing {filteredAdmins.length} of {admins.length}{" "}
                        admins
                    </div>
                </div>
            </div>

            {/* Admins Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-gray-200 border-t-primary-600 rounded-full animate-spin"></div>
                </div>
            ) : filteredAdmins.length === 0 ? (
                <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                        <UserIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900">
                        No admins found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {searchTerm || selectedRole !== "all"
                            ? "Try adjusting your search or filter criteria."
                            : "Get started by adding a new admin."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAdmins.map((admin) => (
                        <AdminCard
                            key={admin.id}
                            admin={admin}
                            onEdit={handleEditAdmin}
                            onDelete={handleDeleteAdmin}
                            currentUserId={user?.id}
                        />
                    ))}
                </div>
            )}

            {/* Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingAdmin ? "Edit Admin" : "Add New Admin"}
                footer={null}
            >
                <form onSubmit={handleSubmitAdmin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.username}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    username: e.target.value,
                                })
                            }
                            className="input-field"
                            placeholder="Enter username"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    email: e.target.value,
                                })
                            }
                            className="input-field"
                            placeholder="Enter email"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password{" "}
                            {editingAdmin && "(Leave blank to keep current)"}
                        </label>
                        <input
                            type="password"
                            required={!editingAdmin}
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    password: e.target.value,
                                })
                            }
                            className="input-field"
                            placeholder="Enter password"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Role
                        </label>
                        <select
                            value={formData.role}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    role: e.target.value,
                                })
                            }
                            className="input-field"
                        >
                            <option value="inventory_admin">
                                Inventory Admin
                            </option>
                            <option value="admin">Admin</option>
                            <option value="superadmin">Super Admin</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary"
                        >
                            {submitting
                                ? "Saving..."
                                : editingAdmin
                                ? "Update Admin"
                                : "Create Admin"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
