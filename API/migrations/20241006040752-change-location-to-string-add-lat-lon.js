'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Restaurants', 'location', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.addColumn('Restaurants', 'lat', {
      type: Sequelize.FLOAT,  // Or Sequelize.DECIMAL(10, 8) for more precision
      allowNull: true,  // Change to false if you want it to be required
    });
    await queryInterface.addColumn('Restaurants', 'lon', {
      type: Sequelize.FLOAT,  // Or Sequelize.DECIMAL(10, 8)
      allowNull: true,  // Change to false if you want it to be required
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Restaurants', 'location', {
      type: Sequelize.JSON,
      allowNull: false,
    });
    await queryInterface.removeColumn('Restaurants', 'lat');
    await queryInterface.removeColumn('Restaurants', 'lon');
    }
  
};
