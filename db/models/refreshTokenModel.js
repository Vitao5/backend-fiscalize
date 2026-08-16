const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const RefreshToken = sequelize.define('RefreshToken', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            unique: true
        },
        token: {
            type: DataTypes.STRING(500),
            allowNull: false,
            unique: true
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        revoked: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        tableName: 'refresh_tokens',
        timestamps: true
    });

    RefreshToken.associate = (models) => {
        RefreshToken.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    };

    return RefreshToken;
};
