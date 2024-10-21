
//import different apps and frameworks necessary for your application
const express = require("express");
const {sequelize, User, Restaurant, Review, Role, Menue } = require("./models"); //import all data object models
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






//assigning an express instance to an "app" object, basically making the express app
const app= express();

//Setting the view engine as ejs. The following is unnecessary as angular will handle the frontend
app.set('view engine', 'ejs');


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
            });
            req.session.userId = user.id;
            req.session.isLoggedIn = true;
            res.status(201).json({success: true, message: "You have signed up successfully!", user, redirectUrl: "/dashboard"});
        } else {
            console.log("user found, logging in...");
            req.session.userId = user.id;
            req.session.isLoggedIn = true;
            res.status(200).json({success: true, message: "You have logged in successfully!", redirectUrl: '/dashboard'});
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

    Restaurant.destroy({ where: {} });
    User.destroy({ where: {} });

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
    const newPath = path.join(__dirname, 'uploads', newImageName);
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
            
            user = await User.create({
                email, picture, firstName: given_name, lastName: family_name, accountType: 2, 
            });
            req.session.userId = user.id;
            req.session.isLoggedIn = true;

            
            restaurant = await Restaurant.create({
                
                name: resInfo.name,
                location: resInfo.location,
                lat: resInfo.lat,
                lon: resInfo.lon,
                openingHours: JSON.stringify(resInfo.days), 
                halalRating: resInfo.halalRating, 
                UserId: user.id, 
                images: newPath,
            });


        
            
            res.status(201).json({success: true, message: "You have listed your restaurant successfully, please set up your menu to get up and running!", user, redirectUrl: "/restaurantDashboard"});
        } else {
            res.status(200).json({success: false, message: "The email is already associated with another account, please use an email that is specifically for your restaurant!", user, redirectUrl: "/listing-form"});
        }
        



    } catch {
        console.log("lolololo, terrible request");
        
        res.status(400).json({error: 'invalid token', redirectUrl: "/error"});
    }


});


app.post('/submitMenue', upload.single('image'), async (req, res) => {
    Menue.destroy({ where: {} });

    
    try{
        //extract all the information
        
        const menueItemObject = JSON.parse(req.body.menueItem);
        
        
        const image = req.file;
        const resName = req.body.resName;
        
        const resLocation = req.body.resLocation;
        
        const itemType = menueItemObject.type;
       
        const relItem = menueItemObject.name;
        
        
        
        
        
        //change uploaded image name
        const itemImageName = generateImgName(resName, itemType, image.originalname, relItem);
    
        const oldPath = path.join(__dirname, 'uploads', image.filename);
        const newPath = path.join(__dirname, 'uploads', itemImageName);

        fs.rename(oldPath, newPath, (err) => {
            if (err) {
                console.error('Error renaming file:', err);
                
            }
        
        });

        //store image path
        menueItemObject.imgPath = newPath;
        const menueItemString = JSON.stringify(menueItemObject);
        
    
        //find the related restaurant
        let restaurant = await Restaurant.findOne({where : {name : resName, location : resLocation}});
       
        
        if (!restaurant) {
            
            return res.status(404).json({ success: false, message: "Restaurant or User not found" });
        }
        

        
        
        
        let menue = await Menue.findOne({where : {RestaurantId: restaurant.id, UserId: restaurant.UserId}});
        

        if (!menue){

    
            menue = await Menue.create({
                meals: [],
                drinks:[],
                deserts:[],
                RestaurantId: restaurant.id,
                UserId: restaurant.UserId

            });
           
            
            if (itemType === 'meal'){
                menue.meals.push(menueItemString);
                menue.meals.push(menueItemString);
                
            } else if (itemType === 'drink'){
                menue.drinks.push(menueItemString);
            } else if (itemType === 'desert'){
                menue.deserts.push(menueItemString);
            } else {
                return res.status(400).json({ success: false, message: "Invalid item type" });
            }
            
            await menue.save();
        } else {
            if (itemType === 'meal'){
                menue.meals.push(menueItemString);
            } else if (itemType === 'drink'){
                menue.drinks.push(menueItemString);
            } else if (itemType === 'desert'){
                menue.deserts.push(menueItemString);
                
            } else {
                return res.status(400).json({ success: false, message: "Invalid item type" });
        
            }
           
            await menue.save();
        }


        

        

        res.status(201).json({success: true, message: "You have added an item to the menu successfully!"});


    } catch {
        res.status(500).json({success: false, message: "Error adding an item your menue"});
    }

    
        
    





});



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





const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT} !`);
});







