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
            description: "Toasted bread with garlic and herbs.",
            vegan: true,
            glutenFree: false,
            vegetarian: true,
            halalKosher: true,
            timesBought: 0,
            imageURL: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.bbcgoodfood.com%2Frecipes%2Fgarlic-bread&psig=AOvVaw0J4JHm9V7i4bZMz1z8Lw8G&ust=1634024350678000&source=images&cd=vfe&ved=0CAsQjRxqFwoTCJjH0J3U1fMCFQAAAAAdAAAAABAD"

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