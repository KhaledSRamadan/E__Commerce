var express = require("express");
var router = express.Router();

router.get("/",function(req,res){
	console.log("Hello I'm on Start");
	res.render("index");
});
router.get("/home",function(req,res){
	res.render("home");
})

router.get("/about",function(req,res){
	res.render("about");
})

module.exports = router;