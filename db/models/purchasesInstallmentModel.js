module.exports = (sequelize, DataTypes) => {
    const PurchasesInstallment = sequelize.define('PurchasesInstallment', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            unique: true,
            primaryKey: true
        },
        userId: {
            type: DataTypes.STRING,
            required: true,
            allowNull: false
        },
        purchaseId: {
            type: DataTypes.STRING,
            required: true,
            allowNull: false
        },
        installmentNumber: {
            type: DataTypes.INTEGER,
            required: true,
            allowNull: false
        },
        installmentValue: {
            type: DataTypes.FLOAT,
            required: true,
            allowNull: false
        },
        installmentPaid: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
    }, {
        tableName: 'purchases_installments'
    });

    PurchasesInstallment.associate = function(models) {
        PurchasesInstallment.belongsTo(models.InstallmentPurchase, { foreignKey: 'purchaseId', as: 'purchase' });
    };

    return PurchasesInstallment;
}