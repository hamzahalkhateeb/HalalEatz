'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Restaurants', 'halalRating', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate:{
        min: 0,
        max: 10
      }
  });
},

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Restaurants', 'halalRating');
  }
};
