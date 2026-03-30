import { Menu } from "../db/models/index.js";

export const allMenu = ({ offset, limit }) => {
    return Menu.findAll({
        offset,
        limit: Number(limit),
    });
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
