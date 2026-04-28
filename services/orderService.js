import HttpError from "../utils/HttpError.js";
import Stripe from "stripe";

import {
    sequelize,
    Menu,
    Order,
    OrderItem,
    Bonuses,
    User,
} from "../db/models/index.js";
import { envConfig } from "../envConfig.js";
import { PAYMENTSTATUS } from "../constants/orderStatus.js";

const { STRIPE_SECRET_KEY } = envConfig;

const stripe = new Stripe(STRIPE_SECRET_KEY);

export const placeOrder = async (userId, items, useBonus = false) => {
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
        let appliedDiscount = 0;

        if (useBonus) {
            const user = await User.findByPk(userId, {
                attributes: ["id", "totalBonus"],
                transaction: t,
            });
            const userBalance = Number(user.totalBonus);

            if (userBalance > 0) {
                appliedDiscount = Math.min(total, userBalance);

                total -= appliedDiscount;

                await user.decrement("totalBonus", {
                    by: appliedDiscount,
                    transaction: t,
                });
            }
        }

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

        if (appliedDiscount > 0) {
            await Bonuses.create(
                {
                    userId,
                    amount: -appliedDiscount, // Negative because they spent it
                    orderId: newOrder.id,
                },
                { transaction: t },
            );
        }

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
                include: [
                    { model: Menu, attributes: ["name", "price", "image_url"] },
                ],
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
                include: [
                    { model: Menu, attributes: ["name", "price", "image_url"] },
                ],
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
                include: [
                    { model: Menu, attributes: ["name", "price", "image_url"] },
                ],
            },
        ],
        order: [["createdAt", "DESC"]],
    });
};

export const updateOrderStatus = async (stripeId, status, userId = null) => {
    const query = { stripePaymentId: stripeId };

    if (userId) {
        query.userId = userId;
    }

    const order = await Order.findOne({ where: query });

    if (!order) {
        return null;
    }

    if (status === PAYMENTSTATUS[1] && order.status !== PAYMENTSTATUS[1]) {
        const bonusAmount = Number(order.totalPrice) * 0.03;

        await sequelize.transaction(async (t) => {
            await Bonuses.create(
                {
                    userId: order.userId,
                    amount: bonusAmount,
                    orderId: order.id,
                },
                { transaction: t },
            );

            await User.increment(
                { totalBonus: bonusAmount },
                { where: { id: order.userId }, transaction: t },
            );
        });
    }

    return await order.update({ status });
};
