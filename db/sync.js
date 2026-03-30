import { sequelize } from "./models/index.js";
import { initDb } from "./seed.js";

const syncDatabase = async () => {
    try {
        console.log("Checking connection...");
        await sequelize.authenticate();
        await sequelize.sync({ alter: true });
        await initDb();
        await sequelize.close();
        process.exit(0);

        // Use { force: true } for restart
        // await sequelize.sync({ force: true });
        console.log("Database synchronized successfully!");
    } catch (error) {
        console.error("Sync failed:", error);
        await sequelize.close();
        process.exit(1);
    }
};

syncDatabase();
