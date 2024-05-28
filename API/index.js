
//import different apps and frameworks necessary for your application
const express = require("express");
const {Sequelize, User, Restaurant, Review, Role } = require("./models"); //import all data object models
const cors=require("cors"); //grants security authorization for the front end app to interact with the backend app
const multer=require("multer"); //multer is important for uploading files, which will be necessary when uploading images to the database




//assigning an express instance to an "app" object
const app= express();

//calling the use function to use cors and json data
app.use(cors());
app.use(express.json());


//set up multer images uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });


/* 
add routed here

*/

app.get('/API/User/', async (request, response) => { //defining the route
    try {
        const users = await User.findAll(); // fetch all user data from the User model table
        response.json(users); // when the response comes, jsonify it
    }
    catch (error) {
        console.error("Error fetching users: ", error)
    }
})


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT} !`);
});


