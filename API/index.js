
//import different apps and frameworks necessary for your application
const express = require("express");
const {sequelize, models } = require("./models"); //import all data object models
const {User, Restaurant, Order, Menue} = models; //destructure the models object imported in the line above
const cors=require("cors"); //grants security authorization for the front end app to interact with the backend app
const multer=require("multer"); //multer is important for uploading files, which will be necessary when uploading images to the database
const bodyParser = require('body-parser');
const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = '490153988551-ennqdrg2knoqj3rm1encr5vq0f7tlh50.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);
const session = require('express-session');
const path = require('path'); 
const fs = require('fs');
const { Op, QueryTypes, Sequelize } = require("sequelize");
const paypal= require('@paypal/paypal-server-sdk');
const { request } = require("http");
const axios = require('axios');



const { Client, Environment} = paypal;

const paypalClient = new Client({
    clientCredentialsAuthCredentials: {
        oAuthClientId: 'AbpViNd7G_duDz8kbW7HY1KQD7rwqKLk1GZtMYrITXdUuVyLQM5rElh-9GF_D-0LMdYuZwBNbBzkhbBb',
        oAuthClientSecret: 'EJtdgBjJGJ_62R06YXNJfyBw0xuuryQMv7Yyd4qiFquq1kkwuG7bnh2U-wMqOZHo_xcWTtPhS4ybbqzo' 
    },
    environment: Environment.Sandbox,
    timeout: 0,
    logging: {
        logLevel: paypal.LogLevel.Info, // Log level (optional)
        logRequest: {
            logBody: true // Log request body (optional)
        },
        logResponse: {
            logHeaders: true // Log response headers (optional)
        }
    }
}); 

const ordersController = new paypal.OrdersController(paypalClient);



//assigning an express instance to an "app" object, basically making the express app
const app= express();

//Setting the view engine as ejs. The following is unnecessary as angular will handle the frontend
app.set('view engine', 'ejs');


//make the uploads file accesible via url routes so the images can be served
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


//calling the use function to use cors and json data
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({extended: true}));
app.use(session({
    secret: "secretfornow",
    resave: false,
    saveUninitialized: false,
}));





const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        
        const ogName = file.originalname;
        cb(null, ogName);
        console.log("image uploaded successfully!")
    }
}); 

const upload = multer({ storage: storage });


const generateImgName = (restaurantName, type, originalname, relItem ) => {
    
    const sanitizedName = restaurantName.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    if(type == "main"){
        let imgName = `${sanitizedName}_${type}_${Date.now()}${path.extname(originalname)}`;
        return imgName;
    } else {
        let imgName = `${sanitizedName}_${type}_${relItem}_${Date.now()}${path.extname(originalname)}`;
        return imgName;
    }
    
}


app.post('/login', async (req, res) => {

    // User.destroy({ where: {id: 72} });
    
    console.log("login called");
    const token = req.body.id_token;
    console.log("token received: ");
    try{
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID
        });
        const payload = ticket.getPayload();
        const {email, picture, given_name, family_name} = payload;

        

        let user = await User.findOne({where: {email: email}});

        if(!user){
            console.log("user wasn't found, creating new user...");
            user = await User.create({
                email,
                picture,
                firstName: given_name,
                lastName: family_name,
                accountType: 1
            });
            req.session.userId = user.id;
            req.session.isLoggedIn = true;
            res.status(201).json({success: true, message: "You have signed up successfully!", user, redirectUrl: "/dashboard"});
        } else {
            console.log("user found, logging in...");
            req.session.userId = user.id;
            req.session.isLoggedIn = true;
            if (user.accountType == 1){
                res.status(200).json({success: true, message: "You have logged in successfully!", redirectUrl: '/dashboard', userId: user.id});
            } else {
                res.status(200).json({success: true, message: "You have logged in successfully!", redirectUrl: '/restaurantAdmin', userId: user.id});
            }
            
        }
    } catch(err){
        console.error(err);
        res.status(400).json({error: 'invalid token', redirectUrl: "/error"});
    }
    
});


app.post('/logout', (req, res) =>{
    try{
        req.session.destroy();
        res.status(200).json({success: true, message:"You have logged out successfully!", redirectUrl: "/login"});

    } catch(err){
        console.error(err);
        res.status(400).json({error: "An error occurred while logging out", redirectUrl: "/error"});
    }

    
    
});

