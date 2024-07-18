
//import different apps and frameworks necessary for your application
const express = require("express");
const {Sequelize, User, Restaurant, Review, Role } = require("./models"); //import all data object models
const cors=require("cors"); //grants security authorization for the front end app to interact with the backend app
const multer=require("multer"); //multer is important for uploading files, which will be necessary when uploading images to the database
const bodyParser = require('body-parser');
const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = '490153988551-ennqdrg2knoqj3rm1encr5vq0f7tlh50.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);
const session = require('express-session');





//assigning an express instance to an "app" object, basically making the express app
const app= express();

//Setting the view engine as ejs. The following is unnecessary as angular will handle the frontend
app.set('view engine', 'ejs');


//calling the use function to use cors and json data
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(session({
    secret: "secretfornow",
    resave: false,
    saveUninitialized: false,
}));




//set up multer images uploads, might also delete later
const storage = multer.diskStorage();
const upload = multer({ storage: storage });




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









const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT} !`);
});





