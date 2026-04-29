import bcrypt from "bcrypt";

import { Op } from "sequelize";

import { Bonuses, Menu, Order, OrderItem, User } from "../db/models/index.js";

import { generateToken } from "../utils/jwt.js";

import gravatar from "gravatar";

import fs from "node:fs/promises";
import cloudinary from "../utils/cloudinary.js";
import HttpError from "../utils/HttpError.js";

export const findUser = (query) =>
    User.findOne({
        where: query,
    });

export const registerUser = async (data) => {
    const { email, password } = data;

    const user = await User.findOne({
        where: {
            email,
        },
    });

    if (user) {
        throw HttpError(409, "Email already in use");
    }

    const avatarURL = gravatar.url(
        email,
        {
            s: "200",
            r: "pg",
            d: "monsterid",
        },
        true,
    );

    const hashPassword = await bcrypt.hash(password, 10);

    const token = generateToken({ email: newUser.email });

    const newUser = await User.create({
        // ...data,  //can be compromised by adding bonuses, or role
        name: data.name,
        email: data.email,
        password: hashPassword,
        avatarURL,
        token,
    });

    return {
        newUser,
        token,
    };
};

// export const verifyUser = async (verificationToken) => {
//     const user = await findUser({ verificationToken });
//     if (!user) {
//         throw HttpError(404, "User not found or user already verified");
//     }
// };

export const loginUser = async (data) => {
    const { email, password } = data;

    const user = await User.findOne({
        where: {
            email,
        },
    });
    if (!user) {
        throw HttpError(401, "Email or password invalid");
    }

    const passwordCompare = await bcrypt.compare(password, user.password);

    if (!passwordCompare) {
        throw HttpError(401, "Email or password is wrong");
    }

    const payload = {
        email,
    };

    const token = generateToken(payload);

    await user.update({ token });

    return {
        token,
        email: user.email,
        avatarURL: user.avatarURL,
        totalBonus: user.totalBonus,
    };
};

export const logoutUser = async (id) => {
    const user = await findUser({ id });

    if (!user || !user.token) {
        throw HttpError(404, "User not found");
    }

    await user.update({ token: null });
};

export const updateAvatar = async (userId, file) => {
    if (!file) {
        throw HttpError(400, "No file uploaded");
    }

    const user = await User.findByPk(userId);

    if (!user) {
        await fs.unlink(file.path);
        throw HttpError(404, "User not found");
    }

    const { secure_url } = await cloudinary.uploader.upload(file.path, {
        folder: "coffee_shop/avatars",
        transformation: [
            { width: 250, height: 250, crop: "fill", gravity: "face" },
        ],
    });
    await fs.unlink(file.path);

    await user.update({ avatarURL: secure_url });

    return user;
};

export const editUserEmail = async (userId, newEmail) => {
    const [user, emailCheck] = await Promise.all([
        User.findByPk(userId),
        User.findOne({
            where: {
                email: newEmail,
                id: { [Op.ne]: userId },
            },
        }),
    ]);

    if (!user) {
        throw HttpError(404, "User not found");
    }

    if (emailCheck) {
        throw HttpError(409, "Email already in use");
    }

    await user.update({ email: newEmail });

    return user;
};

export const editUserName = async (userId, newName) => {
    const user = await User.findByPk(userId);
    if (!user) {
        throw HttpError(404, "User not found");
    }

    await user.update({ name: newName });

    return user;
};

export const editPassword = async (userId, oldPassword, newPassword) => {
    const user = await User.findByPk(userId);
    if (!user) {
        throw HttpError(404, "User not found");
    }

    const passwordCompare = await bcrypt.compare(oldPassword, user.password);

    if (!passwordCompare) {
        throw HttpError(401, "Old password is incorrect");
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
        throw HttpError(400, "New password must be different from the old one");
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);

    await user.update({ password: hashPassword });

    return true;
};

export const getUserBonusHistory = async (userId, limit = 10, offset = 0) => {
    const user = await User.findByPk(userId, {
        attributes: ["totalBonus"],
    });

    const { count, rows } = await Bonuses.findAndCountAll({
        // 1. Filter by the user
        where: { userId },

        limit: Number(limit),
        offset: Number(offset),
        order: [["createdAt", "DESC"]],

        // 4. Attributes for the bonus itself
        attributes: ["id", "amount", "createdAt"],

        // 5. Deep nesting for the order details
        include: [
            {
                model: Order,
                attributes: ["id", "totalPrice", "status"],
            },
        ],
    });

    return {
        balance: user?.totalBonus || "0.00",
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        history: rows,
    };
};
