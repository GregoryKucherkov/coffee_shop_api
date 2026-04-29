import express from "express";
import { validateBody } from "../decorators/validateBody.js";
import {
    authRegisterSchema,
    authLogInSchema,
    authEditEmailSchema,
    authEditNameSchema,
    authEditPassSchema,
} from "../db/models/User.js";
import {
    registerController,
    loginController,
    getCurrentController,
    logoutController,
    updateAvatar,
    getBonusHistory,
    editEmail,
    editName,
    editPasswordController,
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

authRouter.patch(
    "/email",
    authenticate,
    validateBody(authEditEmailSchema),
    editEmail,
);

authRouter.patch(
    "/name",
    authenticate,
    validateBody(authEditNameSchema),
    editName,
);

authRouter.patch(
    "/password",
    authenticate,
    validateBody(authEditPassSchema),
    editPasswordController,
);

authRouter.get("/bonuses", authenticate, getBonusHistory);

export default authRouter;
