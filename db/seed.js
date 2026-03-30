import fs from "node:fs/promises";
import path from "node:path";

import { sequelize, Menu } from "./models/index.js";

const seedsDirPath = path.resolve("db", "data");

export const readRawSeedData = async (seedFileName) => {
    const filePath = path.join(seedsDirPath, seedFileName);
    const data = await fs.readFile(filePath);
    return JSON.parse(data);
};

const seedMenu = async (transaction) => {
    const count = await Menu.count({ transaction });

    if (count > 0) {
        console.log("Menu already has data. Skipping seed.");
        return;
    }
    // Option2 is to destroy
    // await Menu.destroy({ where: {}, transaction });

    const data = await readRawSeedData("menu.json");

    return await Menu.bulkCreate(data, { transaction });
};

export const initDb = async () => {
    const transaction = await sequelize.transaction();
    try {
        await seedMenu(transaction);
        await transaction.commit();
        console.log("Database seeded successfully!");
    } catch (error) {
        await transaction.rollback();
        console.error("Failed to seed database, rolled back.", error);
    }
};

// initDb();
