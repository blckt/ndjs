var formidable = require('formidable'),
    http = require('http'),
    fs   = require('fs-extra'),
    db=require('../Controllers/DBController'),
    User= require('../DbModule/UserModel'),
    Item=require('../DbModule/ItemModel'),
    path=require('path');
module.exports=function(req,res,User,Item){
    var form = new formidable.IncomingForm();
    form.hash="md5";
    form.parse(req,function(err,fields,files){
     if(err){
         console.log(err);
     }
    });
    form.on('error', function(err) {
        console.error(err);
    });
    form.on('progress', function(bytesReceived, bytesExpected) {
        var percent_complete = (bytesReceived / bytesExpected) * 100;
        console.log(percent_complete.toFixed(2));
    });
    form.on('file', function(name, file) {
        if(file.size>10485760 ){
         //   console.log("File is too big! ");
            
            res.status(422).json({message:"File is too big!Max 10 mb!"});
        }
        console.log(file.type);
        if(file.type!="image/jpeg"&&file.type!="image/png")
        {res.status(422).send({
            message:"Only jpeg\\png files are allowed"
        })}

});
    form.on('fileBegin', function(name, file) {

        file.path = './public/images/'+Date.now()+User._id+Item._id;
    });
    
    form.on('end', function(fields, files) {

        /* Temporary location of our uploaded file */
        if(this.openedFiles[0].path) {
            var temp_path = this.openedFiles[0].path;
            /* The file name of the uploaded file */
            var file_name = this.openedFiles[0].name;
            /* Location where we want to copy the uploaded file */
            var img=fs.readFileSync(temp_path);

        Item.image=temp_path.split('\\')[0];
            Item.save(function(err,result){
                if(err){
                    res.send(err);
                }else{
                    if(result){
res.json({
        id: result._id,
        created_at:result.created_at,
        title:result.title,
        price:result.price,
        image:result.image,
        user_id:result.user_id,
        User:{
            id:User.id,
            phone:User.phone,
            name:User.Name,
            email:User.email

        }
    }
);
                    }
                }
            });

        }

    });

   
}