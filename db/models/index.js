import sequelize from "../Sequelize.js";
import User from "./User.js";
import Menu from "./CoffeeShop.js";
import Order from "./Orders.js";
import OrderItem from "./OrderItems.js";

// User ↔ Order
User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });

// Order ↔ OrderItem
Order.hasMany(OrderItem, { foreignKey: "orderId" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

// Menu ↔ OrderItem
Menu.hasMany(OrderItem, { foreignKey: "menuItemId" });
OrderItem.belongsTo(Menu, { foreignKey: "menuItemId" });

export { sequelize, User, Menu, Order, OrderItem };
