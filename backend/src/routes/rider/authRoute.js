import express from "express";
import { login, logout, getProfile } from "../../controllers/rider/authController.js";
import { riderAuth as authMiddleware } from "../../middlewares/riderAuth.js";

const router = express.Router();

// Email/Password login endpoint
router.post("/login", login);

// Logout endpoint
router.post("/logout", logout);

// Get user profile (protected route)
router.get("/profile", authMiddleware, getProfile);

// Legacy login endpoint for backward compatibility

export default router;
