var bcrypt = require("bcryptjs");
var mongoose=  require("mongoose");

const SALT_FACTOR =10;
var userSchema = mongoose.Schema({
	username:{type:String, required:true, unique:true},
	password:{type:String,required:true},
	createdat:{type:Date,default:Date.now},
	email:{type:String,required:true,unique:true},
	wallet:{type: mongoose.Schema.Types.ObjectId, 
    ref: 'wallet',required:true},
    solditems:{type:Array},
    purchased:{type:Array},
    TranReports:{type:Array}
});

userSchema.pre("save",function(done){
	var user = this;

	if(!user.isModified("password")){
		return done();
	}

	bcrypt.genSalt(SALT_FACTOR,function(err,salt){

		if(err){return done(err);}
		bcrypt.hash(user.password,salt,function(err,hashedPassword){
			if(err){return done(err);}

			user.password = hashedPassword;

			done();

		});
	});
});

userSchema.methods.checkPassword = function(guess, done){
	if(this.password != null){
		bcrypt.compare(guess,this.password,function(err,isMatch){
			done(err,isMatch);
		});
	}
}

var User = mongoose.model("user",userSchema);

module.exports = User;