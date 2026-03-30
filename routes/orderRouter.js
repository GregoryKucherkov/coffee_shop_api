import express from "express";

import {
    createOrder,
    getUserOrders,
    getOrderById,
    getAllOrders,
} from "../controllers/orderController.js";
import authenticate from "../middlewares/authenticate.js";
import { validateBody } from "../decorators/validateBody.js";
import { createOrderSchema } from "../db/models/OrderItems.js";

const orderRouter = express.Router();

orderRouter.use(authenticate);

// CUSTOMER ROUTES
orderRouter.get("/", getUserOrders);
orderRouter.get("/:id", getOrderById);
orderRouter.post("/", validateBody(createOrderSchema), createOrder);

// ADMIN ONLY ROUTES
orderRouter.get("/admin/all", getAllOrders); // See everything
// orderRouter.patch("/:id/status", updateOrderStatus); // Mark as "Ready"

export default orderRouter;
