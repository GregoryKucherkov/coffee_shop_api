import { DataTypes } from "sequelize";

import sequelize from "../Sequelize.js";

import Joi from "joi";

import { emailRegexp, RIGHTS } from "../../constants/auth.js";

const User = sequelize.define("User", {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM(...RIGHTS),
        allowNull: false,
        defaultValue: RIGHTS[0],
    },
    token: {
        type: DataTypes.STRING,
        defaultValue: null,
    },
});

// User.sync();
// User.sync({ alter: true });

export const authRegisterSchema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().pattern(emailRegexp).max(50).required(),
    password_hash: Joi.string().min(6).max(30).required(),
});

export const authLogInSchema = Joi.object({
    email: Joi.string().pattern(emailRegexp).max(50).required(),
    password_hash: Joi.string().min(6).max(30).required(),
});

export default User;
