import express from "express";

const router = express.Router();
router.all("*", (_req, res) => res.status(404).json({ success: false, message: "Notifications feature removed" }));

export default router;