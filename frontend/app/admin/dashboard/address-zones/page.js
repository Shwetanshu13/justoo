"use client";

import { useEffect, useMemo, useState } from "react";
import "leaflet/dist/leaflet.css";
import toast from "react-hot-toast";
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    MapPinIcon,
    ClockIcon,
    CurrencyDollarIcon,
    PowerIcon,
    MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import Modal from "@/admin/components/Modal";
import { addressZoneAPI } from "@/admin/lib/api";
import { useAuth } from "@/admin/contexts/AuthContext";

import dynamic from "next/dynamic";

// Dynamically import the map component with SSR disabled
const MapAreaPicker = dynamic(
    () => import("../../../../src/admin/components/MapAreaPicker.js"),
    {
        ssr: false, // This ensures the component only renders on the client
        loading: () => (
            <div className="h-[340px] w-full bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                Loading Map...
            </div>
        ),
    }
);

const statusStyles = {
    active: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    inactive: "bg-gray-100 text-gray-700 border border-gray-200",
    maintenance: "bg-amber-50 text-amber-700 border border-amber-100",
};

const StatusBadge = ({ status }) => {
    const style = statusStyles[status] || statusStyles.inactive;
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${style}`}
        >
            {status?.replace("_", " ") || "unknown"}
        </span>
    );
};

const ActivityBadge = ({ isActive }) => {
    const active = Boolean(isActive);
    return (
        <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                active
                    ? "bg-green-50 text-green-700 border-green-100"
                    : "bg-red-50 text-red-700 border-red-100"
            }`}
        >
            <PowerIcon className="h-4 w-4" />
            {active ? "Active" : "Inactive"}
        </span>
    );
};

const formatAreaSummary = (area) => {
    if (!area) return "Not provided";
    if (typeof area === "string") {
        return area.length > 60 ? `${area.slice(0, 60)}…` : area;
    }
    if (typeof area === "object") {
        const type = area.type || "Polygon";
        const coords = Array.isArray(area.coordinates)
            ? area.coordinates.length
            : 0;
        return `${type}${coords ? ` • ${coords} rings` : ""}`;
    }
    return String(area);
};

const getAreaInputString = (area) => {
    if (!area) return "";
    if (typeof area === "string") return area;
    try {
        return JSON.stringify(area, null, 2);
    } catch (err) {
        return "";
    }
};

const geoJSONToPoints = (area) => {
    if (!area || area.type !== "Polygon" || !Array.isArray(area.coordinates)) {
        return [];
    }
    const ring = area.coordinates?.[0] || [];
    const points = ring
        .map((pair) => ({ lat: Number(pair[1]), lng: Number(pair[0]) }))
        .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));

    // Remove duplicated closing point if present
    if (points.length > 1) {
        const first = points[0];
        const last = points[points.length - 1];
        if (first.lat === last.lat && first.lng === last.lng) {
            points.pop();
        }
    }
    return points;
};

const pointsToGeoJSON = (points) => {
    if (!Array.isArray(points) || points.length < 3) return null;
    const ring = points
        .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng))
        .map((p) => [p.lng, p.lat]);

    if (ring.length < 3) return null;

    const first = ring[0];
    const last = ring[ring.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
        ring.push(first);
    }

    return {
        type: "Polygon",
        coordinates: [ring],
    };
};

