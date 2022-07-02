var mongoose=  require("mongoose");

var ItemSchema = mongoose.Schema({
	Name:{type:String,required:true,default:"Item"},
	CUser:{type: mongoose.Schema.Types.ObjectId, 
    ref: 'user'},
    SN:{type: String, required:true},
    Price:{type:Number,required:true,MinKey:1,default:1},
    DString:{type:String,default:"generic product"},
    Seller:{type:String,required:true},
    Purchased:{type:Boolean,default:0},
    DeliveryDays:{type:Number}
});

ItemSchema.pre("save",function(done){
	var item = this;
	done();

	
});



var Item = mongoose.model("item",ItemSchema);

module.exports = Item;