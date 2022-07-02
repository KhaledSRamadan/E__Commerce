var express = require("express");
const jwt = require("jsonwebtoken");
var passport = require("passport");
const tokenSecret = "my-token-secret";
const middleware = require("../../middleware")
var User = require("../../models/user");
var Card = require("../../models/Card");
var router = express.Router();
var bodyParser = require('body-parser')
 // var router = express.Router();
var bcrypt = require("bcryptjs");
 var jsonParser = bodyParser.json();
var ObjectId = require('mongodb').ObjectId;
var Wallet = require("../../models/wallet");
var Item = require("../../models/item");
var http = require('http');  
//var await = require("await");
var MongoClient = require('mongodb').MongoClient;  
var url = "mongodb://localhost:26061/EZBUY"; 

const verify = require('./verifyToken');
var ObjectId = require('mongodb').ObjectId;   






router.get("/",verify, function (req, res) {
   // console.log("hello I'm on the start page");
   res.send(req.user.username);
});



function generateToken(user){return jwt.sign({data: user},tokenSecret, {expiresIn: '24h'})}




router.get("/login",jsonParser, function (req, res,done) {
  User.findOne({email:req.body.email}).then(user =>{
  	console.log(req.body.email);
  	if(!user) {res.status(404).json({error: 'no user'});}
  	else { 
  		bcrypt.compare(req.body.password, user.password,(error, match) => {
  			console.log(req.body.password);
  			if(error){res.status(404).jason(error);}
  			else if(match){
  				const token = jwt.sign({_id:user._id,username:user.username},tokenSecret);
  				res.header('auth-token',token).send(token);

  				//return done(null, user);
  			}
  			else {res.status(403).json({error:'password no match'});}
  		})
  	}
  }).catch(error =>{
  	res.status(500).json(error)
  })
});





 router.post("/signup",jsonParser, function (req,res){
 	const newUser = new User({
 		username: req.body.username,
 		email : req.body.email,
 		password : req.body.password
 	});
 	// User.findOne({ email: email }, function (err, user) {
      //if (err) { return next(err); }
      // if (user) {
      //    res.send("There's already an account with this email");
      //    return res.redirect('http://127.0.0.1:3000/api/signup');
      // }



     try{ var CUser=newUser;
      //console.log(CUser);
      var wallet = new Wallet({CUser:CUser});
      wallet.save();
      newUser.wallet=wallet;
      newUser.save();
     	const token = jwt.sign({_id:newUser._id,username:newUser.username},tokenSecret);
  				res.header('auth-token',token).send(token);

     }catch(err){
     	res.status(400).send(err);
     }
    

 }, passport.authenticate("login", {
   successRedirect: "/",
   failureRedirect: "/home",
   failureFlash: true
}));








router.get("/search", function (req, res) {
   res.send("search")
});







router.post("/search",verify,jsonParser, function (req, res) {
   MongoClient.connect(url, function(err, client) {
      var db = client.db();
      var user_id= new ObjectId(req.user._id);
     

    if (err) throw err;
   // console.log(req.body.search);
  db.collection("items").find({$and: [{CUser: {$not:{$eq:user_id}}},{"Name" : {$regex : req.body.search}}]}).toArray(function(err, result) {
    if (err) throw err;

   //var result= db.items.find( { CUser: { $not: { $gt: !req.body.user } } } );

    console.log(result);
    res.send({result:result});
  });
});
});






