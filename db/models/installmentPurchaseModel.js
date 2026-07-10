const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const InstallmentPurchase = sequelize.define('InstallmentPurchase', {
        id: {
            type: DataTypes.STRING,
            defaultValue: () => require('uuid').v4(),
            primaryKey: true
        },
        userId: {
            type: DataTypes.STRING,
            required: true,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            required: true,
            allowNull: false
        },
        installmentValue: {
            type: DataTypes.FLOAT,
            required: true,
            allowNull: false
        },
        quantityInstallments: {
            type: DataTypes.INTEGER,
            required: true,
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            onUpdate: DataTypes.NOW
        }
    }, {
        timestamps: true,
        tableName: 'installment_purchases'
    });

    InstallmentPurchase.associate = function(models) {
        InstallmentPurchase.hasMany(models.PurchasesInstallment, { foreignKey: 'purchaseId', as: 'installments' });
    };

    return InstallmentPurchase;
}

