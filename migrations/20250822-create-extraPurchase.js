"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("extraPurchase", {
      id: {
        type: Sequelize.STRING,
        unique: true,
        primaryKey: true
      },
      userId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      purchaseName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      purchaseDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      purchaseTypePayment: {
        type: Sequelize.STRING,
        allowNull: false
      },
      bankName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      purchaseValue: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      monthPayment: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("extraPurchase");
  }
};
