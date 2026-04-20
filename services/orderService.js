import HttpError from "../utils/HttpError.js";
import Stripe from "stripe";

import { sequelize, Menu, Order, OrderItem } from "../db/models/index.js";
import { envConfig } from "../envConfig.js";
import { PAYMENTSTATUS } from "../constants/orderStatus.js";

const { STRIPE_SECRET_KEY } = envConfig;

const stripe = new Stripe(STRIPE_SECRET_KEY);

export const placeOrder = async (userId, items) => {
    const itemIds = items.map((i) => i.menuItemId);
    const menuItems = await Menu.findAll({ where: { id: itemIds } });

    const menuMap = Object.fromEntries(menuItems.map((m) => [m.id, m]));

    let total = 0;

    const itemsData = items.map((cartItem) => {
        const product = menuMap[cartItem.menuItemId];
        if (!product) {
            throw HttpError(
                404,
                `Item with ID ${cartItem.menuItemId} not found`,
            );
        }

        const subtotal = Number(product.price) * cartItem.quantity;
        total += subtotal;

        return {
            menuItemId: cartItem.menuItemId,
            quantity: cartItem.quantity,
            price: product.price, // Save snapshot of price
            size: cartItem.size || null,
        };
    });

    return await sequelize.transaction(async (t) => {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(total * 100), // Convert to cents (e.g., 10.50 -> 1050)
            currency: "eur",
            automatic_payment_methods: { enabled: true },
        });

        const newOrder = await Order.create(
            {
                userId,
                totalPrice: total,
                status: PAYMENTSTATUS[0],
                stripePaymentId: paymentIntent.id,
            },
            { transaction: t },
        );

        const finalOrderItems = itemsData.map((item) => ({
            ...item,
            orderId: newOrder.id,
        }));

        await OrderItem.bulkCreate(finalOrderItems, { transaction: t });

        return {
            order: newOrder,
            items: finalOrderItems,
            clientSecret: paymentIntent.client_secret,
        };
    });
};

export const getUserOrders = ({ userId, offset, limit }) => {
    return Order.findAll({
        where: { userId },
        offset,
        limit: Number(limit),
        include: [
            {
                model: OrderItem,
                include: [{ model: Menu, attributes: ["name", "price"] }],
            },
        ],
        order: [["createdAt", "DESC"]],
    });
};

export const getOrderById = (query) => {
    return Order.findOne({
        where: query,
        include: [
            {
                model: OrderItem,
                include: [{ model: Menu, attributes: ["name", "price"] }],
            },
        ],
    });
};

export const getAllOrders = ({ offset, limit }) => {
    return Order.findAll({
        offset,
        limit: Number(limit),
        include: [
            {
                model: OrderItem,
                include: [{ model: Menu, attributes: ["name", "price"] }],
            },
        ],
        order: [["createdAt", "DESC"]],
    });
};

export const updateOrderStatus = async (stripeId, status) => {
    const order = await Order.findOne({
        where: { stripePaymentId: stripeId },
    });

    if (!order) {
        return null;
    }

    return await order.update({ status });
};
