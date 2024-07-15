const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./database');
const User = require('./User');
const Restaurant = require('./Restaurant');


const Menue = sequelize.define('Menue', {
    meals: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    deserts: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    drinks: {
        type: DataTypes.JSON,
        allowNull: false,
    },
     

});

Menue.belongsTo(Restaurant);
Menue.belongsTo(User);
module.exports = Menue;

/* example:
starters: [
        {
            name: "Garlic Bread",
            price: 5.99,
            description: "Toasted bread with garlic and herbs."
        },
        {
            name: "Bruschetta",
            price: 7.99,
            description: "Toasted bread with diced tomatoes, basil, and olive oil."
        }
    ],
    mainCourse: [
        {
            name: "Spaghetti Bolognese",
            price: 12.99,
            description: "Spaghetti pasta with beef Bolognese sauce."
        },.....etc

*/