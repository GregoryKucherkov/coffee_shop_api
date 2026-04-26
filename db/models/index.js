import sequelize from "../Sequelize.js";
import User from "./User.js";
import Menu from "./CoffeeShop.js";
import Order from "./Orders.js";
import OrderItem from "./OrderItems.js";
import Bonuses from "./Bonuses.js";

// User ↔ Order
User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });

// User ↔ Bonuses
User.hasMany(Bonuses, { foreignKey: "userId", as: "bonusHistory" });
Bonuses.belongsTo(User, { foreignKey: "userId" });

// Order ↔ Bonuses
Order.hasOne(Bonuses, { foreignKey: "orderId" });
Bonuses.belongsTo(Order, { foreignKey: "orderId" });

// Order ↔ OrderItem
Order.hasMany(OrderItem, { foreignKey: "orderId" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

// Menu ↔ OrderItem
Menu.hasMany(OrderItem, { foreignKey: "menuItemId" });
OrderItem.belongsTo(Menu, { foreignKey: "menuItemId" });

export { sequelize, User, Menu, Order, OrderItem, Bonuses };
