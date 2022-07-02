var express = require("express");
var passport = require("passport");

var User = require("../../models/user");
var Card = require("../../models/Card");
var router = express.Router();
var Wallet = require("../../models/wallet");
var Report = require("../../models/report");
var Item = require("../../models/item");
var http = require('http');  
//var await = require("await");
var MongoClient = require('mongodb').MongoClient;  
var url = "mongodb://localhost:26061/EZBUY"; 
var ObjectId = require('mongodb').ObjectId; 

router.get("/", function (req, res) {
   // console.log("hello I'm on the start page");
   res.render("home");
});

router.get("/home", function (req, res) {
   res.render("./home");
});

router.get("/about", function (req, res) {
   res.render("./about");
});

router.get("/login", function (req, res) {
   res.render("./login")
});

router.get("/logout", function(req, res){
   req.logout();
   res.redirect("./home");
});




function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}



router.post("/login", passport.authenticate("login", {
   successRedirect: "/",
   failureRedirect: "/login",
   failureFlash: true
}));









router.get("/signup", function (req, res) {
   res.render("./signup")
});









router.post("/signup", function (req, res, next) {
   var username = req.body.username;
   var email = req.body.email;
   var password = req.body.password;

   User.findOne({ email: email }, function (err, user) {
      if (err) { return next(err); }
      if (user) {
         req.flash("error", "There's already an account with this email");
         return res.redirect("/signup");
      }


      var newUser = new User({
         username: username,
         password: password,
         email: email,
      });
      var CUser=newUser;
      //console.log(CUser);
      var wallet = new Wallet({CUser:CUser});
      wallet.save();
      newUser.wallet=wallet;

      newUser.save(next);

   });

}, passport.authenticate("login", {
   successRedirect: "/",
   failureRedirect: "/home",
   failureFlash: true
}));








// router.get("/wallet", function (req, res) {
//    MongoClient.connect(url, function(err, client) {
//       var db = client.db();
//       var wallet
//      // console.log(req.user.wallet);

//     db.collection("wallets").findOne({CUser:"new"+req.user._id}, function(err, result) {
//     if (err) throw err;
//     console.log(result.Credit);
//     res.render("./wallet",{result:result.Credit});
//     //db.close();
//   });
// });
// });








router.get("/profile", function (req, res) {
   MongoClient.connect(url, function(err, client) {
      var db = client.db();

      
      UID=req.user.wallet.toString();
      console.log(UID);      

    db.collection("wallets").findOne({"_id":ObjectId(UID)}, function(err, result) {
    if (err) throw err;
    db.collection("users").findOne({_id: ObjectId(req.user._id)}, function(err, user) {
    if (err) throw err;

    //console.log(result);
     var sold_arr_id=user.solditems;
    var pur_arr_id = user.purchased;
    let sold_arr = sold_arr_id.map(ObjectId);
    let pur_arr = pur_arr_id.map(ObjectId);
    db.collection("reports").find({$or: [{Buyer: ObjectId(req.user._id.toString())},{Seller: ObjectId(req.user._id.toString()) }]}).toArray( function(err, reports) {
      console.log(reports);
      
    res.render("./profile",{result:result.Credit,reports:reports});
    //db.close();
  });
      });
});
    });
});










router.get("/addcredit", function (req, res) {
    MongoClient.connect(url, function(err, client) {
      var db = client.db();
     // console.log(req.user.wallet);

    db.collection("wallets").findOne({CUser:ObjectId(req.user._id.toString())}, function(err, result) {
    if (err) throw err;
   // console.log(result.Credit);
    res.render("./addcredit",{result:result.Credit});
    //db.close();
  });
});
  // res.render("./addcard")
});









router.post("/addcredit", function (req, res, next) {
  
   var CNumber = req.body.CNumber;
   var CVV = req.body.CVV;
   var CardHolder = req.body.CardHolder;
   var Ex_Date = req.body.Ex_Date;
   var CUser = req.user;
   var Credit = parseInt(req.body.Credit);
  // var RES = new Number ;
  console.log(CNumber);

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
      console.log(newCard);

      newCard.save(next);
   }
      MongoClient.connect(url, function(err, client) {
      var db = client.db();
     // console.log(req.user.wallet);


    db.collection("wallets").updateOne({_id:ObjectId(req.user.wallet.toString())},{$inc:{Credit:Credit}}, function (err,updated){

      //console.log();
    }); 
    


        
        });

   });
   res.redirect("./profile");

});







router.get("/additem", function (req, res) {
   res.render("./additem")
});






router.get("/search", function (req, res) {
   res.render("./search")
});






const 
URL = require('url');
//window = require('window');

// new URL object
  









