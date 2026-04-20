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
    stripePaymentId: {
        type: DataTypes.STRING,
        allowNull: true, // It's null until the moment the intent is created
    },
});

export default Order;