app.post('/listRestaurant', upload.single('image'),  async (req, res) =>{
    //Restaurant.destroy({ where: {} });
    //Menue.destroy({ where: {} });
    //User.destroy({ where: {id : 72} });
    
    console.log(`listing restaurant order received `);
    console.log(` `);
    //extract received information
    const token = req.body.id_token;
    const resInfo = JSON.parse(req.body.resInfo);
    const uploadedImg = req.file;
    const type = req.body.type;
    const relItem = req.body.relItem
    


    //change image name
    const newImageName = generateImgName(resInfo.name, type, uploadedImg.originalname, relItem)
    

    // declaring paths and renaming the newly stored image!
    const oldPath = path.join(__dirname, 'uploads', uploadedImg.filename);
    const newPath = path.join('uploads', newImageName);
    console.log(newPath);

    fs.rename(oldPath, newPath, (err) => {
        if (err) {
            console.error('Error renaming file:', err);
            
        }
    
    });
    
    

    //verify google token, extract user details 
    try{
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID
        });

        const payload = ticket.getPayload();
        const {email, picture, given_name, family_name} = payload;
        
        let user = await User.findOne({where: {email : email}});

        if (!user){
            console.log(` there was no user, creating one now `);
            
            user = await User.create({
                email, picture, firstName: given_name, lastName: family_name, accountType: 2, 
            });
            req.session.userId = user.id;
            req.session.isLoggedIn = true;

            
            let restaurant = await Restaurant.create({
                
                name: resInfo.name,
                location: resInfo.location,
                lat: resInfo.lat,
                lon: resInfo.lon,
                openingHours: JSON.stringify(resInfo.days), 
                halalRating: resInfo.halalRating, 
                userId: user.id, 
                images: newPath,
            });
            


            
            
            res.status(201).json({success: true, message: "You have listed your restaurant successfully, please set up your menu to get up and running!", userId: user.id, redirectUrl: "/restaurantAdmin"});
        } else {
            res.status(200).json({success: false, message: "The email is already associated with another account, please use an email that is specifically for your restaurant!", user, redirectUrl: "/listing-form"});
        }
        



    } catch {
        console.log("lolololo, terrible request");
        
        res.status(400).json({error: 'invalid token', redirectUrl: "/error"});
    }


});


app.post('/submitMenue', upload.single('image'), async (req, res) => {
    //Menue.destroy({ where: {} });
    
    
    try{
        //extract all the information
        
        const menueItemObject = JSON.parse(req.body.menueItem);
        
        
        const image = req.file;
        const userId = parseInt(req.body.userId);
        
        
        
        const itemType = menueItemObject.type;
        
       
        const relItem = menueItemObject.name;
        
        
        
        
        //find the related restaurant
        
        let restaurant = await Restaurant.findOne({where : {UserId : userId}});
        
       
        
        if (!restaurant) {
            
            
            return res.status(404).json({ success: false, message: "Restaurant or User not found" });
        }
        

        //change uploaded image name
        const itemImageName = generateImgName(restaurant.name, itemType, image.originalname, relItem);
        
        const oldPath = path.join(__dirname, 'uploads', image.filename);
        const newPath = path.join('uploads', itemImageName);
        
        fs.rename(oldPath, newPath, (err) => {
            if (err) {
                console.error('Error renaming file:', err);
                
            }
        
        });


        //store image path
        menueItemObject.imgPath = newPath;
        const menueItemString = JSON.stringify(menueItemObject);
    
        let menue = await Menue.findOne({where : {restaurantId: restaurant.id}});
        const fieldMap = {
            meal: 'meals',
            drink: 'drinks',
            desert: 'deserts'
        }

        const field = fieldMap[itemType];
        

        if (!menue){
            
            console.log(`menue doesn't exist, creating now`);
            menue = await Menue.create({
                meals: [],
                drinks:[],
                deserts:[],
                restaurantId: restaurant.id,
                

            });

           

            menue[field] = [...menue[field], menueItemString];
            

            await menue.save();
            
            
            //Menue.destroy({ where: {} });
            res.status(201).json({success: true, message: `You have added an item to the menu successfully for restaurant ${restaurant.name}`});
        } else {
            

            menue[field] = [...menue[field], menueItemString];
            

            await menue.save();
            
            
            await menue.save();
            
            //Menue.destroy({ where: {} });
            res.status(201).json({success: true, message: `You have added an item to the menu successfully for restaurant ${restaurant.name}`});
        } 

    
        

} catch {
    res.status(500).json({success: false, message: "Error adding an item your menue"});
}}); 



