import { cntrlWrapper } from "../decorators/cntrlWrapper.js";
import * as authServices from "../services/authServices.js";

export const registerController = cntrlWrapper(async (req, res, next) => {
    const newUser = await authServices.registerUser(req.body);

    res.status(201).json({
        user: {
            email: newUser.email,
            name: newUser.name,
        },
    });
});

export const loginController = cntrlWrapper(async (req, res, next) => {
    const { token, email } = await authServices.loginUser(req.body);

    res.json({
        token,
        user: {
            email,
        },
    });
});

export const getCurrentController = cntrlWrapper(async (req, res, next) => {
    const { email, name } = req.user;

    res.json({
        name,
        email,
    });
});

export const logoutController = cntrlWrapper(async (req, res, next) => {
    const { id } = req.user;

    await authServices.logoutUser(id);

    res.status(204).send();
});
