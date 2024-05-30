
//import different apps and frameworks necessary for your application
const express = require("express");
const {Sequelize, User, Restaurant, Review, Role } = require("./models"); //import all data object models
const cors=require("cors"); //grants security authorization for the front end app to interact with the backend app
const multer=require("multer"); //multer is important for uploading files, which will be necessary when uploading images to the database




//assigning an express instance to an "app" object, basically making the express app
const app= express();

//Setting the view engine as ejs
app.set('view engine', 'ejs');

//calling the use function to use cors and json data
app.use(cors());
app.use(express.json());


//set up multer images uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });


/* 
add routed here

*/

//the following is an example path
app.get('/', async (req, res) => { //defining the route
    try {
        console.log('practice route reached!!'); //standard print to the console
        res.render("index"); //you can many things with res.${function}
        
    }
    catch (error) {
        
    }
})


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT} !`);
});





