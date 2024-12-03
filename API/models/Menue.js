const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./database');



const Menue = sequelize.define('Menue', {
    meals: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    deserts: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    drinks: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
     

});


module.exports = Menue;

