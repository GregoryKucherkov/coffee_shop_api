import { sequelize } from "./models/index.js";
import { initDb } from "./seed.js";

const syncDatabase = async () => {
    try {
        console.log("Checking connection...");
        await sequelize.authenticate();
        await sequelize.sync({ alter: true });
        // await sequelize.sync({ force: true });
        // await initDb();
        await sequelize.close();
        console.log("Database synchronized successfully!");

        process.exit(0);

        // Use { force: true } for restart
    } catch (error) {
        console.error("Sync failed:", error);
        await sequelize.close();
        process.exit(1);
    }
};

syncDatabase();