const ZoneCard = ({ zone, onEdit, onDelete, canManage }) => {
    return (
        <div className="card p-5 space-y-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {zone.name}
                        </h3>
                        <StatusBadge status={zone.status} />
                        {/* <ActivityBadge isActive={zone.is_active} /> */}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{zone.code}</p>
                </div>
                {canManage && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => onEdit(zone)}
                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                            aria-label="Edit address zone"
                        >
                            <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => onDelete(zone)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            aria-label="Delete address zone"
                        >
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>

            {zone.description && (
                <p className="text-sm text-gray-600">{zone.description}</p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                    <ClockIcon className="h-4 w-4 text-gray-400" />
                    <div>
                        <p className="text-xs text-gray-500">ETA</p>
                        <p className="font-medium text-gray-900">
                            {zone.estimated_delivery_time || "–"} mins
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                    <CurrencyDollarIcon className="h-4 w-4 text-gray-400" />
                    <div>
                        <p className="text-xs text-gray-500">Base Fee</p>
                        <p className="font-medium text-gray-900">
                            ₹{Number(zone.base_delivery_fee || 0).toFixed(2)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                    <MapPinIcon className="h-4 w-4 text-gray-400" />
                    <div>
                        <p className="text-xs text-gray-500">Area</p>
                        <p className="font-medium text-gray-900">
                            {formatAreaSummary(zone.area)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                    <ClockIcon className="h-4 w-4 text-gray-400" />
                    <div>
                        <p className="text-xs text-gray-500">Hours</p>
                        <p className="font-medium text-gray-900">
                            {zone.operating_hours || "Not set"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function AddressZonesPage() {
    const { user } = useAuth();
    const canManage = ["superadmin", "admin"].includes(user?.role);

    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("create");
    const [selectedZone, setSelectedZone] = useState(null);
    const [saving, setSaving] = useState(false);
    const [polygonPoints, setPolygonPoints] = useState([]);
    const [mapInstanceKey, setMapInstanceKey] = useState(0);
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        description: "",
        area: "",
        estimatedDeliveryTime: 10,
        baseDeliveryFee: "0",
        status: "active",
        operatingHours: "",
        isActive: true,
    });

    useEffect(() => {
        loadZones();
    }, []);

    useEffect(() => {
        const geo = pointsToGeoJSON(polygonPoints);
        if (geo) {
            setFormData((prev) => ({
                ...prev,
                area: JSON.stringify(geo, null, 2),
            }));
        } else if (polygonPoints.length === 0 && modalMode === "create") {
            setFormData((prev) => ({ ...prev, area: "" }));
        }
    }, [polygonPoints, modalMode]);

    const loadZones = async () => {
        try {
            setLoading(true);
            const response = await addressZoneAPI.getAll();
            const data =
                response?.data?.zones || response?.data?.data || response?.data;
            setZones(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch address zones", error);
            toast.error(
                error?.response?.data?.message || "Failed to load address zones"
            );
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setModalMode("create");
        setSelectedZone(null);
        setPolygonPoints([]);
        setMapInstanceKey((k) => k + 1);
        setFormData({
            name: "",
            code: "",
            description: "",
            area: "",
            estimated_delivery_time: 10,
            base_delivery_fee: "0",
            status: "active",
            operating_hours: "",
            is_active: true,
        });
        setModalOpen(true);
    };

    const openEditModal = (zone) => {
        setModalMode("edit");
        setSelectedZone(zone);
        let parsedArea = null;
        try {
            parsedArea = parseArea(zone.area);
        } catch (error) {
            parsedArea = null;
        }
        setPolygonPoints(geoJSONToPoints(parsedArea));
        setMapInstanceKey((k) => k + 1);
        setFormData({
            name: zone.name || "",
            code: zone.code || "",
            description: zone.description || "",
            area: getAreaInputString(zone.area),
            estimatedDeliveryTime: zone.estimated_delivery_time || 10,
            baseDeliveryFee: zone.base_delivery_fee ?? "0",
            status: zone.status || "active",
            operatingHours: zone.operating_hours || "",
            isActive: Boolean(zone.is_active),
        });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedZone(null);
    };

    const handleDelete = async (zone) => {
        if (!canManage) return;
        const confirmed = window.confirm(
            `Delete address zone "${zone.name}"? This cannot be undone.`
        );
        if (!confirmed) return;
        try {
            await addressZoneAPI.remove(zone.id);
            toast.success("Address zone deleted");
            loadZones();
        } catch (error) {
            console.error("Failed to delete zone", error);
            toast.error(
                error?.response?.data?.message ||
                    "Failed to delete address zone"
            );
        }
    };

    const parseArea = (value) => {
        if (!value) return null;
        if (typeof value === "object") return value;
        try {
            return JSON.parse(value);
        } catch (error) {
            throw new Error("Area must be valid GeoJSON (e.g., Polygon)");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canManage) return;

        const trimmedName = formData.name.trim();
        const trimmedCode = formData.code.trim();
        if (!trimmedName || !trimmedCode) {
            toast.error("Name and code are required");
            return;
        }

        let parsedArea = pointsToGeoJSON(polygonPoints);
        if (!parsedArea) {
            try {
                parsedArea = parseArea(formData.area);
            } catch (err) {
                toast.error(err.message);
                return;
            }
        }

        if (!parsedArea) {
            toast.error("Area is required (provide GeoJSON polygon)");
            return;
        }

        const payload = {
            name: trimmedName,
            code: trimmedCode,
            description: formData.description?.trim() || null,
            area: parsedArea,
            estimatedDeliveryTime: Number(formData.estimatedDeliveryTime) || 0,
            baseDeliveryFee: Number(formData.baseDeliveryFee) || 0,
            status: formData.status,
            operatingHours: formData.operatingHours?.trim() || null,
            isActive: Boolean(formData.isActive),
        };

        try {
            setSaving(true);
            if (modalMode === "edit" && selectedZone?.id) {
                await addressZoneAPI.update(selectedZone.id, payload);
                toast.success("Address zone updated");
            } else {
                await addressZoneAPI.create(payload);
                toast.success("Address zone created");
            }
            closeModal();
            loadZones();
        } catch (error) {
            console.error("Failed to save address zone", error);
            toast.error(
                error?.response?.data?.message || "Failed to save address zone"
            );
        } finally {
            setSaving(false);
        }
    };

    const filteredZones = useMemo(() => {
        const term = search.toLowerCase();
        return zones.filter((zone) => {
            const matchesSearch =
                zone.name?.toLowerCase().includes(term) ||
                zone.code?.toLowerCase().includes(term) ||
                zone.description?.toLowerCase().includes(term);
            const matchesStatus =
                statusFilter === "all" || zone.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [zones, search, statusFilter]);

    const handleAreaBlur = () => {
        if (!formData.area) return;
        try {
            const parsed = parseArea(formData.area);
            const pts = geoJSONToPoints(parsed);
            if (pts.length >= 3) {
                setPolygonPoints(pts);
            }
        } catch (error) {
            // ignore invalid input; map selection stays unchanged
        }
    };

    if (!user) {
        return null;
    }

    const canView = ["superadmin", "admin"].includes(user.role);

    if (!canView) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900">
                        Access Denied
                    </h3>
                    <p className="text-gray-600">
                        You don't have permission to view address zones.
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
                        Address Zones
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage delivery coverage areas, fees, and availability
                    </p>
                </div>
                {canManage && (
                    <button onClick={openCreateModal} className="btn-primary">
                        <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
                        Add Zone
                    </button>
                )}
            </div>

            <div className="card p-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, code, or description"
                            className="input-field pl-10"
                        />
                    </div>
                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="input-field"
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="maintenance">Maintenance</option>
                        </select>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center justify-end">
                        Showing {filteredZones.length} of {zones.length} zones
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-gray-200 border-t-primary-600 rounded-full animate-spin"></div>
                </div>
            ) : filteredZones.length === 0 ? (
                <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                        <MapPinIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900">
                        No address zones found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {search || statusFilter !== "all"
                            ? "Try adjusting your search or filters."
                            : "Create a new address zone to get started."}
                    </p>
                    {canManage && (
                        <button
                            className="btn-primary mt-4"
                            onClick={openCreateModal}
                        >
                            <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
                            Add Zone
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredZones.map((zone) => (
                        <ZoneCard
                            key={zone.id}
                            zone={zone}
                            onEdit={openEditModal}
                            onDelete={handleDelete}
                            canManage={canManage}
                        />
                    ))}
                </div>
            )}

            <Modal
                isOpen={modalOpen}
                onClose={closeModal}
                title={
                    modalMode === "edit"
                        ? "Edit Address Zone"
                        : "Add Address Zone"
                }
                footer={null}
                maxWidth="sm:max-w-2xl"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name
                            </label>
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
                                placeholder="Zone name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Code
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.code}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        code: e.target.value,
                                    })
                                }
                                className="input-field"
                                placeholder="Unique code"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    description: e.target.value,
                                })
                            }
                            rows={2}
                            className="input-field"
                            placeholder="Optional description"
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Area (draw on map)
                                </label>
                                <p className="text-xs text-gray-500">
                                    Click to add vertices; we save a GeoJSON
                                    polygon.
                                </p>
                            </div>
                            {polygonPoints.length >= 3 && (
                                <span className="text-xs text-emerald-600">
                                    Polygon ready
                                </span>
                            )}
                        </div>

                        <MapAreaPicker
                            points={polygonPoints}
                            onChangePoints={setPolygonPoints}
                            mapKey={mapInstanceKey}
                        />

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-sm font-medium text-gray-700">
                                    Or paste GeoJSON (Polygon)
                                </label>
                                <span className="text-xs text-gray-500">
                                    We will sync it to the map on blur
                                </span>
                            </div>
                            <textarea
                                required
                                value={formData.area}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        area: e.target.value,
                                    })
                                }
                                onBlur={handleAreaBlur}
                                rows={5}
                                className="input-field font-mono text-xs"
                                placeholder='{"type":"Polygon","coordinates":[[[lng,lat],[lng,lat],[lng,lat],[lng,lat],[lng,lat]]]}'
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Estimated Delivery Time (mins)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.estimatedDeliveryTime}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        estimatedDeliveryTime: e.target.value,
                                    })
                                }
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Base Delivery Fee
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.baseDeliveryFee}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        baseDeliveryFee: e.target.value,
                                    })
                                }
                                className="input-field"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
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
                                <option value="maintenance">Maintenance</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Operating Hours
                            </label>
                            <input
                                type="text"
                                value={formData.operatingHours}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        operatingHours: e.target.value,
                                    })
                                }
                                className="input-field"
                                placeholder="e.g., 06:00-23:00"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <input
                            id="isActive"
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    isActive: e.target.checked,
                                })
                            }
                            className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                        />
                        <label
                            htmlFor="isActive"
                            className="text-sm text-gray-700"
                        >
                            Active
                        </label>
                    </div>

                    {!canManage && (
                        <p className="text-sm text-amber-600">
                            You have view-only access. Contact an admin to
                            modify zones.
                        </p>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                        {canManage && (
                            <button
                                type="submit"
                                disabled={saving}
                                className="btn-primary"
                            >
                                {saving
                                    ? "Saving..."
                                    : modalMode === "edit"
                                    ? "Update Zone"
                                    : "Create Zone"}
                            </button>
                        )}
                    </div>
                </form>
            </Modal>
        </div>
    );
}
