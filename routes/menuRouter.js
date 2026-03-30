import express from "express";

import {
    getAllMenu,
    getMenuItem,
    deleteItem,
    updateItem,
    createMenuItem,
} from "../controllers/menuControllers.js";

import {
    createMenuItemSchema,
    updateMenuItemSchema,
} from "../db/models/CoffeeShop.js";

import { validateBody } from "../decorators/validateBody.js";
import authenticate from "../middlewares/authenticate.js";

const menuRouter = express.Router();

menuRouter.get("/", getAllMenu);

menuRouter.get("/:id", getMenuItem);

// PROTECTED ROUTES
menuRouter.use(authenticate);

menuRouter.delete("/:id", deleteItem);

menuRouter.post("/", validateBody(createMenuItemSchema), createMenuItem);

menuRouter.put("/:id", validateBody(updateMenuItemSchema), updateItem);

export default menuRouter;
