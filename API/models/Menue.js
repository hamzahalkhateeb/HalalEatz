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

