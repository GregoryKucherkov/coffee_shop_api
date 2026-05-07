import { SIZE_MAP } from "../constants/cofeeShop.js";
import { Menu, MenuPrice, Size, sequelize } from "../db/models/index.js";

export const allMenu = async ({ offset, limit }) => {
    const { count, rows } = await Menu.findAndCountAll({
        limit: Number(limit),
        offset: Number(offset),

        include: [
            {
                model: MenuPrice,
                include: [
                    {
                        model: Size,
                        attributes: ["name"],
                    },
                ],
            },
        ],
        distinct: true,
    });

    return {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        items: rows,
    };
};

export const getMenuItem = async ({ id }) => {
    return await Menu.findByPk(id, {
        include: [
            {
                model: MenuPrice,
                include: [
                    {
                        model: Size,
                        attributes: ["name"],
                    },
                ],
            },
        ],
    });
};

// ADMIN SECTION

export const createItem = async (data) => {
    // We use a transaction to ensure all 3 tables are updated or none are
    return await sequelize.transaction(async (t) => {
        const allSizes = await Size.findAll({ transaction: t });

        // 1. Create the Menu item (ignores extra fields like 'prices')
        const newItem = await Menu.create(data, { transaction: t });

        // 2. If the request body contains a prices array, create them
        if (data.prices && Array.isArray(data.prices)) {
            const priceEntries = data.prices.map((p) => ({
                menuId: newItem.id,
                price: p.price,
                sizeId: p.size ? SIZE_MAP[p.size] : null, // null if it's a food item without size
            }));

            await MenuPrice.bulkCreate(priceEntries, { transaction: t });
        }

        // 3. Return the item with its relations included so the frontend sees the result
        return await Menu.findByPk(newItem.id, {
            include: [{ model: MenuPrice, include: [Size] }],
            transaction: t,
        });
    });
};

export const updateItem = async (query, data) => {
    return await sequelize.transaction(async (t) => {
        // 1. Find the item
        const item = await Menu.findOne({ where: query, transaction: t });
        if (!item) return null;

        // 2. Update the main Menu fields (name, category, etc.)
        await item.update(data, { transaction: t });

        // 3. Update the prices if they are provided in the request
        if (data.prices && Array.isArray(data.prices)) {
            // First, delete all old prices for this menu item
            await MenuPrice.destroy({
                where: { menuId: item.id },
                transaction: t,
            });

            // Then, insert the new ones
            const priceEntries = data.prices.map((p) => ({
                menuId: item.id,
                price: p.price,
                sizeId: p.size ? SIZE_MAP[p.size] : null,
            }));

            await MenuPrice.bulkCreate(priceEntries, { transaction: t });
        }

        // 4. Return the updated item with its new prices and sizes
        return await Menu.findByPk(item.id, {
            include: [{ model: MenuPrice, include: [Size] }],
            transaction: t,
        });
    });
};

export const deleteItem = async ({ id }) => {
    const item = await Menu.findByPk(id);

    if (!item) {
        return null;
    }

    await item.destroy();

    return item;
};
