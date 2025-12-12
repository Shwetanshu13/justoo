"use client";
import { useState, useEffect } from "react";
import {
    PlusIcon,
    MagnifyingGlassIcon,
    PencilSquareIcon,
    TrashIcon,
    TruckIcon,
    PhoneIcon,
    EnvelopeIcon,
    IdentificationIcon,
    EllipsisVerticalIcon,
    UserCircleIcon,
    MapPinIcon,
    ClockIcon,
} from "@heroicons/react/24/outline";
import api from "@/admin/lib/api";
import { toast } from "react-hot-toast";
import Modal from "@/admin/components/Modal";

const StatusBadge = ({ status }) => {
    const config = {
        active: {
            dot: "bg-indigo-500",
            text: "text-indigo-700",
            bg: "bg-indigo-50",
        },
        busy: { dot: "bg-gray-500", text: "text-gray-700", bg: "bg-gray-100" },
        inactive: {
            dot: "bg-gray-400",
            text: "text-gray-600",
            bg: "bg-gray-50",
        },
    };
    const style = config[status] || config.inactive;

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

const RiderCard = ({ rider, onEdit, onDelete, onToggleStatus }) => {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200">
            {/* Header */}
            <div className="p-5 border-b border-gray-100">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                            {rider.name?.charAt(0)?.toUpperCase() || "R"}
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">
                                {rider.name || "Unnamed Rider"}
                            </h3>
                            <p className="text-sm text-gray-500 mt-0.5">
                                {rider.vehicle_type?.charAt(0).toUpperCase() +
                                    rider.vehicle_type?.slice(1) || "N/A"}
                            </p>
                        </div>
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <EllipsisVerticalIcon className="h-5 w-5 text-gray-400" />
                        </button>
                        {showMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowMenu(false)}
                                />
                                <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                                    <button
                                        onClick={() => {
                                            setShowMenu(false);
                                            onEdit(rider);
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <PencilSquareIcon className="h-4 w-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowMenu(false);
                                            onToggleStatus(rider);
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        {rider.status === "active" ? (
                                            <>
                                                <span className="h-4 w-4 rounded-full border-2 border-gray-400" />
                                                Deactivate
                                            </>
                                        ) : (
                                            <>
                                                <span className="h-4 w-4 rounded-full bg-indigo-500" />
                                                Activate
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowMenu(false);
                                            onDelete(rider);
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                        Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                    <PhoneIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700">
                        {rider.phone || "No phone"}
                    </span>
                </div>
                {rider.email && (
                    <div className="flex items-center gap-2 text-sm">
                        <EnvelopeIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-700 truncate">
                            {rider.email}
                        </span>
                    </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                    <TruckIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="font-mono text-gray-700 bg-gray-50 px-2 py-0.5 rounded text-xs">
                        {rider.vehicle_number || "N/A"}
                    </span>
                </div>
                {rider.license_number && (
                    <div className="flex items-center gap-2 text-sm">
                        <IdentificationIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-500 text-xs">
                            License: {rider.license_number}
                        </span>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <ClockIcon className="h-3.5 w-3.5" />
                    {new Date(rider.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                    })}
                </div>
                <StatusBadge status={rider.status} />
            </div>
        </div>
    );
};

const RiderModal = ({ isOpen, onClose, onSubmit, rider, loading }) => {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        password: "",
        vehicle_type: "bike",
        vehicle_number: "",
        license_number: "",
        status: "active",
    });

    useEffect(() => {
        if (rider) {
            setFormData({
                name: rider.name || "",
                phone: rider.phone || "",
                email: rider.email || "",
                password: "",
                vehicle_type: rider.vehicle_type || "bike",
                vehicle_number: rider.vehicle_number || "",
                license_number: rider.license_number || "",
                status: rider.status || "active",
            });
        } else {
            setFormData({
                name: "",
                phone: "",
                email: "",
                password: "",
                vehicle_type: "bike",
                vehicle_number: "",
                license_number: "",
                status: "active",
            });
        }
    }, [rider, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const footer = (
        <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
            </button>
            <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary"
            >
                {loading ? "Saving..." : rider ? "Update Rider" : "Add Rider"}
            </button>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={rider ? "Edit Rider" : "Add New Rider"}
            footer={footer}
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="input-label">Full Name *</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    name: e.target.value,
                                })
                            }
                            className="input-field"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="input-label">Phone Number *</label>
                        <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    phone: e.target.value,
                                })
                            }
                            className="input-field"
                            placeholder="+91 9876543210"
                        />
                    </div>

                    <div>
                        <label className="input-label">Email Address</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    email: e.target.value,
                                })
                            }
                            className="input-field"
                            placeholder="john@example.com"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="input-label">
                            Password {!rider && "*"}
                        </label>
                        <input
                            type="password"
                            required={!rider}
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    password: e.target.value,
                                })
                            }
                            className="input-field"
                            placeholder={
                                rider
                                    ? "Leave blank to keep current"
                                    : "Minimum 6 characters"
                            }
                            minLength={6}
                        />
                    </div>

                    <div>
                        <label className="input-label">Vehicle Type *</label>
                        <select
                            required
                            value={formData.vehicle_type}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    vehicle_type: e.target.value,
                                })
                            }
                            className="input-field"
                        >
                            <option value="bike">Bike</option>
                            <option value="scooter">Scooter</option>
                            <option value="car">Car</option>
                            <option value="van">Van</option>
                        </select>
                    </div>

                    <div>
                        <label className="input-label">Vehicle Number *</label>
                        <input
                            type="text"
                            required
                            value={formData.vehicle_number}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    vehicle_number: e.target.value,
                                })
                            }
                            className="input-field"
                            placeholder="KA01AB1234"
                        />
                    </div>

                    <div>
                        <label className="input-label">License Number</label>
                        <input
                            type="text"
                            value={formData.license_number}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    license_number: e.target.value,
                                })
                            }
                            className="input-field"
                            placeholder="DL1234567890"
                        />
                    </div>

                    <div>
                        <label className="input-label">Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    status: e.target.value,
                                })
                            }
                            className="input-field"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="busy">Busy</option>
                        </select>
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default function RidersPage() {
    const [riders, setRiders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [showModal, setShowModal] = useState(false);
    const [editingRider, setEditingRider] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchRiders();
    }, []);

    const fetchRiders = async () => {
        try {
            setLoading(true);
            const response = await api.get("/riders", {
                params: { isActive: 1 },
            });
            const riderData = response.data?.data?.riders || [];
            setRiders(Array.isArray(riderData) ? riderData : []);
        } catch (error) {
            console.error("Error fetching riders:", error);
            toast.error("Failed to fetch riders");
            setRiders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRider = () => {
        setEditingRider(null);
        setShowModal(true);
    };

    const handleEditRider = (rider) => {
        setEditingRider(rider);
        setShowModal(true);
    };

    const handleDeleteRider = async (rider) => {
        if (!rider?.id) {
            toast.error("Invalid rider selected");
            return;
        }

        if (
            window.confirm(
                `Are you sure you want to delete ${rider.name || "this rider"}?`
            )
        ) {
            try {
                const response = await api.delete(`/riders/${rider.id}`);
                const responseData = response.data || response;

                if (responseData.success) {
                    toast.success("Rider deleted successfully");
                    fetchRiders();
                } else {
                    toast.error(responseData.error || "Failed to delete rider");
                }
            } catch (error) {
                console.error("Error deleting rider:", error);
                if (error.response?.status === 404) {
                    toast.error("Rider not found");
                } else if (error.response?.data?.error) {
                    toast.error(error.response.data.error);
                } else {
                    toast.error("Failed to delete rider");
                }
            }
        }
    };

    const handleToggleStatus = async (rider) => {
        const newStatus = rider.status === "active" ? "inactive" : "active";

        try {
            const response = await api.put(`/riders/${rider.id}`, {
                status: newStatus,
            });
            const responseData = response.data || response;

            if (responseData.success) {
                toast.success(
                    `Rider ${
                        newStatus === "active" ? "activated" : "deactivated"
                    } successfully`
                );
                fetchRiders();
            } else {
                toast.error(
                    responseData.error || "Failed to update rider status"
                );
            }
        } catch (error) {
            console.error("Error updating rider status:", error);
            if (error.response?.data?.error) {
                toast.error(error.response.data.error);
            } else {
                toast.error("Failed to update rider status");
            }
        }
    };

    const handleSubmitRider = async (formData) => {
        try {
            setSubmitting(true);

            let response;
            if (editingRider) {
                response = await api.put(
                    `/riders/${editingRider.id}`,
                    formData
                );
            } else {
                response = await api.post("/riders", formData);
            }

            const responseData = response.data || response;

            if (responseData.success) {
                toast.success(
                    `Rider ${editingRider ? "updated" : "created"} successfully`
                );
                setShowModal(false);
                fetchRiders();
            } else {
                toast.error(
                    responseData.error ||
                        `Failed to ${editingRider ? "update" : "create"} rider`
                );
            }
        } catch (error) {
            console.error("Error submitting rider:", error);
            if (error.response?.status === 409) {
                toast.error(
                    error.response.data?.error ||
                        "Phone number or email already exists"
                );
            } else if (error.response?.status === 400) {
                toast.error(
                    error.response.data?.error || "Invalid data provided"
                );
            } else {
                toast.error(
                    `Failed to ${editingRider ? "update" : "create"} rider`
                );
            }
        } finally {
            setSubmitting(false);
        }
    };

    const filteredRiders = riders.filter((rider) => {
        const riderName = rider.name || "";
        const riderPhone = rider.phone || "";
        const riderVehicleNumber = rider.vehicle_number || "";

        const matchesSearch =
            riderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            riderPhone.includes(searchTerm) ||
            riderVehicleNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
            selectedStatus === "all" || rider.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusCount = (status) => {
        return riders.filter((rider) => rider.status === status).length;
    };

    const stats = [
        { label: "Total Riders", value: riders.length, icon: UserCircleIcon },
        { label: "Active", value: getStatusCount("active"), icon: TruckIcon },
        { label: "Busy", value: getStatusCount("busy"), icon: MapPinIcon },
        {
            label: "Inactive",
            value: getStatusCount("inactive"),
            icon: ClockIcon,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Riders
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage your delivery team
                    </p>
                </div>
                <button onClick={handleAddRider} className="btn-primary">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Rider
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-lg border border-gray-200 p-4"
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                                    index === 0
                                        ? "bg-indigo-100"
                                        : "bg-gray-100"
                                }`}
                            >
                                <stat.icon
                                    className={`h-5 w-5 ${
                                        index === 0
                                            ? "text-indigo-600"
                                            : "text-gray-600"
                                    }`}
                                />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {stat.value}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {stat.label}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, phone, or vehicle..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field pl-10"
                        />
                    </div>
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="input-field w-full sm:w-40"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="busy">Busy</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
                <p className="mt-3 text-xs text-gray-500">
                    Showing {filteredRiders.length} of {riders.length} riders
                </p>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filteredRiders.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 border-dashed py-16 text-center">
                    <TruckIcon className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-3 text-sm font-medium text-gray-900">
                        No riders found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {searchTerm || selectedStatus !== "all"
                            ? "Try adjusting your filters."
                            : "Get started by adding your first rider."}
                    </p>
                    {!searchTerm && selectedStatus === "all" && (
                        <button
                            onClick={handleAddRider}
                            className="btn-outline mt-4"
                        >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Add Rider
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredRiders.map((rider) => (
                        <RiderCard
                            key={rider.id}
                            rider={rider}
                            onEdit={handleEditRider}
                            onDelete={handleDeleteRider}
                            onToggleStatus={handleToggleStatus}
                        />
                    ))}
                </div>
            )}

            {/* Modal */}
            <RiderModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleSubmitRider}
                rider={editingRider}
                loading={submitting}
            />
        </div>
    );
}
