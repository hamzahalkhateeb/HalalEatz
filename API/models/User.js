const { Sequelize, DataTypes } = require("sequelize") // import the sequelize library and Datatypes object
const sequelize = require('./database'); //import the sequelize instance

const Order = require('./order.js');

//define the model fields
const User = sequelize.define('User', {
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        },
    },
    accountType:{
        type: DataTypes.INTEGER,
        defaultValue: 1,
        
    },
    picture: {
        type: Sequelize.STRING,
        allowNull: true,
        validate:{
            isUrl: true
        },
    },

});



module.exports = User;