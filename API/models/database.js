const {Sequelize} = require("sequelize");

//connecting the sql database through sequelize
const sequelize = new Sequelize("halal", "root", "Ilcbis07911!", {
    host: "localhost",
    dialect: "mysql"
});

module.exports = sequelize;