import db from "../../config/db.js";
import { eq, sql } from "drizzle-orm";
import { deliveryZones as addressZones } from "../../db/schema.js";

const addAddressZone = async (req, res) => {
    try {
        const {
            name,
            code,
            description,
            area,
            estimatedDeliveryTime,
            baseDeliveryFee,
            status,
            operatingHours,
            isActive,
        } = req.body;

        if (!name || !code || !area) {
            return res
                .status(400)
                .json({ message: "Name, code and area are required" });
        }

        // Convert GeoJSON object to string for PostGIS
        const areaGeoJSON =
            typeof area === "string" ? area : JSON.stringify(area);

        const result = await db.execute(sql`
            INSERT INTO delivery_zones (name, code, description, area, estimated_delivery_time, base_delivery_fee, status, operating_hours, is_active)
            VALUES (
                ${name},
                ${code},
                ${description || null},
                ST_SetSRID(ST_GeomFromGeoJSON(${areaGeoJSON}), 4326),
                ${estimatedDeliveryTime || 10},
                ${baseDeliveryFee || 0},
                ${status || "active"},
                ${operatingHours || null},
                ${isActive !== undefined ? (isActive ? 1 : 0) : 1}
            )
            RETURNING id, name, code, description, ST_AsGeoJSON(area)::json as area, estimated_delivery_time, base_delivery_fee, status, operating_hours, is_active, created_at, updated_at
        `);

        const newZone = result.rows?.[0] || result[0];

        return res.status(201).json({
            message: "Address Zone added successfully",
            zone: newZone,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to add Address Zone",
            error: error.message,
        });
    }
};
const getAllAddressZones = async (req, res) => {
    try {
        const result = await db.execute(sql`
            SELECT id, name, code, description, ST_AsGeoJSON(area)::json as area, 
                   estimated_delivery_time, base_delivery_fee, status, operating_hours, 
                   is_active, created_at, updated_at 
            FROM delivery_zones
        `);
        const zones = result.rows || result;
        // console.log(zones);
        return res.status(200).json({ zones });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch Address Zones",
            error: error.message,
        });
    }
};

const updateAddressZone = async (req, res) => {
    try {
        const zoneId = Number(req.params.id);
        if (Number.isNaN(zoneId)) {
            return res.status(400).json({ message: "Invalid zone id" });
        }

        const {
            name,
            code,
            description,
            area,
            estimatedDeliveryTime,
            baseDeliveryFee,
            status,
            operatingHours,
            isActive,
        } = req.body;

        // Convert GeoJSON object to string for PostGIS if area is provided
        const areaGeoJSON = area
            ? typeof area === "string"
                ? area
                : JSON.stringify(area)
            : null;

        const result = await db.execute(sql`
            UPDATE delivery_zones
            SET 
                name = COALESCE(${name}, name),
                code = COALESCE(${code}, code),
                description = COALESCE(${description}, description),
                area = COALESCE(${
                    areaGeoJSON
                        ? sql`ST_SetSRID(ST_GeomFromGeoJSON(${areaGeoJSON}), 4326)`
                        : sql`area`
                }, area),
                estimated_delivery_time = COALESCE(${estimatedDeliveryTime}, estimated_delivery_time),
                base_delivery_fee = COALESCE(${baseDeliveryFee}, base_delivery_fee),
                status = COALESCE(${status}, status),
                operating_hours = COALESCE(${operatingHours}, operating_hours),
                is_active = COALESCE(${
                    isActive !== undefined ? (isActive ? 1 : 0) : null
                }, is_active),
                updated_at = NOW()
            WHERE id = ${zoneId}
            RETURNING id, name, code, description, ST_AsGeoJSON(area)::json as area, 
                      estimated_delivery_time, base_delivery_fee, status, operating_hours, 
                      is_active, created_at, updated_at
        `);

        const updatedZone = result.rows?.[0] || result[0];

        if (!updatedZone) {
            return res.status(404).json({ message: "Address Zone not found" });
        }

        return res.status(200).json({
            message: "Address Zone updated successfully",
            zone: updatedZone,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to update Address Zone",
            error: error.message,
        });
    }
};

const deleteAddressZone = async (req, res) => {
    try {
        const zoneId = Number(req.params.id);
        if (Number.isNaN(zoneId)) {
            return res.status(400).json({ message: "Invalid zone id" });
        }

        const [deletedZone] = await db
            .delete(addressZones)
            .where(eq(addressZones.id, zoneId))
            .returning();

        if (!deletedZone) {
            return res.status(404).json({ message: "Address Zone not found" });
        }

        return res
            .status(200)
            .json({ message: "Address Zone removed successfully" });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to remove Address Zone",
            error: error.message,
        });
    }
};

export {
    addAddressZone,
    getAllAddressZones,
    updateAddressZone,
    deleteAddressZone,
};
