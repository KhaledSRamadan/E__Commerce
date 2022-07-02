var mongoose=  require("mongoose");

var ReportSchema = mongoose.Schema({
	P_Name:{type:String,required:true,default:"report"},
	Buyer:{type: mongoose.Schema.Types.ObjectId, 
    ref: 'user'},
    Seller:{type: mongoose.Schema.Types.ObjectId, 
    ref: 'user'},
    P_SN:{type: String, required:true},
    Transaction_Ammount:{type:Number,required:true,MinKey:1,default:1},
    P_DString:{type:String,default:"generic product"},
    //Seller:{type:String,required:true},
    //Purchased:{type:Boolean,default:0}
    Createdat:{type:Date,default:Date.now},
    SellerName:{type:String},
    BuyerName:{type:String},
    //DeliveryDate:{type:Date,default:Date.now}

});

ReportSchema.pre("save",function(done){
	var report = this;
	done();	
});



var Report = mongoose.model("report",ReportSchema);

module.exports = Report;