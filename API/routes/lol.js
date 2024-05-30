const express  = require('express');
const router =  express.Router()


//basic example of routes in side this routes file for "lol"
router.get('/', async(req, res) => {
    res.send("lol");
});

//another example
router.get('/lol2', async(req, res) => {
    res.send("lol2222");
});

//this to get a url that is dynamic

router.get('/:id', (req, res) => {
    //to access the id, it is the following
    req.params.id
    res.send(`get user with id: ${req.params.id}`);
});


//to chain multpile operations related to the same object, ex: getting, putting, deleting a user. do the following

router.route("/:userid").get((re, res) => {
    res.send(`get user: ${req.params.userid}`);
}).post((req, res) =>{
    res.send(`post user: ${req.params.userid}`);
}).put((req, res) =>{
    res.send(`put user: ${req.params.userid}`);
})


//

module.exports = router;