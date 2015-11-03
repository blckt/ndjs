var mongoose = require('mongoose');
var Schema=mongoose.Schema;
var UserSchema= new Schema({
  
    email:{
        type:String,required:true,unique:true
    },
  
   pswd:{
        type:String,required:true
    },
    phone:{
    type:String
}, 
    Name:{ type:String,required:true
                           },
    token:{
        type:String
    }
    
});
module.exports = mongoose.model('User', UserSchema);
