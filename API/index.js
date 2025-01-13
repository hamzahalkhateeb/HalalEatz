
//import different apps and frameworks necessary for your application
require('dotenv').config();
const {sequelize, models } = require("./models"); //import all data object models
const {User, Restaurant, Order, Menue} = models; //destructure the models object imported in the line above
const cors=require("cors"); //grants security authorization for the front end app to interact with the backend app
const multer=require("multer"); //multer is important for uploading files, which will be necessary when uploading images to the database
const bodyParser = require('body-parser');
const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = process.env.google_api_auth_key;
const client = new OAuth2Client(CLIENT_ID);
const session = require('express-session');
const path = require('path'); 
const fs = require('fs');
const { Op, QueryTypes, Sequelize } = require("sequelize");
const axios = require('axios');
const express = require("express");
const app= express();
const  request  = require("http");
const server = request.createServer(app);
const { Server } = require("socket.io");





const io = new Server(server, {
    cors: {
        origin: "http://localhost:4200",
        methods: ["GET", "POST"]
    }
});

const activeSockets =  new Map();
io.on('connect', (socket) => {
    console.log("a user connected");




    socket.on('restaurantConnected', (restaurantId) => {
        activeSockets.set(restaurantId, socket.id);

        console.log(`****inside SOCKET IO  restaurant id: ${restaurantId} datatype: ${typeof(restaurantId)}`);
        console.log(`added restaurant to active sockets: ${restaurantId}`);
    });


    socket.on("disconnect", () => {
        console.log("a user disconnected");
        activeSockets.forEach((value, key) =>{
            if (value === socket.id) {
                activeSockets.delete(key);
            }
        })
        
    })
});



