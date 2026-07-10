"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("installment_purchases", "userId", {
      type: Sequelize.STRING,
      allowNull: false
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("installment_purchases", "userId", {
      type: Sequelize.INTEGER,
      allowNull: false
    });
  }
};
