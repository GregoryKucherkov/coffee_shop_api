import { Menu } from "../db/models/index.js";

export const allMenu = async ({ offset, limit }) => {
    const { count, rows } = await Menu.findAndCountAll({
        limit: Number(limit),
        offset: Number(offset),
    });

    return {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        items: rows,
    };
};

export const getMenuItem = async ({ id }) => {
    return await Menu.findByPk(id);
};

export const createItem = async (data) => {
    return await Menu.create(data);
};

export const updateItem = async (query, data) => {
    const item = await getMenuItem(query);
    if (!item) return null;

    return item.update(data, {
        returning: true,
    });
};

export const deleteItem = async ({ id }) => {
    const item = await getMenuItem({ id });
    if (!item) {
        return null;
    }

    await item.destroy();

    return item;
};