app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({extended: true}));
app.use(session({
    secret: process.env.session_secret,
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

/////////////////////////////////////////////////////////////////////////////


app.post('/login', async (req, res) => {

    // User.destroy({ where: {id: 72} });
    
    
    const token = req.body.id_token;
    
    try{
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID
        });
        const payload = ticket.getPayload();
        const {email, picture, given_name, family_name} = payload;

        

        let user = await User.findOne({where: {email: email}});

        if(!user){
            
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

/////////////////////////////////////////////////////////////////////////////


app.post('/logout', (req, res) =>{
    try{
        req.session.destroy();
        res.status(200).json({success: true, message:"You have logged out successfully!", redirectUrl: "/login"});

    } catch(err){
        console.error(err);
        res.status(400).json({error: "An error occurred while logging out", redirectUrl: "/error"});
    }

    
    
});

/////////////////////////////////////////////////////////////////////////////


app.post('/listRestaurant', upload.single('image'),  async (req, res) =>{
    //Restaurant.destroy({ where: {} });
    //Menue.destroy({ where: {} });
    //User.destroy({ where: {id : 72} });
    
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
        
        res.status(400).json({error: 'invalid token', redirectUrl: "/error"});
    }


});

/////////////////////////////////////////////////////////////////////////////


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


/////////////////////////////////////////////////////////////////////////////


app.post('/getCloseRestaurants', async (req, res) => {
    const Ulong = parseFloat(req.body.long);
    const Ulat = parseFloat(req.body.lat);
    


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
        const closestRestaurants = await sequelize.query(query, {
            replacements: {Ulat, Ulong},
            type: QueryTypes.SELECT
        });

        if (closestRestaurants.length === 0){
            return res.json({success: false, message: "no restaurants available to display!"});
        }

        res.json({success: true, restaurantPackage: JSON.stringify(closestRestaurants)});
    } catch (error){
        res.status(500).json({success: false, message: 'something went wrong'});
    }


});


/////////////////////////////////////////////////////////////////////////////


app.post('/LoadRestaurantAdminPackage', async (req, res) => {

    const type = req.body.userType;
    

    if (type === "admin"){
        const userId = req.body.Id;


        try{
            let restaurant = await Restaurant.findOne({where : {UserId : userId}});


            let menue = JSON.stringify(await Menue.findOne({where : {restaurantId: restaurant.id}}));
            

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
            

            if (!menue){
            return res.json({success:false, message: "This restaurant does not have any items available tp purchase"});
            } else {
            
            return res.json({success: true, message: "menue retrieval successfull!", menue});
            }
        } catch (error){
            res.status(500).json({success: false, message: "something went wrong, internal server error"});
        }

    } else {
    }




});


/////////////////////////////////////////////////////////////////////////////


app.post('/deleteItem', async (req, res) => {
    const menueid = req.body.menueId;
    const type = `${req.body.type}s`;
    const itemName = req.body.itemName;
    const itemDescription = req.body.itemDescription;



    try{
        let menue = await Menue.findOne({where : {id: menueid}});


        const newArray = [];
        for (let index in menue[type]){
            if (!(menue[type][index].includes(`"name":"${itemName}"`) && menue[type][index].includes(`"description":"${itemDescription}"`))){

                newArray.push(menue[type][index]);
            }
        }
        
        menue.set(type, newArray);

        
        
        
    
        await menue.save();

        res.status(201).json({success: true, message: `you have deleted an item successfully!`});

        

    } catch {
        res.status(500).json({success: false, message: 'error, something went wrong'});
    }
});


/////////////////////////////////////////////////////////////////////////////


app.post('/deleteRestaurant', async (req, res) => {
    

    const userId = req.body.userId;
    

    let user = await User.findOne({where : {id : userId}});
    let restaurant = await Restaurant.findOne({where : {UserId : userId}});
    let menue = await Menue.findOne({where : {restaurantId: restaurant.id}});
    

    try{
        await menue.destroy();
        
        await restaurant.destroy();
       
        await user.destroy();
        
        req.session.destroy();
        

        res.status(201).json({success: true, message:"menues, restaurant and user have all been deleted", redirectUrl: '/login'});
        
        
    }catch{
        res.status(500).json({success: false, message: 'error, something went wrong'});
    }

});


/////////////////////////////////////////////////////////////////////////////


app.post('/placeOrder', async (req, res) => {
    
    //Order.destroy({ where: {} });
    const items = (req.body.orderArray);
    const userId = Number(req.body.userId);
    const restaurantId = Number(req.body.restaurantId);
    const status = req.body.status;
    const totalPrice = req.body.totalPrice;
    

    

    const transaction = await sequelize.transaction();

    const order = await Order.create({
        customerId : userId,
        restaurantId: restaurantId,
        status: status,
        items: items
       }, { transaction });

    const restaurantObjetc = await Restaurant.findOne({where : {id : restaurantId}});
    console.log('found restaurant object : ', restaurantObjetc.userId);

    const restaurantOwner = await User.findOne({where: {id : restaurantObjetc.userId}});
    console.log('found restaurant owner and his email is the following: ', restaurantOwner.email);

    const payeeEmail = restaurantOwner.email;

    const orderId = order.id;
    console.log(`ORDER ID JUST CREATED!**###**##***###*3##*********####*####*********####******** ${orderId}`);

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
        payee: {
            email_address: payeeEmail
        }
            
        }];

        console.log(purchase_units);
        
    
        
    try{
        const paymentURL = await createOrder(purchase_units, restaurantId, userId, orderId); //this will send to the front end and front end will call /CapturePayment end point below

        
        await transaction.commit();
                
        res.status(201).json({success: true, message: "payment captured, proceeding to completion now!", redirectUrl: paymentURL});
    } catch {
        await transaction.rollback();
        res.status(500).json({success: false, message: 'error, something went wrong'});
    }
        

});

/////////////////////////////////////////////////////////////////////////////


app.post('/capturePayment', async (req, res)=>{

    console.log(`1- Capture paymenty function called!!`);
    const token = req.body.token;

    const orderId = req.body.orderId;
    

    const order = await Order.findOne({where : {id: orderId}});
    const restaurant = await Restaurant.findOne({where : {id : order.restaurantId}});
    const restaurantOwnerId = restaurant.userId;
    console.log(`2- order retrieved`)


    try{
        let response = await capture_payment(token);

        console.log(`3- response from capture FUNCTION!: ${response}`);
        
        if (response.status === "COMPLETED"){
            order.status = 'paid';
            await order.save();
            console.log(`4- response was complete, order status changed to paid and carried on!, restaurantId`);
            const restaurantId = order.restaurantId;

            console.log(`****inside capture payment restaurant id: ${restaurantOwnerId} datatype: ${typeof(restaurantOwnerId)}`);
            const restaurantSocketId = activeSockets.get(String(restaurantOwnerId));
            console.log(`4.5- restaurantsocket id = ${restaurantSocketId}`);
            
            

            if(restaurantSocketId){
                console.log(`5- found the socketid, will attempt to retrive socket object and emit after this`);
                const restaurantsSocketObj = io.sockets.sockets.get(restaurantSocketId);
 /*error =>>>>*/restaurantsSocketObj.emit('orderPaid&Placed', {orderJSON: json.stringify(order), message: 'Order received and paid!'});
                console.log(`6- object found and emitted!`);
            } else {
                console.log(`5- did not find socket id forwhatever reason`);
            }
            
            res.status(201).json({success: true, message: "payment successfull, you will be redirected to shortly!", response: response, redirectUrl: '/dashboard'});

        } else if (response.status = "already complete") {
            
            res.status(201).json({success: true, message: "payment successfull, you will be redirected to shortly!", response: response, redirectUrl: '/dashboard'});

        } else  {

            await Order.destroy({where : {id: orderId}});
            console.error('Error capturing payment:', error.message);
            res.status(500).json({success: true, messagge: "payment did not go through, internal error"});

        }
        

    }  catch (error) {

        await Order.destroy({where : {id: orderId}});
        console.error('Error capturing payment:', error.message);
        res.status(500).json({success: true, messagge: "payment did not go through, internal error"});
    }

    
}); 


/////////////////////////////////////////////////////////////////////////////


app.post('/getOrders', async (req, res) =>{
    
    const userId = req.body.userId;

    try {
        const restaurant = await Restaurant.findOne({where : {userId : userId}});
        const orders = await Order.findAll({where : {restaurantId : restaurant.id}});

        
        res.status(200).json({success: true, message: "orders loaded successfully, sending them now", orders : orders});

    } catch {

        res.status(500).json({success: false, message: "error, something went wrong"});

    }


});


/////////////////////////////////////////////////////////////////////////////


async function createOrder(purchase_units, restaurantId, userId, orderId){
    let access_token = await generateAccess_Token();

    
    console.log(`2- (create order function): access token used by the create order function: `, access_token);
    
    const response = await axios({
        url: 'https://api-m.sandbox.paypal.com/v2/checkout/orders',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + access_token
        },
        data: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: purchase_units,
            application_context: {
                return_url : `http://localhost:4200/succesfullPayment?orderId=${orderId}`,
                cancel_url : `http://localhost:4200/restaurantPage/${restaurantId}?restaurantId=${restaurantId}&${userId}=userId`,
                shipping_preference: 'NO_SHIPPING',
                user_action: 'PAY_NOW',
                brand_name: 'Halal Eatz'
            }
        }) 
    })
    console.log("2- (inside create order function): order id: ", response.data);


    
    return response.data.links.find(link => link.rel === "approve").href;
};

