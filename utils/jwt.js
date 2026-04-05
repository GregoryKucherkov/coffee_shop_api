import jwt from "jsonwebtoken";
import { envConfig } from "../envConfig.js";

const { JWT_SECRET } = envConfig;

export const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: "24h",
    });
};

export const verifyToken = (token) => {
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        return {
            payload,
            error: null,
        };
    } catch (error) {
        return {
            payload: null,
            error,
        };
    }
};
