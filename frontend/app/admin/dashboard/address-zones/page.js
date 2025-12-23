"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
    PlusIcon,
    PencilSquareIcon,
    TrashIcon,
    MapPinIcon,
    ClockIcon,
    CurrencyRupeeIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import Modal from "@/admin/components/Modal";
import { addressZoneAPI } from "@/admin/lib/api";
import { mappls } from "mappls-web-maps";

const mapplsClassObject = new mappls();

const defaultForm = {
    name: "",
    code: "",
    description: "",
    area: "",
    estimatedDeliveryTime: "10",
    baseDeliveryFee: "0.00",
    status: "active",
    operatingHours: "",
    isActive: 1,
};

const StatusBadge = ({ status }) => {
    const styles = {
        active: "bg-emerald-50 text-emerald-700 border-emerald-100",
        inactive: "bg-gray-50 text-gray-600 border-gray-100",
        maintenance: "bg-amber-50 text-amber-700 border-amber-100",
    };
    const cls = styles[status] || styles.inactive;
    return (
        <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${cls}`}
        >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {status?.replace(/_/g, " ") || "unknown"}
        </span>
    );
};

const parsePolygonFromArea = (area) => {
    try {
        const parsed = JSON.parse(area || "null");
        if (
            parsed?.type === "Polygon" &&
            Array.isArray(parsed.coordinates?.[0])
        ) {
            return parsed.coordinates[0]
                .slice(0, -1)
                .map(([lng, lat]) => ({ lat, lng }));
        }
    } catch (err) {
        return [];
    }
    return [];
};

const buildGeoJson = (path) => {
    if (!path || path.length < 3) return "";
    const coords = path.map((p) => [p.lng, p.lat]);
    coords.push([path[0].lng, path[0].lat]);
    return JSON.stringify({ type: "Polygon", coordinates: [coords] });
};

const MapplsMap = ({
    polygonPath,
    setPolygonPath,
    setMapError,
    mapId,
    initialPath,
}) => {
    const mapRef = useRef(null);
    const polygonRef = useRef(null);
    const markersRef = useRef([]);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tempPoints, setTempPoints] = useState([]);
    const clickHandlerRef = useRef(null);

    const mapplsToken = process.env.NEXT_PUBLIC_MAPPLS_API_KEY;

    const clearMarkers = useCallback(() => {
        markersRef.current.forEach((m) => {
            try {
                m.remove?.();
            } catch (e) {}
        });
        markersRef.current = [];
    }, []);

    const drawPolygon = useCallback((path) => {
        if (!mapRef.current || path.length < 3) return;
        if (polygonRef.current) {
            try {
                polygonRef.current.remove?.();
            } catch (e) {}
        }
        const coords = path.map((p) => [p.lng, p.lat]);
        coords.push([path[0].lng, path[0].lat]);

        polygonRef.current = mapplsClassObject.Polygon({
            map: mapRef.current,
            paths: coords,
            fillColor: "#22c55e",
            fillOpacity: 0.15,
            strokeColor: "#16a34a",
            strokeOpacity: 0.8,
            strokeWeight: 2,
        });
    }, []);

    useEffect(() => {
        if (!mapplsToken) {
            setMapError("Mappls API key is missing");
            return;
        }

        const loadObject = {
            map: true,
            layer: "raster",
            version: "3.0",
        };

        mapplsClassObject.initialize(mapplsToken, loadObject, () => {
            const center =
                initialPath && initialPath.length > 0
                    ? [initialPath[0].lat, initialPath[0].lng]
                    : [28.6139, 77.209];

            const newMap = mapplsClassObject.Map({
                id: mapId,
                properties: {
                    center: center,
                    zoom: 12,
                    zoomControl: true,
                },
            });

            newMap.on("load", () => {
                setIsMapLoaded(true);
                mapRef.current = newMap;

                if (initialPath && initialPath.length >= 3) {
                    drawPolygon(initialPath);
                }
            });
        });

        return () => {
            if (mapRef.current) {
                try {
                    mapRef.current.remove?.();
                } catch (e) {}
            }
        };
    }, [mapplsToken, mapId, initialPath, drawPolygon, setMapError]);

    useEffect(() => {
        if (isMapLoaded && polygonPath.length >= 3) {
            drawPolygon(polygonPath);
        }
    }, [polygonPath, isMapLoaded, drawPolygon]);

    useEffect(() => {
        if (!mapRef.current || !isMapLoaded) return;

        if (clickHandlerRef.current) {
            mapRef.current.off?.("click", clickHandlerRef.current);
        }

        if (isDrawing) {
            clickHandlerRef.current = (e) => {
                const point = { lat: e.lngLat.lat, lng: e.lngLat.lng };
                setTempPoints((prev) => [...prev, point]);

                try {
                    const marker = mapplsClassObject.Marker({
                        map: mapRef.current,
                        position: [point.lat, point.lng],
                    });
                    markersRef.current.push(marker);
                } catch (err) {
                    console.error("Marker error:", err);
                }
            };
            mapRef.current.on("click", clickHandlerRef.current);
        }

        return () => {
            if (mapRef.current && clickHandlerRef.current) {
                mapRef.current.off?.("click", clickHandlerRef.current);
            }
        };
    }, [isDrawing, isMapLoaded]);

    const handleStartDrawing = () => {
        setIsDrawing(true);
        setTempPoints([]);
        clearMarkers();
        if (polygonRef.current) {
            try {
                polygonRef.current.remove?.();
            } catch (e) {}
            polygonRef.current = null;
        }
        setMapError("");
    };

    const handleFinishDrawing = () => {
        if (tempPoints.length < 3) {
            setMapError("Please click at least 3 points to create a polygon");
            return;
        }
        setIsDrawing(false);
        clearMarkers();
        setPolygonPath(tempPoints);
        drawPolygon(tempPoints);
        setTempPoints([]);
    };

    const handleClearDrawing = () => {
        setIsDrawing(false);
        setTempPoints([]);
        clearMarkers();
        if (polygonRef.current) {
            try {
                polygonRef.current.remove?.();
            } catch (e) {}
            polygonRef.current = null;
        }
        setPolygonPath([]);
    };

    if (!mapplsToken) {
        return (
            <div className="h-full flex items-center justify-center text-sm text-rose-500 bg-rose-50">
                Mappls API key is missing. Set NEXT_PUBLIC_MAPPLS_API_KEY.
            </div>
        );
    }

    return (
        <div className="relative h-full">
            <div id={mapId} style={{ width: "100%", height: "100%" }} />
            {!isMapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-500">
                    Loading map...
                </div>
            )}
            {isMapLoaded && (
                <div className="absolute top-3 right-3 flex gap-2 z-10">
                    {!isDrawing ? (
                        <button
                            type="button"
                            onClick={handleStartDrawing}
                            className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50"
                        >
                            Draw Polygon
                        </button>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={handleFinishDrawing}
                                className="px-3 py-1.5 text-xs font-medium bg-emerald-500 text-white rounded-lg shadow-sm hover:bg-emerald-600"
                            >
                                Finish ({tempPoints.length} pts)
                            </button>
                            <button
                                type="button"
                                onClick={handleClearDrawing}
                                className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </>
                    )}
                    {polygonPath.length >= 3 && !isDrawing && (
                        <button
                            type="button"
                            onClick={handleClearDrawing}
                            className="px-3 py-1.5 text-xs font-medium bg-rose-50 text-rose-600 border border-rose-200 rounded-lg shadow-sm hover:bg-rose-100"
                        >
                            Clear
                        </button>
                    )}
                </div>
            )}
            {isDrawing && (
                <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-lg text-xs text-gray-600 text-center z-10">
                    Click on the map to add points. Need at least 3 points.
                </div>
            )}
        </div>
    );
};

const ZoneForm = ({
    formData,
    setFormData,
    onSubmit,
    loading,
    isEdit,
    polygonPath,
    setPolygonPath,
    mapError,
    setMapError,
    mapId,
}) => {
    const [initialPath] = useState(() => parsePolygonFromArea(formData.area));

    useEffect(() => {
        const geo = buildGeoJson(polygonPath);
        setFormData((prev) => ({ ...prev, area: geo }));
    }, [polygonPath, setFormData]);

    return (
        <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="input-label">Name *</label>
                    <input
                        required
                        value={formData.name}
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                        }
                        className="input-field"
                        placeholder="Central Zone"
                    />
                </div>
                <div>
                    <label className="input-label">Code *</label>
                    <input
                        required
                        value={formData.code}
                        onChange={(e) =>
                            setFormData({ ...formData, code: e.target.value })
                        }
                        className="input-field"
                        placeholder="CZ-001"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="input-label">Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                description: e.target.value,
                            })
                        }
                        className="input-field min-h-[80px]"
                        placeholder="Short description of this zone"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="input-label">Draw Zone on Map *</label>
                    <div className="h-[360px] rounded-xl overflow-hidden border border-gray-200">
                        <MapplsMap
                            polygonPath={polygonPath}
                            setPolygonPath={setPolygonPath}
                            setMapError={setMapError}
                            mapId={mapId}
                            initialPath={initialPath}
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Click "Draw Polygon" then click on the map to add
                        points. Click "Finish" when done.
                    </p>
                    {mapError && (
                        <p className="text-xs text-rose-500 mt-1">{mapError}</p>
                    )}
                </div>
                <div>
                    <label className="input-label">
                        Est. Delivery Time (mins)
                    </label>
                    <input
                        type="number"
                        min="1"
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
                    <label className="input-label">Base Delivery Fee</label>
                    <input
                        type="number"
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
                <div>
                    <label className="input-label">Status</label>
                    <select
                        value={formData.status}
                        onChange={(e) =>
                            setFormData({ ...formData, status: e.target.value })
                        }
                        className="input-field"
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="maintenance">Maintenance</option>
                    </select>
                </div>
                <div>
                    <label className="input-label">Operating Hours</label>
                    <input
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
                <div>
                    <label className="input-label">Active?</label>
                    <select
                        value={formData.isActive}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                isActive: Number(e.target.value),
                            })
                        }
                        className="input-field"
                    >
                        <option value={1}>Yes</option>
                        <option value={0}>No</option>
                    </select>
                </div>
            </div>

            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={() => onSubmit(null, true)}
                    className="btn-secondary"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                >
                    {loading
                        ? "Saving..."
                        : isEdit
                        ? "Update Zone"
                        : "Add Zone"}
                </button>
            </div>
        </form>
    );
};

export default function AddressZonesPage() {
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingZone, setEditingZone] = useState(null);
    const [formData, setFormData] = useState(defaultForm);
    const [polygonPath, setPolygonPath] = useState([]);
    const [mapError, setMapError] = useState("");
    const [mapKey, setMapKey] = useState(0);

    const loadZones = async () => {
        try {
            setLoading(true);
            const { data } = await addressZoneAPI.getAll();
            setZones(data?.zones || []);
        } catch (error) {
            console.error(error);
            toast.error(
                error?.response?.data?.message || "Failed to load address zones"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadZones();
    }, []);

    const openCreate = () => {
        setEditingZone(null);
        setFormData(defaultForm);
        setPolygonPath([]);
        setMapError("");
        setMapKey((k) => k + 1);
        setModalOpen(true);
    };

    const openEdit = (zone) => {
        setEditingZone(zone);
        const initialData = {
            name: zone.name || "",
            code: zone.code || "",
            description: zone.description || "",
            area: zone.area || "",
            estimatedDeliveryTime:
                zone.estimated_delivery_time ??
                zone.estimatedDeliveryTime ??
                "",
            baseDeliveryFee:
                zone.base_delivery_fee ?? zone.baseDeliveryFee ?? "",
            status: zone.status || "active",
            operatingHours: zone.operating_hours ?? zone.operatingHours ?? "",
            isActive: zone.is_active ?? zone.isActive ?? 1,
        };
        setFormData(initialData);
        setPolygonPath(parsePolygonFromArea(zone.area));
        setMapError("");
        setMapKey((k) => k + 1);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingZone(null);
        setFormData(defaultForm);
        setPolygonPath([]);
        setMapError("");
    };

    const handleSubmit = async (e, cancelled = false) => {
        if (cancelled) {
            closeModal();
            return;
        }
        e.preventDefault();

        if (polygonPath.length < 3) {
            setMapError("Please draw a polygon to define the delivery zone.");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                ...formData,
                estimatedDeliveryTime: Number(formData.estimatedDeliveryTime),
                baseDeliveryFee: formData.baseDeliveryFee,
                isActive: Number(formData.isActive),
            };

            if (editingZone) {
                await addressZoneAPI.update(editingZone.id, payload);
                toast.success("Zone updated");
            } else {
                await addressZoneAPI.create(payload);
                toast.success("Zone added");
            }
            closeModal();
            await loadZones();
        } catch (error) {
            console.error(error);
            toast.error(
                error?.response?.data?.message || "Failed to save address zone"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (zone) => {
        const ok = window.confirm(
            `Delete zone "${zone.name}"? This action cannot be undone.`
        );
        if (!ok) return;
        try {
            await addressZoneAPI.remove(zone.id);
            toast.success("Zone deleted");
            await loadZones();
        } catch (error) {
            console.error(error);
            toast.error(
                error?.response?.data?.message ||
                    "Failed to delete address zone"
            );
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-primary-600 mb-1">
                        Logistics
                    </p>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Address Zones
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage delivery zones used for routing and pricing.
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    className="btn-primary inline-flex items-center gap-2"
                >
                    <PlusIcon className="h-4 w-4" />
                    Add Zone
                </button>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
                {loading ? (
                    <div className="py-12 text-center text-gray-500">
                        Loading zones...
                    </div>
                ) : zones.length === 0 ? (
                    <div className="py-12 text-center">
                        <div className="mx-auto h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                            <MapPinIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-gray-600 font-medium">
                            No address zones yet
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Create your first zone to get started.
                        </p>
                        <button
                            onClick={openCreate}
                            className="btn-primary mt-4 inline-flex items-center gap-2"
                        >
                            <PlusIcon className="h-4 w-4" /> Add Zone
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {zones.map((zone) => (
                            <div
                                key={zone.id}
                                className="border border-gray-100 rounded-xl p-4 bg-gradient-to-br from-white to-slate-50/60 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-lime-500 flex items-center justify-center text-white font-semibold">
                                                {zone.name?.[0]?.toUpperCase() ||
                                                    "Z"}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {zone.name || "Unnamed"}
                                                </h3>
                                                <p className="text-xs font-mono text-gray-500">
                                                    {zone.code}
                                                </p>
                                            </div>
                                        </div>
                                        {zone.description && (
                                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                                {zone.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <StatusBadge status={zone.status} />
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => openEdit(zone)}
                                                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                                            >
                                                <PencilSquareIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(zone)
                                                }
                                                className="p-2 rounded-lg hover:bg-rose-50 text-rose-500"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <ClockIcon className="h-4 w-4 text-gray-400" />
                                        <span>
                                            {zone.estimated_delivery_time ??
                                                zone.estimatedDeliveryTime ??
                                                "--"}{" "}
                                            min
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CurrencyRupeeIcon className="h-4 w-4 text-gray-400" />
                                        <span>
                                            {zone.base_delivery_fee ??
                                                zone.baseDeliveryFee ??
                                                "0"}
                                        </span>
                                    </div>
                                    <div className="col-span-2 text-xs font-mono bg-gray-50 border border-gray-100 rounded-lg p-2 overflow-hidden">
                                        <div className="text-gray-400 mb-1">
                                            Area
                                        </div>
                                        <div className="text-gray-700 break-all line-clamp-2">
                                            {zone.area || "--"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Modal
                isOpen={modalOpen}
                onClose={closeModal}
                title={editingZone ? "Edit Address Zone" : "Add Address Zone"}
                footer={null}
                maxWidth="sm:max-w-2xl"
            >
                <ZoneForm
                    key={mapKey}
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleSubmit}
                    loading={saving}
                    isEdit={!!editingZone}
                    polygonPath={polygonPath}
                    setPolygonPath={setPolygonPath}
                    mapError={mapError}
                    setMapError={setMapError}
                    mapId={`mappls-zone-map-${mapKey}`}
                />
            </Modal>
        </div>
    );
}
