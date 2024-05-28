const {Sequelize, DataTypes} = require("sequelize")
const sequelize = require("./database");
const User = require('./User') // import the user model
const Restaurant = require("./Restaurant")


const Review = sequelize.define('Review', {
    body: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    stars: {
        type: DataTypes.INTEGER,
        validate: {
            min: {
                args: [1],
                msg: "Stars can not be below 1!"
            },
            max: {
                args: [5],
                msg: "Stars can not be over 5!"
            }
        },
        allowNull: false,
    },
    timestamp: {
        type: DataTypes.DATE,
        
    },
    images: {
        type: DataTypes.STRING,
        allowNull: true,
    },


});

//define associations
Review.belongsTo(User);
Review.belongsTo(Restaurant);

module.exports = Review;