'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Orders', 'id', {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
  });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Orders', 'id');
  }
};
