const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const BankTransaction = sequelize.define('BankTransaction', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            unique: true
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        pluggyItemId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        pluggyAccountId: {
            type: DataTypes.STRING,
            allowNull: true
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false
        },
        amount: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        category: {
            type: DataTypes.STRING,
            allowNull: true
        },
        type: {
            type: DataTypes.STRING,
            allowNull: true
        },
        currencyCode: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'BRL'
        }
    }, {
        tableName: 'bank_transactions',
        timestamps: true
    });

    BankTransaction.associate = (models) => {
        BankTransaction.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    };

    return BankTransaction;
};
