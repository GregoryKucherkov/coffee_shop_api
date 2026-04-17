import bcrypt from "bcrypt";

import { User } from "../db/models/index.js";

import HttpError from "../utils/HttpError.js";

import { generateToken } from "../utils/jwt.js";

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

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({ ...data, password: hashPassword });

    const token = generateToken({ email: newUser.email });

    console.log("👉 TOKEN GENERATED:", token);

    await newUser.update({ token });

    return {
        newUser,
        token,
    };
};

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

    console.log("👉 TOKEN GENERATED:", token);

    await user.update({ token });

    return {
        token,
        email: user.email,
    };
};

export const logoutUser = async (id) => {
    const user = await findUser({ id });

    if (!user || !user.token) {
        throw HttpError(404, "User not found");
    }

    await user.update({ token: null });
};
