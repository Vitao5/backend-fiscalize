"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("bank", {
      id: {
        type: Sequelize.STRING,
        primaryKey: true,
        unique: true
      },
      bankName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      datePayment: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdBy: {
        type: Sequelize.STRING,
        allowNull: false
      }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("bank");
  }
};
