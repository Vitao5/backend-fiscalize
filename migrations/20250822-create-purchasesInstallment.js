"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("PurchasesInstallment", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        unique: true,
        primaryKey: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      purchaseId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      installmentNumber: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      installmentValue: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      installmentDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      installmentPaid: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("PurchasesInstallment");
  }
};
