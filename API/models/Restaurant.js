const { Sequelize, DataTypes } = require("sequelize") // import the sequelize library and Datatypes object
const sequelize = require('./database'); //import the sequelize instance


const Restaurant = sequelize.define('Restaurant', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,

    },
    location: {  
        type: DataTypes.STRING, 
        allowNull: false,
    },
    lat: {  
        type: DataTypes.FLOAT,  
        allowNull: true,  
    },
    lon: {  
        type: DataTypes.FLOAT, 
        allowNull: true,  
    },
    openingHours: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    halalRating:{
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate:{
            min: 0,
            max: 10
        
    }},
    images:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    open:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }

    




    
});


module.exports = Restaurant;