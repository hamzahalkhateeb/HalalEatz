const sequelize = require("./database"); //import the sequelize instance

//import all the models
const User = require("./User");
const Restaurant = require("./Restaurant");
const Review = require("./Review");
const Menue = require("./Menue");
const Order = require("./Order");
const setupAssociations = require("./associations");



const models = {
    User : User,
    Restaurant: Restaurant,
    Review: Review,
    Menue: Menue,
    Order: Order,
}

setupAssociations(models);




sequelize.sync()
    .then(() => {
        console.log("Database sunchronized");
    })
    .catch((err) => {
        console.error("Error synchronizing database: ", err);
    });



module.exports = {
    sequelize,
    models,
    
};