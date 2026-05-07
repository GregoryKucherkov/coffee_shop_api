import fs from "node:fs/promises";
import path from "node:path";

import { sequelize, Menu, Size, MenuPrice } from "./models/index.js";

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

    // Option2 is to destroy menu table
    // await Menu.destroy({ where: {}, transaction });

    // 1. Seed Sizes first (Static lookup)
    const sizes = await Size.bulkCreate(
        [
            { id: 1, name: "small" },
            { id: 2, name: "medium" },
            { id: 3, name: "large" },
        ],
        { transaction },
    );

    // 2. Seed Menu items
    const menuData = await readRawSeedData("menu.json");
    const createdMenu = await Menu.bulkCreate(menuData, {
        transaction,
        returning: true,
    });

    const priceEntries = [];

    createdMenu.forEach((dbItem, index) => {
        const originalJson = menuData[index];
        if (originalJson.hasSize === "true") {
            sizes.forEach((size) => {
                priceEntries.push({
                    menuId: dbItem.id,
                    sizeId: size.id,
                    price:
                        parseFloat(originalJson.price) +
                        (size.name === "medium"
                            ? 1.0
                            : size.name === "large"
                              ? 1.5
                              : 0),
                });
            });
        } else {
            priceEntries.push({
                menuId: dbItem.id,
                sizeId: null,
                price: originalJson.price,
            });
        }
    });

    return await MenuPrice.bulkCreate(priceEntries, { transaction });
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