app.post('/getCloseRestaurants', async (req, res) => {
    const Ulong = parseFloat(req.body.long);
    const Ulat = parseFloat(req.body.lat);
    //lat: -34.782893, long: 138.628749
    console.log(`lat: ${req.body.lat}, long: ${req.body.long}`);


    const query = `
        SELECT
            id, name, location, openingHours, halalRating, images,
            (
                6371 * ACOS(
                COS(RADIANS(:Ulat)) * COS(RADIANS(lat)) * 
                COS(RADIANS(lon) - RADIANS(:Ulong)) + 
                SIN(RADIANS(:Ulat)) * SIN(RADIANS(lat))
                )
            ) AS DISTANCE
        FROM
            Restaurants
        ORDER BY
            DISTANCE ASC
        LIMIT 3;
    `;

    try {
        console.log("about to execute sql query!");
        const closestRestaurants = await sequelize.query(query, {
            replacements: {Ulat, Ulong},
            type: QueryTypes.SELECT
        });
        console.log("Executed successfully");
        console.log(closestRestaurants);

        if (closestRestaurants.length === 0){
            return res.json({success: false, message: "no restaurants available to display!"});
        }

        res.json({success: true, restaurantPackage: JSON.stringify(closestRestaurants)});
    } catch (error){
        res.status(500).json({success: false, message: 'something went wrong'});
    }


});



app.post('/LoadRestaurantAdminPackage', async (req, res) => {

    const type = req.body.userType;
    

    if (type === "admin"){
        const userId = req.body.Id;
        console.log(`user id received from front end is: ${userId}`);


        try{
            let restaurant = await Restaurant.findOne({where : {UserId : userId}});

            console.log(`restaurant associated with the user is: ${restaurant.name}, ${restaurant.id}`);

            let menue = JSON.stringify(await Menue.findOne({where : {restaurantId: restaurant.id}}));
            
            console.log(`found a menue for the restaurant in question: ${menue}`);

            if (!menue){
            return res.json({success:false, message: "There are no items in your menue, please add items through the  menue tab"});
            } else {
            
            return res.json({success: true, message: "menue retrieval successfull!", menue});
            }
        } catch (error){
            res.status(500).json({success: false, message: "something went wrong, internal server error"});
        }
    } else if (type === "consumer") {

        const restaurantId = req.body.Id;

        try{
            
            let menue = JSON.stringify(await Menue.findOne({where : {restaurantId: restaurantId}}));
            
            console.log(`found a menue for the restaurant in question: ${menue}`);

            if (!menue){
            return res.json({success:false, message: "This restaurant does not have any items available tp purchase"});
            } else {
            
            return res.json({success: true, message: "menue retrieval successfull!", menue});
            }
        } catch (error){
            res.status(500).json({success: false, message: "something went wrong, internal server error"});
        }

    } else {
        console.log('wrong type, has to be either admin or consumer');
    }




});

app.post('/deleteItem', async (req, res) => {
    console.log('deleteitem initiatied');
    const menueid = req.body.menueId;
    const type = `${req.body.type}s`;
    const itemName = req.body.itemName;
    const itemDescription = req.body.itemDescription;

    console.log(menueid, type, itemName, itemDescription);


    try{
        let menue = await Menue.findOne({where : {id: menueid}});

        console.log(menue.meals)
        console.log(`found menue!`);
        console.log(`menue type before: ${menue[type]} ;;;`);

        const newArray = [];
        console.log(`new empty array: ${newArray} ;;;`);
        for (let index in menue[type]){
            if (!(menue[type][index].includes(`"name":"${itemName}"`) && menue[type][index].includes(`"description":"${itemDescription}"`))){

                newArray.push(menue[type][index]);
            }
        }
        
        console.log(`just populated empty array with the following: ${menue[type]} ;;;`);
        menue.set(type, newArray);

        
        
        
    
        await menue.save();
        console.log(`saved menue: ${menue.meals}`);

        res.status(201).json({success: true, message: `you have deleted an item successfully!`});

        

    } catch {
        res.status(500).json({success: false, message: 'error, something went wrong'});
    }
});