router.get("/Purchase", function (req, res) {

var id = req.query.id;
MongoClient.connect(url, function(err, client) {
      var db = client.db();
     // console.log(req.user.wallet);
console.log(id);
    if (err) throw err;
   // var o_id = new ObjectId(id);
    //console.log(o_id);
    
   db.collection("items").findOne({_id:ObjectId(id)}, function(err, item) {
     if (err) throw err;
     var price=item.Price;
     Sid=item.CUser.toString();
     var Uid= ObjectId(Sid);
     var scredit;
     var bcredit;

      console.log("Price "+price);
console.log("Seller "+Uid);

    db.collection("wallets").findOne({CUser:ObjectId(Uid.toString())}, function(err, SC) {
    if (err) throw err;
    db.collection("wallets").findOne({CUser:ObjectId(req.user._id.toString())}, function(err, BC) {
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


  db.collection("users").findOne({_id:ObjectId(Uid.toString())}, function(err, Selleracc) {
    if (err) throw err;
    if(Selleracc.solditems.indexOf(item._id.toString()) === -1){
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
        // DeliveryDate: new Date(addDays(Date.now(),item.DeliveryDays))
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
   var myquery = { _id: ObjectId(id) };
  var newvalues = { $set: {CUser: null } };
  db.collection("items").updateMany(myquery, newvalues,{multi:true}, function(err, res) {
    if (err) throw err;
    console.log(req.user);
   // db.close();
  });
  
  db.collection("items").find({CUser:ObjectId(req.user._id.toString())}).toArray(function(err, result) {
    if (err) throw err;
   // console.log(result);
  res.redirect('/profile');
   // res.render("./items",{result:result});
  });
});
});








router.get("/items", function (req, res) {
   MongoClient.connect(url, function(err, client) {
      var db = client.db();
     // console.log(req.user.wallet);

    if (err) throw err;
  db.collection("items").find({CUser:req.user._id}).toArray(function(err, result) {
    if (err) throw err;
    //console.log(result);

    res.render("./items",{result:result});
  });
});
});








router.post("/search", function (req, res) {
   MongoClient.connect(url, function(err, client) {
      var db = client.db();
     // console.log(req.user.wallet);

    if (err) throw err;
  db.collection("items").find({"Name" : {$regex : req.body.SearchInput}}).toArray(function(err, result) {
    if (err) throw err;

   //var result= db.items.find( { CUser: { $not: { $gt: !req.body.user } } } );

    console.log(result);
    res.render("./searchitems",{result:result});
  });
});
});







router.post("/additem", function (req, res, next) {
   var SN = req.body.SN;
   var DString = req.body.DText;
   var Price = req.body.Price;
   var Name = req.body.ItemName;
   var CUser = req.user;
   var DeliveryDays = req.body.Delivery_Days;
  // var Seller = rreq.user.username;

   Item.findOne({ SN: SN }, function (err, item) {
      if (err) { return next(err); }

     

      var newItem = new Item({
         SN: SN,
         DString:DString,
         Price: Price,
         Name: Name,
         CUser:CUser,
         Seller:CUser.username,
         DeliveryDays: DeliveryDays
      });
      
      newItem.save();
      MongoClient.connect(url, function(err, client) {
      var db = client.db();

    if (err) throw err;
  db.collection("items").find({CUser:req.user._id}).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
    res.redirect('./items');
  });
});
   });
});







router.get("/edit", function (req, res) {
   var ID = req.query.id;
   var OID =  new ObjectId(ID);
    MongoClient.connect(url, function(err, client) {
      var db = client.db();
    db.collection("items").findOne({_id:OID},function (err,result){
       //console.log(result);
       res.render("./edit",{result:result});
    });
});
 });







router.get("/remove", function (req, res) {
   var ID = req.query.id;
   var OID =  new ObjectId(ID);
    MongoClient.connect(url, function(err, client) {
      var db = client.db();
    db.collection("items").remove({_id:OID},function (err,result){
       //console.log(result);
       res.redirect("./items");
    });
});
 });







router.post("/edit", function (req, res, next) {
    var ID = req.body.ItemID;
   var SN = req.body.SN;
   var DString = req.body.DText;
   var Price = req.body.Price;
   var Name = req.body.ItemName;
   var OID =  new ObjectId(ID);
  
      MongoClient.connect(url, function(err, client) {
      var db = client.db();
     // console.log(req.user.wallet);

    if (err) throw err;
    console.log("ID is "+OID);
    db.collection("items").findOne({_id:OID},function (err,result){
       console.log(result);
    });
   
  db.collection("items").updateOne({_id:OID},{$set:{SN:SN, DString:DString,Price: Price,Name: Name}});
  
  res.redirect("./items");

});
});






module.exports = router;