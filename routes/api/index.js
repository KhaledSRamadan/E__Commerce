var express = require("express");

var router = express.Router();



//TODO:: add in error and info 

// router.use(function(req,res, next){
//     res.locals.currentUser = req.user;

//     next();
// });


router.use("/", require("./api_home"));


module.exports = router;