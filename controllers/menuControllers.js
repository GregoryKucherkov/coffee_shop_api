import * as menuService from "../services/menuService.js";

import HttpError from "../utils/HttpError.js";

import { cntrlWrapper } from "../decorators/cntrlWrapper.js";

export const getAllMenu = cntrlWrapper(async (req, res, next) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const safePage = page < 1 ? 1 : page;
    const offset = (safePage - 1) * limit;

    const allMenu = await menuService.allMenu({
        offset,
        limit,
    });

    res.json({
        status: "success",
        code: 200,
        data: allMenu,
    });
});

export const getMenuItem = cntrlWrapper(async (req, res, next) => {
    const { id } = req.params;

    const item = await menuService.getMenuItem({ id });
    if (!item) {
        throw HttpError(404, "Item was not found!");
    }

    res.json({
        status: "success",
        code: 200,
        data: item,
    });
});

export const createMenuItem = cntrlWrapper(async (req, res, next) => {
    const { role } = req.user;

    if (role !== "admin") {
        throw HttpError(403, "Access denied. Only admins can add menu items.");
    }

    const item = await menuService.createItem(req.body);

    res.json({
        status: "success",
        code: 201,
        data: item,
    });
});

export const updateItem = cntrlWrapper(async (req, res, next) => {
    const { role } = req.user;
    const { id } = req.params;

    if (role !== "admin") {
        throw HttpError(403, "Access denied. Only admins can edit menu items.");
    }

    const item = await menuService.updateItem({ id }, req.body);
    if (!item) {
        throw HttpError(404, "Item was not found!");
    }

    res.json({
        status: "success",
        code: 200,
        data: item,
    });
});

export const deleteItem = cntrlWrapper(async (req, res, next) => {
    const { role } = req.user;
    const { id } = req.params;

    if (role !== "admin") {
        throw HttpError(
            403,
            "Access denied. Only admins can delete menu items.",
        );
    }

    const itemToDelete = await menuService.deleteItem({ id });
    if (!itemToDelete) {
        throw HttpError(404, "Item was not found!");
    }

    res.json({
        status: "deleted",
        code: 200,
        data: itemToDelete,
    });
});
