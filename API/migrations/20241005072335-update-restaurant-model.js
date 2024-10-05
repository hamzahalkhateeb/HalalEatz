'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Restaurants', 'location', {
      type: Sequelize.JSON,
      allowNull: false,
    });

    // Modify the 'images' column to be a STRING instead of JSON
    await queryInterface.changeColumn('Restaurants', 'images', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Restaurants', 'location', {
      type: Sequelize.STRING, // revert back to previous type
      allowNull: false,
    });

    await queryInterface.changeColumn('Restaurants', 'images', {
      type: Sequelize.JSON, // revert back to previous type
      allowNull: true,
    });
  }
};
