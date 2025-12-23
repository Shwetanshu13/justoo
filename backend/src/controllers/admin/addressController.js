import db from "../../config/db.js";
import { eq } from "drizzle-orm";
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

        const [newZone] = await db
            .insert(addressZones)
            .values({
                name,
                code,
                description,
                area,
                estimatedDeliveryTime,
                baseDeliveryFee,
                status,
                operatingHours,
                isActive,
            })
            .returning();

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
        const zones = await db.select().from(addressZones);
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

        const [updatedZone] = await db
            .update(addressZones)
            .set({
                name,
                code,
                description,
                area,
                estimatedDeliveryTime,
                baseDeliveryFee,
                status,
                operatingHours,
                isActive,
            })
            .where(eq(addressZones.id, zoneId))
            .returning();

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
