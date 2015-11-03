var mongoose=require('mongoose');
var db= mongoose.connection;
var User= require('../DbModule/UserModel');
var bodyParser=require('body-Parser');
db.on("error",console.error);
db.once('open', function callback () {
    console.log("Connected to DB!");
});
mongoose.connect('mongodb://localhost/testtask');

