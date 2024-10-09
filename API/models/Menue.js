const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./database');
const User = require('./User');
const Restaurant = require('./Restaurant');


const Menue = sequelize.define('Menue', {
    meals: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    deserts: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    drinks: {
        type: DataTypes.JSON,
        allowNull: true,
    },
     

});

Menue.belongsTo(Restaurant);
Menue.belongsTo(User);
module.exports = Menue;

