import { DataTypes } from "sequelize";
import sequelize from "../Sequelize.js";
import Joi from "joi";
import { drinkSize } from "../../constants/cofeeShop.js";

const Menu = sequelize.define("Menu", {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    hasSizes: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: true,
    },
});

const Size = sequelize.define("Size", {
    name: { type: DataTypes.ENUM(...drinkSize), allowNull: true },
});

const MenuPrice = sequelize.define("MenuPrice", {
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
});

const priceSchema = Joi.object({
    price: Joi.number().precision(2).positive().required(),
    size: Joi.string()
        .valid(...drinkSize)
        .allow(null)
        .required(),
});

export const createMenuItemSchema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    category: Joi.string().min(3).max(30).required(),
    description: Joi.string().min(3).max(30).required(),
    hasSizes: Joi.boolean().required(),
    prices: Joi.array().items(priceSchema).min(1).required(),
    image_url: Joi.string().uri().required(),
});

export const updateMenuItemSchema = Joi.object({
    name: Joi.string().min(3).max(30),
    category: Joi.string().min(3).max(30),
    description: Joi.string().min(3).max(30),
    hasSizes: Joi.boolean(),
    image_url: Joi.string().uri(),
    prices: Joi.array().items(priceSchema).min(1),
});

export { Menu, Size, MenuPrice };
