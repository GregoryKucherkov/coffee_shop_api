import { cntrlWrapper } from "../decorators/cntrlWrapper.js";
import * as orderService from "../services/orderService.js";
import HttpError from "../utils/HttpError.js";

export const createOrder = cntrlWrapper(async (req, res, next) => {
    const { id: userId } = req.user;
    const { items } = req.body;

    const result = await orderService.placeOrder(userId, items);

    res.status(201).json({
        status: "success",
        code: 201,
        data: result,
    });
});

export const getUserOrders = cntrlWrapper(async (req, res, next) => {
    const { id: userId } = req.user;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const safePage = page < 1 ? 1 : page;
    const offset = (safePage - 1) * limit;

    const userOrders = await orderService.getUserOrders({
        userId,
        offset,
        limit,
    });

    res.json({
        status: "success",
        code: 200,
        data: userOrders,
    });
});

export const getOrderById = cntrlWrapper(async (req, res, next) => {
    const { id } = req.params;
    const { id: userId } = req.user;

    const order = await orderService.getOrderById({ id, userId });
    if (!order) {
        throw HttpError(404, "Order was not found");
    }

    res.json({
        status: "success",
        code: 200,
        data: order,
    });
});

// ADMIN ONLY
export const getAllOrders = cntrlWrapper(async (req, res, next) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const safePage = page < 1 ? 1 : page;
    const offset = (safePage - 1) * limit;
    const { role } = req.user;

    if (role !== "admin") {
        throw HttpError(
            403,
            "Access denied. Only admins can check all orders.",
        );
    }

    const allOrders = await orderService.getAllOrders({ offset, limit });

    res.json({
        status: "success",
        code: 200,
        data: allOrders,
    });
});

// export const updateOrderStatus = cntrlWrapper(async (req, res, next) => {
//     const { id } = req.params;
//     const { role } = req.user;
//     const { status } = req.body;

//     if (role !== "admin") {
//         throw HttpError(
//             403,
//             "Access denied. Only admins can update order status.",
//         );
//     }

//     const orderUpdated = await orderService.updateOrderStatus(id, status);

//     if (!orderUpdated) {
//         throw HttpError(404, "Order was not found!");
//     }

//     res.json({
//         status: "success",
//         code: 200,
//         data: orderUpdated,
//     });
// });
