require('dotenv').config();
const {Sequelize} = require("sequelize");

//connecting the sql database through sequelize
const sequelize = new Sequelize(process.env.db_name, 
    process.env.db_user, 
    process.env.db_password, {

    host: process.env.db_host,
    dialect: process.env.db_dialect
    
});

module.exports = sequelize;

