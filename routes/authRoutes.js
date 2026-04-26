import express from "express";
import { validateBody } from "../decorators/validateBody.js";
import { authRegisterSchema, authLogInSchema } from "../db/models/User.js";
import {
    registerController,
    loginController,
    getCurrentController,
    logoutController,
    updateAvatar,
} from "../controllers/authControllers.js";

import authenticate from "../middlewares/authenticate.js";
import upload from "../middlewares/upload.js";

const authRouter = express.Router();

authRouter.post(
    "/register",
    validateBody(authRegisterSchema),
    registerController,
);

authRouter.post("/login", validateBody(authLogInSchema), loginController);

authRouter.get("/current", authenticate, getCurrentController);

authRouter.post("/logout", authenticate, logoutController);

authRouter.patch(
    "/avatar",
    authenticate,
    upload.single("avatar"),
    updateAvatar,
);

export default authRouter;
