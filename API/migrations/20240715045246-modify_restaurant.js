'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Restaurants', 'products');

    await queryInterface.changeColumn('Restaurants', 'images', {
      type: Sequelize.STRING,
      allownull: false,
  });

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('Restaurants', 'products', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    
    await queryInterface.changeColumn('Restaurants', 'images', {
      type: Sequelize.JSON,
      allowNull: true,
    });
  }
};
