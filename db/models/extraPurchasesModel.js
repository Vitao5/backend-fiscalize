const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const extraPurchasesSchema = sequelize.define('ExtraPurchases', {
        id: {
            type: DataTypes.STRING,
            unique: true,
            primaryKey: true
        },
        userId: {
            type: DataTypes.STRING,
            required: true,
            allowNull: false
        },
        purchaseName: {
            type: DataTypes.STRING,
            required: true,
            allowNull: false
        },
        purchaseDate: {
            type: DataTypes.DATE,
            required: true,
            allowNull: false
        },
        purchaseTypePayment: {
            type: DataTypes.STRING,
            required: true,
            allowNull: false
        },
        bankName: {
            type: DataTypes.STRING,
            required: false,
            allowNull: true
        },
        purchaseValue: {
            type: DataTypes.FLOAT,
            required: true,
            allowNull: false
        },
        monthPayment: {
            type: DataTypes.INTEGER,
            required: true,
            allowNull: false
        },
    }, {
        tableName: 'extraPurchase',
        timestamps: false
    });

    return extraPurchasesSchema
}