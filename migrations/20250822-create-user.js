"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("User", {
      id: {
        type: Sequelize.STRING,
        primaryKey: true,
        unique: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lastLogin: {
        type: Sequelize.DATE,
        allowNull: true
      },
      admin: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      inativeUser: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      loginAttempts: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      lastLoginAttempt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      codePassword: {
        type: Sequelize.STRING,
        allowNull: true
      },
      phoneNumber: {
        type: Sequelize.STRING,
        allowNull: true
      }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("User");
  }
};