router.get("/profile",jsonParser,verify ,function (req, res) {
   MongoClient.connect(url, function(err, client) {
      var db = client.db();
      console.log(req.user);

    db.collection("wallets").findOne({CUser:ObjectId(req.user._id)}, function(err, wallet) {
    if (err) throw err;
    console.log(wallet);
    
   // res.render("./profile",{result:result.Credit});
    //db.close();
     db.collection("users").findOne({_id: ObjectId(req.user._id)}, function(err, user) {
    if (err) throw err;
    //console.log(user);
   var sold_arr_id=user.solditems;
    var pur_arr_id = user.purchased;
    let sold_arr = sold_arr_id.map(ObjectId);
    let pur_arr = pur_arr_id.map(ObjectId);
   
         db.collection("reports").find({Buyer: ObjectId(req.user._id.toString())}).toArray( function(err, Sells) {
      //console.log(reports);
      db.collection("reports").find({Buyer: ObjectId(req.user._id.toString())}).toArray( function(err, Purs) {
      //console.log(reports);
    res.send([{"User":user},{"Wallet":wallet},{"Sold Items":Sells},{"Purchased Items":Purs}]);
    //db.close();
  });
      });
         });
    });
  });
});




router.post("/addCredit",jsonParser,verify, function (req, res, next) {
  

  
   var CNumber = req.body.CNumber;
   var CVV = req.body.CVV;
   var CardHolder = req.body.CardHolder;
   var Ex_Date = req.body.Ex_Date;
   var CUser = new ObjectId(req.user._id);
   var Credit = req.body.Credit;

  // var RES = new Number ;

   Card.findOne({ CNumber: CNumber }, function (err, card) {
      if (err) { return next(err); }
      if (card) {
         req.flash("error", "There's already a card with this Number");
         //return res.redirect("/addcard");

      }
      if(!card){

      var newCard = new Card({
         CNumber: CNumber,
         CVV: CVV,
         CardHolder: CardHolder,
         Ex_Date: Ex_Date,
         CUser:CUser
      });

      newCard.save(next);
   }
      MongoClient.connect(url, function(err, client) {
      var db = client.db();
     // console.log(req.user.wallet);


    db.collection("wallets").updateOne({CUser:ObjectId(req.user._id)},{$inc:{Credit:Credit}}, function (err,updated){
console.log("Credit added: "+Credit);
      //console.log(updated);
    }); 
    


        
        });

   });
   res.redirect('http://127.0.0.1:3000/api/mprofile');

});






router.post("/additem",verify,jsonParser, function (req, res, next) {
   var SN = req.body.SN;
   var DString = req.body.DText;
   var Price = req.body.Price;
   var Name = req.body.ItemName;
   var CUser = new ObjectId(req.user._id);
  // var Seller = rreq.user.username;
var ItemSeller;
   Item.findOne({ SN: SN }, function (err, item) {
      if (err) { return next(err); }
      

     

      var newItem = new Item({
         SN: SN,
         DString:DString,
         Price: Price,
         Name: Name,
         CUser:CUser,
         Seller:req.user.username
         
      });
      
      newItem.save();
      MongoClient.connect(url, function(err, client) {
      var db = client.db();
     // console.log(req.user.wallet);

    if (err) throw err;
  db.collection("items").find({CUser:ObjectId(req.user._id)}).toArray(function(err, result) {
    if (err) throw err;
   // console.log(result);
    res.send(result);
  });
});
   });
});



router.get("/items",verify,jsonParser,function (req,res){
	MongoClient.connect(url, function(err, client) {
      var db = client.db();
     // console.log(req.user.wallet);

    if (err) throw err;
  db.collection("items").find({CUser:ObjectId(req.user._id)}).toArray(function(err, result) {
    if (err) throw err;
   // console.log(result);
    res.send(result);
  });
});
});




