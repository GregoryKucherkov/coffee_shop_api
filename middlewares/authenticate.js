import HttpError from "../utils/HttpError.js";

import { verifyToken } from "../utils/jwt.js";

import { findUser } from "../services/authServices.js";

const authenticate = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
        return next(HttpError(401, "Authorization header is missing"));
    }

    const [bearer, token] = authorization.split(" ");
    if (!bearer) {
        return next(HttpError(401, "Bearer is missing"));
    }

    const { payload, error } = verifyToken(token);
    if (error) {
        return next(HttpError(401, error.message));
    }

    const user = await findUser({ email: payload.email });

    if (!user || !user.token) {
        return next(HttpError(401, "User not found"));
    }

    req.user = user;
    next();
};

export default authenticate;
