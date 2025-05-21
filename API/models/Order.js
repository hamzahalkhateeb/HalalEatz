const {Sequelize, DataTypes } = require("sequelize")
const sequelize = require('./database');



const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    customerId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: 'Users',
            key: 'id'
        },
        onDelete:'CASCADE',
        onUpdate: 'CASCADE'
    },
    restaurantId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: 'Restaurants',
            key: 'id'
        },
        onDelete:'CASCADE',
        onUpdate: 'CASCADE'
    },
    status:{
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending"

    },
    items:{
        type: DataTypes.JSON,
        allowNull: false
    },
    
}, { timestamps: true,

});



module.exports = Order;
