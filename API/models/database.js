require('dotenv').config();
const {Sequelize} = require("sequelize");
let sequelize;

if (process.env.JAWSDB_URL) {
    // For Heroku deployment
    sequelize = new Sequelize(process.env.JAWSDB_URL, {
        dialect: 'mysql',
        dialectOptions: {
            ssl: {
                
                rejectUnauthorized: false
            }
        }
    });
} else {


//connecting the sql database through sequelize
    const sequelize = new Sequelize(process.env.db_name, 
        process.env.db_user, 
        process.env.db_password, {

        host: process.env.db_host,
        dialect: process.env.db_dialect
        
    });
}

module.exports = sequelize;

