var bcrypt = require("bcryptjs");
var mongoose=  require("mongoose");

const SALT_FACTOR =10;
var CardSchema = mongoose.Schema({
	CardHolder:{type:String, required:true},
	CVV:{type:String,required:true,minlength:3,maxlength:3},
	Ex_Date:{type:String},
	CNumber:{type:String,required:true,unique:true,minlength:12,maxlength:12},
	CUser:{type: mongoose.Schema.Types.ObjectId, 
    ref: 'user',required:true}
});

CardSchema.pre("save",function(done){
	var card = this;

	if(!card.isModified("CVV")){
		return done();
	}

	bcrypt.genSalt(SALT_FACTOR,function(err,salt){

		if(err){return done(err);}
		bcrypt.hash(card.CVV,salt,function(err,hashedPassword){
			if(err){return done(err);}

			card.CVV = hashedPassword;

		//	done();

		});
		bcrypt.hash(card.CNumber,salt,function(err,hashedNumber){
			if(err){return done(err);}

			card.CNumber = hashedNumber;

			done();

		});
	});
});

//CardSchema.methods.checkPassword = function(guess, done){
	if(this.CVV != null){
		bcrypt.compare(guess,this.CVV,function(err,isMatch){
			done(err,isMatch);
		});
	}
	if(this.CNumber != null){
		bcrypt.compare(guess,this.CNumber,function(err,isMatch){
			done(err,isMatch);
		});
	}
//}

var CARD = mongoose.model("Card",CardSchema);

module.exports = CARD;