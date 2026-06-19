const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const fixedPurchasesSchema = sequelize.define('FixedPurchases', {
        name: {
            type: DataTypes.STRING,
            required: true,
            allowNull: false
        },
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            unique: true,
            primaryKey: true
        },
        value: {
            type: DataTypes.FLOAT,
            required: true,
            allowNull: false
        },
        paymentMonth: {
            type: DataTypes.BOOLEAN,
            required: true,
            allowNull: false
        },
        dayMaxPayment: {
            type: DataTypes.INTEGER,
            required: true,
            allowNull: false
        },
        userId: {
            type: DataTypes.STRING,
            required: true,
            allowNull: false
        }
    });

    return fixedPurchasesSchema
}
