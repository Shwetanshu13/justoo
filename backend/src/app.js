import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import env from "./config/env.js";
import errorHandler from "./middlewares/errorHandler.js";

// Admin domain routes
import adminAuthRoutes from "./routes/admin/authRoutes.js";
import adminRoutes from "./routes/admin/adminRoutes.js";
import adminInventoryRoutes from "./routes/admin/inventoryRoutes.js";
import adminInventoryAdminRoutes from "./routes/admin/inventoryAdminRoutes.js";
import adminOrderRoutes from "./routes/admin/orderRoutes.js";
import adminRiderRoutes from "./routes/admin/riderRoutes.js";
import adminAddressRoutes from "./routes/admin/addressRoutes.js";

// Customer domain routes
import customerAuthRoutes from "./routes/customer/authRoutes.js";
import customerItemRoutes from "./routes/customer/itemRoutes.js";
import customerCartRoutes from "./routes/customer/cartRoutes.js";
import customerOrderRoutes from "./routes/customer/orderRoutes.js";
import customerAddressRoutes from "./routes/customer/addressRoutes.js";

// Inventory domain routes
import inventoryAuthRoutes from "./routes/inventory/authRoutes.js";
import inventoryRoutes from "./routes/inventory/inventoryRoutes.js";
import inventoryOrderRoutes from "./routes/inventory/orderRoutes.js";

// Rider domain routes
import riderAuthRoute from "./routes/rider/authRoute.js";
import riderOrderRoute from "./routes/rider/orderRoute.js";
import riderRoute from "./routes/rider/riderRoute.js";
import riderDeliveryRoute from "./routes/rider/deliveryRoute.js";

const app = express();
app.set("trust proxy", 1);

const allowCredentials = env.CORS_ORIGINS && env.CORS_ORIGINS.length > 0;
app.use(
    cors({
        origin: allowCredentials ? env.CORS_ORIGINS : "*",
        credentials: allowCredentials,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    })
);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Admin routes
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/inventory", adminInventoryRoutes);
app.use("/api/admin/inventory-admins", adminInventoryAdminRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/riders", adminRiderRoutes);
app.use("/api/admin/address", adminAddressRoutes);

// Customer routes
app.use("/api/customer/auth", customerAuthRoutes);
app.use("/api/customer/items", customerItemRoutes);
app.use("/api/customer/cart", customerCartRoutes);
app.use("/api/customer/orders", customerOrderRoutes);
app.use("/api/customer/addresses", customerAddressRoutes);

// Inventory routes
app.use("/api/inventory/auth", inventoryAuthRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/inventory/orders", inventoryOrderRoutes);

// Rider routes
app.use("/api/rider/auth", riderAuthRoute);
app.use("/api/rider/order", riderOrderRoute);
app.use("/api/rider/rider", riderRoute);
app.use("/api/rider/delivery", riderDeliveryRoute);

// Health
app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        message: "Monolith backend running",
        timestamp: new Date().toISOString(),
    });
});

// Global error handler
app.use(errorHandler);

export default app;
