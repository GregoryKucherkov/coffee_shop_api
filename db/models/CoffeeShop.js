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

    size: {
        type: DataTypes.ENUM(...drinkSize),
        allowNull: false,
    },

    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: true,
    },
});

// Menu.sync();
// Menu.sync({ alter: true });

export const createMenuItemSchema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    category: Joi.string().min(3).max(30).required(),
    description: Joi.string().min(3).max(30).required(),
    size: Joi.string()
        .valid(...drinkSize)
        .required(),
    price: Joi.number().precision(2).required(),
    image_url: Joi.string().uri().required(),
});

export const updateMenuItemSchema = Joi.object({
    name: Joi.string().min(3).max(30),
    category: Joi.string().min(3).max(30),
    description: Joi.string().min(3).max(30),
    size: Joi.string().valid(...drinkSize),
    price: Joi.number().precision(2),
    image_url: Joi.string().uri(),
});

export default Menu;
