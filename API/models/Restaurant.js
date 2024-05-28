const { Sequelize, DataTypes } = require("sequelize") // import the sequelize library and Datatypes object
const sequelize = require('./database'); //import the sequelize instance
const User = require("./User");

const Restaurant = sequelize.define('Restaurant', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,

    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    openingHours: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    products: {
        type: DataTypes.JSON,
        allowNull: false, 
    },
    menue:{
        type: DataTypes.STRING,
        allowNull:false,
    },
    images:{
        type: DataTypes.JSON,
        allowNull: true,
    },




    
});

Restaurant.belongsTo(User);
module.exports = Restaurant;