app.post('/deleteRestaurant', async (req, res) => {
    console.log(`restaurant deletion started`);

    const userId = req.body.userId;
    console.log(userId);

    let user = await User.findOne({where : {id : userId}});
    let restaurant = await Restaurant.findOne({where : {UserId : userId}});
    let menue = await Menue.findOne({where : {restaurantId: restaurant.id}});
    console.log(user);
    console.log(restaurant);
    console.log(menue);

    try{
        await menue.destroy();
        console.log('menue destroyed');
        await restaurant.destroy();
        console.log('restaurant destroyed');
        await user.destroy();
        console.log('user destroyed');
        req.session.destroy();
        console.log('session destroyed!');

        res.status(201).json({success: true, message:"menues, restaurant and user have all been deleted", redirectUrl: '/login'});
        
        
    }catch{
        res.status(500).json({success: false, message: 'error, something went wrong'});
    }

});

app.post('/placeOrder', async (req, res) => {
    
    //Order.destroy({ where: {} });
    const items = (req.body.orderArray);
    const userId = Number(req.body.userId);
    const restaurantId = Number(req.body.restaurantId);
    const status = req.body.status;
    const totalPrice = req.body.totalPrice;

    const purchase_units = [{
        items: JSON.parse(items),
        amount: {
                currency_code: 'AUD',
                value: totalPrice,
                breakdown: {
                    item_total: {currency_code: 'AUD', value: totalPrice},
                    tax_total: {currency_code: 'AUD', value: '0.00'}
                }
            },
            

        } ]

    ;
    const requestBody = {
        intent: 'CAPTURE',
        purchase_units: purchase_units,
        application_context: {
            return_url : 'http://localhost:4200/complete-order',
            cancel_url : 'http://localhost:4200/cancel-order'
        },

    };


    
    console.log(items);

    createOrder(purchase_units);
    
    

    //onsole.log(JSON.stringify(requestBody));
       

    //createOrder(requestBody);

    /*console.log(`variable userId: ${userId} type: ${typeof userId}`);
    console.log(`variable restaurantId: ${restaurantId} type: ${typeof restaurantId}`);
    console.log(`variable items: ${items} type: ${typeof items}`);
    console.log(`variable status: ${status} type: ${typeof status}`);
    console.log(`variable total price: ${totalPrice}`); */


    /*try{

        console.log('attempting to create order');

       const order = await Order.create({
        customerId : userId,
        restaurantId: restaurantId,
        status: status,
        items: items
       });

        console.log('created an order  object');
        console.log(order);
        res.status(201).json({success: true, message: "order places correctly, please check the orders tab for updates"});
    } catch {
        console.log('error!');
        res.status(500).json({success: false, error: 'something went wrong', message: 'something went wrong'});
    }*/
    

});

async function generateAccess_Token(purchase_units){
    const response = await axios({
        url: "https://api-m.sandbox.paypal.com/v1/oauth2/token",
        method: 'POST',
        data: 'grant_type=client_credentials',
        auth: {
            username: 'AbpViNd7G_duDz8kbW7HY1KQD7rwqKLk1GZtMYrITXdUuVyLQM5rElh-9GF_D-0LMdYuZwBNbBzkhbBb',
            password: 'EJtdgBjJGJ_62R06YXNJfyBw0xuuryQMv7Yyd4qiFquq1kkwuG7bnh2U-wMqOZHo_xcWTtPhS4ybbqzo'
        }
    })

    console.log(response.data.access_token);
    return response.data.access_token;
}


async function createOrder(purchase_units){
    let access_token = await generateAccess_Token();

    console.log(JSON.stringify(purchase_units, null, 2));
    const response = await axios({
        url: 'https://api-m.sandbox.paypal.com/v2/checkout/orders',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + access_token
        },
        data: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [ {
                "items": [
                    {
                    "name": "meal 1",
                    "description": "meal 1",
                    "quantity": '2',
                    "unit_amount": {
                        "currency_code": "AUD",
                        "value": '2.00'
                    }
                    },
                    {
                    "name": "drink 1",
                    "description": "drink 1",
                    "quantity": '1',
                    "unit_amount": {
                        "currency_code": "AUD",
                        "value": '4.00'
                    }
                    }
                ],
                "amount": {
                    "currency_code": "AUD",
                    "value": '8.00',
                    "breakdown": {
                    "item_total": {
                        "currency_code": "AUD",
                        "value": '8.00'
                    },
                    "tax_total": {
                        "currency_code": "AUD",
                        "value": '0.00'
                    }
                    }
                },
            }],
            application_context: {
                return_url : 'http://localhost:4200/complete-order',
                cancel_url : 'http://localhost:4200/cancel-order'
            }
        })

    });
    console.log(response.data);

    

}
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT} !`);
});







