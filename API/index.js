
//import different apps and frameworks necessary for your application
const express = require("express");
const {Sequelize, User, Restaurant, Review, Role, Menue } = require("./models"); //import all data object models
const cors=require("cors"); //grants security authorization for the front end app to interact with the backend app
const multer=require("multer"); //multer is important for uploading files, which will be necessary when uploading images to the database
const bodyParser = require('body-parser');
const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = '490153988551-ennqdrg2knoqj3rm1encr5vq0f7tlh50.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);
const session = require('express-session');
const path = require('path'); 
const fs = require('fs');





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
    } else if (type == "menue" ){
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

    
    await User.destroy({ where: {} });
    await Restaurant.destroy({ where: {} });
    
    console.log(`user destroyed to allow for a new restaurant submission`);
    
    //extract received information
    const token = req.body.id_token;
    const resInfo = JSON.parse(req.body.resInfo);
    const uploadedImg = req.file;
    const type = req.body.type;
    const relItem = req.body.relItem
    console.log(uploadedImg.filename);


    //change image name
    const newImageName = generateImgName(resInfo.name, type, uploadedImg.originalname, relItem)
    console.log(newImageName);

    // declaring paths and renaming the newly stored image!
    const oldPath = path.join(__dirname, 'uploads', uploadedImg.filename);
    const newPath = path.join(__dirname, 'uploads', newImageName);

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
            console.log("user doesn't exist, creating user now, of account type 2");


            user = await User.create({
                email, picture, firstName: given_name, lastName: family_name, accountType: 2, 
            });
            req.session.userId = user.id;
            req.session.isLoggedIn = true;

            console.log("user created!");
            console.log("creating restaurant now!");
            


            
            const addy = {
                address : resInfo.location,
                lon : resInfo.lon,
                lat : resInfo.lat,
            }
            
            restaurant = await Restaurant.create({
                
                name: resInfo.name,
                location: addy, 
                openingHours: JSON.stringify(resInfo.days), 
                halalRating: resInfo.halalRating, 
                userId: user.id, 
                coverImg: path.join(__dirname, 'uploads', newImageName) ? newImageName: null
            });


            let restaurant2 = await Restaurant.findOne({where : {name : resInfo.name }})
            console.log(`**************************** ${restaurant2}`);

            

            res.status(201).json({success: true, message: "You have listed your restaurant successfully, please set up your menu to get up and running!", user, redirectUrl: "/restaurantDashboard"});
        } else {
            res.status(200).json({success: false, message: "The email is already associated with another account, please use an email that is specifically for your restaurant!", user, redirectUrl: "/listing-form"});
        }
        



    } catch {
        console.log("lolololo, terrible request");
        
        res.status(400).json({error: 'invalid token', redirectUrl: "/error"});
    }


});


app.post('/submitMenue', async (req, res) => {
    //extract information
    const menue = JSON.parse(req.body.menue);
    console.log(`menue received in the back end: ${menue}`);

    const resName = req.body.resName;
    console.log(`resName: ${resName}`);

    const resLocation = req.body.resLocation;
    console.log(`resLocation: ${resLocation}`);

    //find a restaurant with the provided information!
    let relres = await Restaurant.findOne({where: {name: resName, location: resLocation }});
    try{
        if(relres) {
            newMenueObject = await Menue.create({
                meals: menue.meals, 
                deserts: menue.deserts, 
                drinks: menue.deserts,
                restaurantId: relres.id,
            });
    
            res.status(200).json({success: true, message: "Your restaurant menue has been added successfully", redirectUrl: '/restaurantDashboard'});
        } else {
            res.status(200).json({success: false, message: "The restaurant you tried to add your menue to does not exist, please submit your restaurant details first!!!", redirectUrl: '/listing-form'});
        }
    } catch {
        res.status(400).json({error: 'Menue could not be added!', redirectUrl: "/listing-form"});
    }
    



});









const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT} !`);
});





