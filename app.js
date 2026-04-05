import express from "express";
import morgan from "morgan";
import cors from "cors";

import menuRouter from "./routes/menuRouter.js";

import { envConfig } from "./envConfig.js";
import { sequelize } from "./db/models/index.js";
import authRouter from "./routes/authRoutes.js";
import orderRouter from "./routes/orderRouter.js";

const app = express();

app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/menu", menuRouter);
app.use("/api/order", orderRouter);

app.use((_, res) => {
    res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
    const { status = 500, message = "Server error" } = err;
    res.status(status).json({ message });
});

const port = Number(envConfig.PORT) || 3000;

const start = async () => {
    try {
        // 1. Wait for the DB first
        await sequelize.authenticate();
        console.log("Database connected.");

        // 2. ONLY then start the server
        app.listen(port, () => {
            console.log(`Server is running on port: ${port}`);
        });
    } catch (err) {
        console.error("Database failed to connect. Server not started.");
        process.exit(1);
    }
};

start();
