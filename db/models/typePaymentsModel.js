const { DataTypes } = require('sequelize');
// Used for defining the typePayments model in the database


module.exports = (sequelize) => {
    const TypePayments = sequelize.define("TypePayments", {
        
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            unique: true,
            primaryKey: true
        },
        namePayment: {
            type: DataTypes.STRING,
            required: true,
            allowNull: false
        },
        createdBy: {
            type: DataTypes.STRING,
            required: true,
            allowNull: false
            },
        }, {
            tableName: 'typePayments',
            timestamps: false
        });

    return TypePayments
}