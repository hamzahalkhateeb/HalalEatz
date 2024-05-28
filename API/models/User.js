const { Sequelize, DataTypes } = require("sequelize") // import the sequelize library and Datatypes object
const sequelize = require('./database'); //import the sequelize instance

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
        allowNull: false,
    },
});

module.exports = User;