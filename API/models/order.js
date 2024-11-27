const {Sequelize, DataTypes } = require("sequelize")
const sequelize = require('./database');
const User = require('./User');
const Restaurant = require("./Restaurant");


const Order = sequelize.define('Order', {
    
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

Order.belongsTo(Restaurant, {foreignKey: 'restaurantId'});
Order.belongsTo(User, {foreignKey: 'customerId'});

module.exports = Order;