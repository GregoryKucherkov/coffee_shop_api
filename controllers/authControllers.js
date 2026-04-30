import { cntrlWrapper } from "../decorators/cntrlWrapper.js";
import * as authServices from "../services/authServices.js";

export const registerController = cntrlWrapper(async (req, res, next) => {
    const { newUser, token } = await authServices.registerUser(req.body);

    res.status(201).json({
        token,
        user: {
            email: newUser.email,
            name: newUser.name,
            avatarURL: newUser.avatarURL,
        },
    });
});

export const loginController = cntrlWrapper(async (req, res, next) => {
    const { token, email, avatarURL, totalBonus } =
        await authServices.loginUser(req.body);

    res.json({
        token,
        user: {
            email,
            avatarURL,
            totalBonus,
        },
    });
});

export const getCurrentController = cntrlWrapper(async (req, res, next) => {
    const { email, name, avatarURL, totalBonus } = req.user;

    res.json({
        name,
        email,
        avatarURL,
        totalBonus,
    });
});

export const logoutController = cntrlWrapper(async (req, res, next) => {
    const { id } = req.user;

    await authServices.logoutUser(id);

    res.status(204).send();
});

export const updateAvatar = cntrlWrapper(async (req, res, next) => {
    const { id: userId } = req.user;

    const user = await authServices.updateAvatar(userId, req.file);

    res.json({
        status: "success",
        code: 200,
        data: {
            email: user.email,
            avatarURL: user.avatarURL,
        },
    });
});

export const editEmail = cntrlWrapper(async (req, res, next) => {
    const { id: userId } = req.user;
    const { email } = req.body;

    const user = await authServices.editUserEmail(userId, email);

    res.json({
        status: "success",
        code: 200,
        data: {
            email: user.email,
        },
    });
});

export const editName = cntrlWrapper(async (req, res, next) => {
    const { id: userId } = req.user;
    const { newName } = req.body;

    const user = await authServices.editUserName(userId, newName);

    res.json({
        status: "success",
        code: 200,
        data: {
            email: user.email,
            name: user.name,
        },
    });
});

export const editPasswordController = cntrlWrapper(async (req, res, next) => {
    const { id: userId } = req.user;
    const { oldPassword, newPassword } = req.body;

    await authServices.editPassword(userId, oldPassword, newPassword);

    res.json({
        status: "success",
        code: 200,
    });
});

export const getBonusHistory = cntrlWrapper(async (req, res, next) => {
    const { id: userId } = req.user;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const data = await authServices.getUserBonusHistory(userId, limit, offset);

    res.json({
        status: "success",
        code: 200,
        message: "Password updated successfully",
    });
});

export const deleteAccount = cntrlWrapper(async (req, res, next) => {
    const { id: userId } = req.user;

    await authServices.deleteAccount(userId);

    res.json({
        status: "success",
        code: 200,
    });
});
