const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const PluggyItem = sequelize.define('PluggyItem', {
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
        connectorName: {
            type: DataTypes.STRING,
            allowNull: true
        },
        connectorId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        status: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'UPDATED'
        }
    }, {
        tableName: 'pluggy_items',
        timestamps: true
    });

    PluggyItem.associate = (models) => {
        PluggyItem.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    };

    return PluggyItem;
};
