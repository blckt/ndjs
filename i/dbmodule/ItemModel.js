var mongoose = require('mongoose');
var Schema=mongoose.Schema;
var ItemsSchema= new Schema({
   
   created_at:{type:String},
   
   title:{
   type:String,required:true
   },
    price:{
        type:String,required:true
    
},
    image:{
        type:String
    },
    user_id:{
    type:String,required:true
}
    
});
module.exports = mongoose.model('Items', ItemsSchema);
