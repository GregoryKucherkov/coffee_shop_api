import { DataTypes } from "sequelize";
import sequelize from "../Sequelize.js";

const Bonuses = sequelize.define("Bonuses", {
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
    },
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
});

export default Bonuses;