/////////////////////////////////////////////////////////////////////////////


async function generateAccess_Token(){
    const response = await axios({
        url: "https://api-m.sandbox.paypal.com/v1/oauth2/token",
        method: 'POST',
        data: 'grant_type=client_credentials',
        auth: {
            username: process.env.paypal_accessToken_auth_username,
            password: process.env.paypal_accessToken_auth_password,
        }
    })

    console.log(`1- (generate access token function: access token generated: `, response.data.access_token);
    return response.data.access_token;
}


/////////////////////////////////////////////////////////////////////////////

const processedPayments = new Set();

async function capture_payment(paymentId){
    
    if (processedPayments.has(paymentId)){
        console.log('payment already captured, cancelling capture payment function');
        
        return response  = {
            status: "already complete"
            
        }
    } else {

        let access_token = await generateAccess_Token();

        console.log(`capture payment FUNCTION called!`);
    

        console.log(`3- access token passed to capture payment: ${access_token}`); 

        console.log(`3-  id passed to the capture function: ${paymentId}`);
    

        const response = await axios({
                url: `https://api-m.sandbox.paypal.com/v2/checkout/orders/${paymentId}/capture`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + access_token

                },

            });

        if(response.data.status === 'COMPLETED'){
            processedPayments.add(paymentId);
            console.log('first time capturing, payment id addedd to process payments set');
        }
    
        console.log(response.data); 
        return response.data;

    }

} 








    

    


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT} !`);
});






