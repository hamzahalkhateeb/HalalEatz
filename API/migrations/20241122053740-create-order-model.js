'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
    await queryInterface.createTable('Orders', {
      customerId:{
        type: Sequelize.INTEGER,
        allowNull: false,
        references:{
            model: 'Users',
            key: 'id'
        },
        onDelete:'CASCADE',
        onUpdate: 'CASCADE'
    },
    restaurantId:{
        type: Sequelize.INTEGER,
        allowNull: false,
        references:{
            model: 'Restaurants',
            key: 'id'
        },
        onDelete:'CASCADE',
        onUpdate: 'CASCADE'
    },
    status:{
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "pending"

    },
    items:{
        type: Sequelize.JSON,
        allowNull: false
    },
    
}, { timestamps: true,

    })


  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Orders');
  }
};
