import { DataTypes } from "sequelize";
import sequelize from "../Sequelize.js";
import { PAYMENTSTATUS } from "../../constants/orderStatus.js";

const Order = sequelize.define("Order", {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    totalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM(...PAYMENTSTATUS),
        defaultValue: PAYMENTSTATUS[0],
    },
});

// Order.sync();
// Order.sync({ alter: true });

export default Order;
