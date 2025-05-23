
module.exports = (models) => {
    
    //user and order relationship
    models.User.hasMany(models.Order, {foreignKey: 'customerId'});

    models.Order.belongsTo(models.User, {foreignKey: 'customerId',})

    //user and restaurant relationship
    models.Restaurant.belongsTo(models.User, {foreignKey: 'userId'});

    //restaurant and order relationship
    models.Restaurant.hasMany(models.Order, {foreignKey : 'restaurantId'});
    models.Order.belongsTo(models.Restaurant, {foreignKey: 'restaurantId'})

   
    //menue and restaurant
    models.Menue.belongsTo(models.Restaurant, {foreignKey: 'restaurantId'});
    

}