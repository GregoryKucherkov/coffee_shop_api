import { or } from "sequelize";
import { PAYMENTSTATUS } from "../constants/orderStatus.js";
import { cntrlWrapper } from "../decorators/cntrlWrapper.js";
import { envConfig } from "../envConfig.js";
import * as orderService from "../services/orderService.js";
import HttpError from "../utils/HttpError.js";
import Stripe from "stripe";

const { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } = envConfig;

const stripe = new Stripe(STRIPE_SECRET_KEY);

export const stripeWebhookHandler = cntrlWrapper(async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            STRIPE_WEBHOOK_SECRET,
        );
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the successful payment event
    if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;

        // Use a service to update the order status to "paid"
        // We find the order using the paymentIntent.id
        const updatedOrder = await orderService.updateOrderStatus(
            paymentIntent.id,
            PAYMENTSTATUS[1],
        );
        if (!updatedOrder) {
            console.error(
                `Order not found for Payment ID: ${paymentIntent.id}`,
            );
        }
    } else if (
        event.type === "payment_intent.payment_failed" ||
        event.type === "payment_intent.canceled"
    ) {
        const paymentIntent = event.data.object;
        await orderService.updateOrderStatus(
            paymentIntent.id,
            PAYMENTSTATUS[2],
        ); // "cancelled"

        console.log(`Payment ${paymentIntent.id} failed or was canceled.`);
    }

    res.status(200).json({ received: true });
});

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

export const updatePaymentStatus = cntrlWrapper(async (req, res, next) => {
    const { orderId: stripeId, status } = req.body;
    const { id: userId } = req.user;

    const order = await orderService.updateOrderStatus(
        stripeId,
        status,
        userId,
    );

    if (!order) {
        throw HttpError(404, "Order was not found!");
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
