import { Sequelize } from "sequelize";
import { envConfig } from "../envConfig.js";

console.log(
    "Connecting to:",
    envConfig.DATABASE_NAME,
    "on port:",
    envConfig.DATABASE_PORT,
);

const sequelize = new Sequelize({
    dialect: envConfig.DATABASE_DIALECT,
    username: envConfig.DATABASE_USERNAME,
    password: envConfig.DATABASE_PASSWORD,
    host: envConfig.DATABASE_HOST,
    database: envConfig.DATABASE_NAME,
    port: envConfig.DATABASE_PORT,
    dialectOptions: {
        ssl: true,
    },
});

try {
    await sequelize.authenticate();
    console.log("Database connection successful!");
} catch (e) {
    console.log(`Error connection to database ${e.message}`);
    process.exit(1);
}

export default sequelize;
