import express from "express";
import auth from "../../middlewares/adminAuth.js";
import { requireAnyAdmin } from "../../middlewares/roleMiddleware.js";
import * as addressController from "../../controllers/admin/addressController.js";

const router = express.Router();
// Protect all admin routes with authentication
router.use(auth);
router.use(requireAnyAdmin);

// Address Zone management (Any Admin)
router.post("/address-zones", addressController.addAddressZone);
router.get("/address-zones", addressController.getAllAddressZones);
router.put("/address-zones/:id", addressController.updateAddressZone);
router.delete("/address-zones/:id", addressController.deleteAddressZone);

export default router;
