var bcrypt = require("bcryptjs");
var mongoose=  require("mongoose");

const SALT_FACTOR =10;
var WalletSchema = mongoose.Schema({
	Credit:{type:Number,required:true,default:1000},
	 CUser:{type: mongoose.Schema.Types.ObjectId, 
     ref: 'user',required:true}
});

WalletSchema.pre("save",function(done){
	var wallet = this;
	done();

	
});

var WALLET = mongoose.model("wallet",WalletSchema);

module.exports = WALLET;