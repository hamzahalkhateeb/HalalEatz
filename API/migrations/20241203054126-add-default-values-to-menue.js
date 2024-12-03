'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */


module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.changeColumn('Menues', 'meals', {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    });

    await queryInterface.changeColumn('Menues', 'drinks', {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    });

    await queryInterface.changeColumn('Menues', 'deserts', {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    });
    
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Menues', 'meals', {
      type: DataTypes.JSON,
      allowNull: true,
      
    });

    await queryInterface.changeColumn('Menues', 'drinks', {
      type: DataTypes.JSON,
      allowNull: true,
      
    });

    await queryInterface.changeColumn('Menues', 'deserts', {
      type: DataTypes.JSON,
      allowNull: true,
      
    });


  }
};