router.post("/purchase",verify,jsonParser, function (req, res) {

var id = req.query.id;
MongoClient.connect(url, function(err, client) {
      var db = client.db();
     // console.log(req.user.wallet);
console.log(id);
    if (err) throw err;
    var o_id = new ObjectId(id);
    console.log(o_id);
    
   db.collection("items").findOne({_id:o_id}, function(err, item) {
     if (err) throw err;
     var price=item.Price;
     Sid=item.CUser;
     var Uid= ObjectId(Sid);
     var scredit;
     var bcredit;

      console.log("Price "+price);
console.log("Seller "+Uid);

    db.collection("wallets").findOne({CUser:Uid}, function(err, SC) {
    if (err) throw err;
    db.collection("wallets").findOne({CUser:ObjectId(req.user._id)}, function(err, BC) {
    if (err) throw err;
    scredit=SC.Credit;
    bcredit=BC.Credit;
    console.log("scredit "+scredit);
console.log("bcredit "+bcredit);
  db.collection("wallets").updateMany({CUser:ObjectId(Uid.toString())}, {$set: { Credit: scredit+price }},{multi:true}, function(err, res) {
   if (err) throw err;
    
  });
  db.collection("wallets").updateMany({CUser:ObjectId(req.user._id.toString())}, {$set: { Credit: bcredit-price }},{multi:true}, function(err, res) {
   if (err) throw err;
  });
  db.collection("users").findOne({_id:ObjectId(Uid.toString())}, function(err, Seller) {
    if (err) throw err;
    if(Seller.solditems.indexOf(item._id.toString()) === -1){
  db.collection("users").updateMany({_id:ObjectId(Uid.toString())}, {$push: { solditems: item._id.toString() }},{multi:true}, function(err, res) {
   if (err) throw err;
    
  });}
  var newReport = new Report({
         P_SN: item.SN,
         P_DString:item.DString,
         Transaction_Ammount: item.Price,
         P_Name: item.Name,
         Seller: ObjectId(Uid.toString()),
         Buyer: ObjectId(req.user._id.toString()),
         BuyerName: req.user.username,
         SellerName: Selleracc.username ,
        // DeliveryDate: addDays(Date.now(),item.DeliveryDays)
      });
      
      newReport.save();
});
   db.collection("users").findOne({_id:ObjectId(req.user._id.toString())}, function(err, buyer) {
    if (err) throw err;
    if(buyer.purchased.indexOf(item._id.toString()) === -1){
  db.collection("users").updateMany({_id:ObjectId(req.user._id.toString())}, {$push: { purchased: item._id.toString() }},{multi:true}, function(err, res) {
   if (err) throw err;
   });}
  });

  });
   }); 
  });
   var myquery = { _id: o_id };
  var newvalues = { $set: {CUser: ObjectId(req.user._id), Seller: req.user.username } };
  db.collection("items").updateOne(myquery, newvalues, function(err, res) {
    if (err) throw err;
    console.log(req.user);
   // db.close();
  });
  
 // db.collection("items").find({CUser:req.user._id}).toArray(function(err, result) {
   // if (err) throw err;
   // console.log(result);
  res.redirect('http://127.0.0.1:3000/api/profile');
   // res.render("./items",{result:result});
  //});
});
});




router.post("/remove",verify,jsonParser, function (req, res) {
   var ID = req.query.id;
   var OID =  new ObjectId(ID);
    MongoClient.connect(url, function(err, client) {
      var db = client.db();
    db.collection("items").remove({_id:OID},function (err,result){
       //console.log(result);
       res.redirect('http://127.0.0.1:3000/api/items');
    });
});
 });




router.post("/edit", verify,jsonParser, function (req, res) {
   var ID = req.query.id;
   var OID =  new ObjectId(ID);
    MongoClient.connect(url, function(err, client) {
      var db = client.db();
    db.collection("items").findOne({_id:OID},function (err,result){
       console.log(result);
       var item = result;
   
   
       if(req.body.SN){
       	 item.SN = req.body.SN;
       }
       if(!req.body.SN){
       	item.SN = item.SN;

       }
      if(req.body.DString){
       	 item.DString = req.body.DText;
       }
        if(!req.body.DString){
       	item.DString = item.DString;

       }

   if(req.body.Price){
       	 item.Price = req.body.Price;
       }
        if(!req.body.Price){
       	item.Price = item.Price;

       }
       if(req.body.Name){
       	 item.Name = req.body.Name;
       }
        if(!req.body.Name){
       	item.Name = item.Name;

       }
       
   
       db.collection("items").updateMany({_id:OID},{$set:{SN:item.SN, DString:item.DString,Price: item.Price,Name: item.Name}},{multi:true});
    });
});
    res.redirect('http://127.0.0.1:3000/api/items')
 });


module.exports = router;