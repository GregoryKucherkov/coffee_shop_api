import { DataTypes } from "sequelize";
import sequelize from "../Sequelize.js";
import Joi from "joi";
import { drinkSize } from "../../constants/cofeeShop.js";

const OrderItem = sequelize.define("OrderItem", {
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    menuItemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    size: {
        type: DataTypes.ENUM(...drinkSize),
        allowNull: true,
        defaultValue: null,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
});

export const createOrderSchema = Joi.object({
    items: Joi.array()
        .items(
            Joi.object({
                menuItemId: Joi.number().integer().required(),
                quantity: Joi.number().integer().min(1).required(),
                size: Joi.string()
                    .valid(...drinkSize)
                    .optional(),
            }),
        )
        .min(1)
        .required(),
});

export default OrderItem;
