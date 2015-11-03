var express = require('express');
var router = express.Router();
var db=require('../Controllers/DBController');
var User= require('../DbModule/UserModel');
var Item=require('../DbModule/ItemModel');
var jwt=require("jsonwebtoken");
var multer=require('multer');
var UploadImage=require('../Controllers/ImageUpload');
var User= require('../DbModule/UserModel');
var Item=require('../DbModule/ItemModel');
var path=require('path');
router.get('/', function(req, res, next) {
 res.send('Nothing here yet');
});
router.get('/image/:id',function(req,res){
    Item.findOne({_id:req.params.id},function(err,result){
        res.sendFile(__dirname+result.image.split('.')[1]);
    }) ;
});
router.post('/item/:id/image',function(req,res){
    User.findOne({token:req.headers.authorization},function(err,user){
       if(err){
           res.send(err);
       } else{
           if(user){

               Item.findOne({
                   _id:req.params.id,
                   user_id:user._id
               },function(err,item){
                  if(err){
                      res.send(err);
                  } else{

                      if(item){

                          UploadImage(req,res,user,item);
                      }else{

                          res.status(403,"forbidden").send({
                              message:"You don`t have access to this item"
                          });
                      }
                  }
               });
           }
       }
    });

});
router.delete('/item/:id/image',function(req,res){
    if(req.headers.authorization){
        User.findOne({token:req.headers.authorization},function(err,user){
            if(err){
                req.json(err);
            }else{
                if(user){
                    Item.findOne({_id:req.params.id},function(err,item){
                       if(user._id==item.user_id){
                           item.remove(res.status(200).end("true"));
                       }
                    });
                }
            }
        });
    }else{
        res.status(401).end();
    }
});
router.post('/register',function(req,res,next){
    var UserData={
        email:req.body.email,
        pswd:req.body.password,
        phone:req.body.phone,
        Name:req.body.name,
        
    }
    
    var _user=new User(UserData);
    console.log(req.body.email);
     _user.save(function(err,user){
         
       if(err){
           if(err.code==11000){
               console.log(err);
        return        res.status(422).send({
            field:'email',
            message: 
            req.body.email+" already in use"
        });
               
           }
       }else{
           console.dir(_user);
           user.token=jwt.sign(user,"noidea");
           user.save(function(err,user1){
               res.json({
                   type:true,
                   token:user1.token
               })
           })
       }
         
       
    });
});
 router.post('/login',function(req,res,next){
 User.findOne({email:req.body.email,pswd:req.body.password},
              function(err,user){
     if(err){
         res.json({
            
             data:"Ошибка:"+err
         });
     }else {
         if(user){
             res.json({
                 
                 token:user.token
             });
         }else {
             res.status(422).send({
                 message:"Не верный логин\\пароль"
             });
         }
     }
 });
 });
router.post('/me',function(req,res,next){
    User.findOne({token:req.headers.authorization},function(err,user){
        if(err){
            res.json({
                data:"user not found"
            });
        }else{
            if(user){
                res.json({
                
                     id:user._id,
                     Name : user.Name,
                     email : user.email,
                     phone : user.phone
            });
            }else{
                res.status(401).send({
                    
                })
            }
        }
    });
});
router.put('/me',function(req,res,next){
    User.findOne({token:req.headers.authorization},function(err,user){
                 if(err){
        res.json({
            data:"user not found"
        });
    }else{if(user.token!=req.body.token){
        res.status(401).send({});
    } else{
        if(user){
            if(req.body.Name!=null){
                user.Name=req.body.Name;
            }
            if(req.body.email!=null){
                user.email=req.body.email;
            }
            if(req.body.phone!=null){
                user.phone=req.body.phone;
            }
            if(req.body.pswd!=null){
                if(req.body.pswd==req.body.confirm_pass){
                    user.pswd=req.body.pswd;
                }else{
                    res.status(422).send({
                        field:"current_password",
                        message:"Passwords doesn`t match"
                    });
                }
            }
        }
    }
}
        user.save(function(err,usr){
           if(!err){
               res.json({
                   ID:usr._id,
                   Name:usr.Name,
                   Email:usr.email,
                   Phone:usr.phone
               })
           } 
        });
                  });
});
router.get('/user/:id',function(req,res,next){
    if(req.headers.authorization){
    User.findOne({_id:req.params.id},function(err,user){
        if(user){
       res.json({
           id:user._id,
           Name:user.Name,
           Email:user.email,
           Phone:user.phone
       }); }else{
           res.status(404).send({
               message:"User not found"
           });
       }
    });
    };
});
router.post('/item',function(req,res,next){
    
 if(req.body.title==null){
     res.status(422).send({
         field:"title",
         message:"Title is required"
     });
 }else{if(req.body.price==null){
     res.status(422).send({ field:"price",
         message:"Price is required"});
 }else{
     User.findOne({token:req.headers.authorization},function(err,user){
     
      if(err){
            
            res.json(err);
        } else{
            
            if(user){
               var timestamp=new Date();
                var ts= timestamp.getTime()/1000;
               
                var ItemData={
                    created_at: ts,
                    
                    title:req.body.title,
                    
                    price:req.body.price,
                    user_id:user._id
                };
                var item= new Item(ItemData);
                item.save(function(err,item){
                   if(err){
                       res.json(err);
                   } else {if(item){
                       res.json({
                           id:item._id,
                           created_at:item.created_at,
                           title:item.title,
                           price:item.price,
                           user_id:user._id,
                           user:{
                               id:user._id,
                               phone:user.phone,
                               email:user.email,
                               name:user.Name
                           }
                       });
                   }
                          }
                });
            } else{
                if(!user){
                    res.status(401).send({
                        
                    });
                }
            }
        }
    })
 }
      } 
});
router.get('/user/?',function(req,res,next){
   var name=req.query.name;
    var email=req.query.email;
    if(name!=null&&email!=null){
        User.find({
            Name:name,email:email
        },function(err,user){
          if(err){
              res.send(err);
          }  else{
              if(!user){
                  res.status(404).send({field:"User",message:"User not found"});
              }else{
                  res.status(200).send({id:user._id,name:user.name,email:user.email,phone:user.phone});
              }
          }
        });
    }else{
        if(name!=null){
            User.find({Name:name},function(err,user){
                if(err){
                    res.send(err);
                }  else{
                    if(!user){
                        res.status(404).send({field:"User",message:"User not found"});
                    }else{
                        res.status(200).json(user.map(function(usr){
                            return {ID:usr._id,Name:usr.Name,Email:usr.email,Phone:usr.phone}
                        }));
                    }

                }
            });
        }
        if(email!=null){
            User.find({email:email},function(err,user){
                if(err){
                    res.send(err);
                }  else{
                    if(!user){
                        res.status(404).send({field:"User",message:"User not found"});
                    }else{
                        res.status(200).json(user.map(function(usr){
                            return {ID:usr._id,Name:usr.Name,Email:usr.email,Phone:usr.phone}
                        }));
                    }

                }
            });
        }
    }

});
router.delete('/item/:id',function(req,res,next){
    if(req.headers.authorization){
        User.findOne({token:req.headers.authorization},function(err,user){
            if(err){
                res.json(err)
            }else{
                if(user){
                    Item.findOne({_id:req.params.id},function(error,item){
                    if(error){
                        res.json(error);
                    }
                    if(item){
                        if(item.user_id==user._id){
                        item.remove(res.status(200).send({}));
                    } else{
                        res.status(403).send({});
                    }
                    }else{
                        res.status(404).send({});
                    }
                });

                } else{
                    res.status(401).send({});
                }            }
        });
    }
});
router.post('/items',function(req,res,next){
   User.findOne({token:req.headers.authorization},function(err,user){
       if(user){
           Item.find({user_id:user._id},function(err,result){
               res.json(result);
           })
       }
   }) 
});
router.put('/item/:id',function(req,res,next){
    if(req.headers.authorization){
        User.findOne({token:req.headers.authorization},function(err,user){
           if(err){
               res.json(err);
           } else{
               if(user){
                    Item.findOne({_id:req.params.id},function(error,item){
                if(item){
                    if(item.user_id==user._id){
                       if(req.body.title!=null){
                            if(req.body.title.length>2){
                               item.title=req.body.title;
                            }else{
                                res.status(422).send({
                                   field:"Title",
                                    message:"Should contain at least 3 characters"
                                });
                            }
                       
                       }
                          if(req.body.price!=null){
                           
          if(/[*a-zA-zА-Яа-я]/.test(req.body.price)){
                                   res.status(422).send({field:"price",message:"must be a numeric format"});
          }else{
              item.price=req.body.price;
          }
                           }
                        item.save(function(errr,result){
                            if(errr){
                                res.json(errr);
                            }else{
                                if(result){
                                    res.json({
                                       id:result._id,
                                        created_at:result.created_at,
                                        title:result.title,
                                        price:result.price,
                                        image:result.image,
                                        user_id:result.user_id,
                                        user:{
                                            id:user._id,
                               phone:user.phone,
                               email:user.email,
                               name:user.Name
                                        }
                                    });
                                }
                            }
                        })
                     }else{
                        res.status(403).send({});
                    }
                }else{
                    res.status(404).send({});
                }
            });
               } else{
                   res.status(401).send({});
               }
           }
        });
    }
});
router.get('/item/:id',function(req,res,next){
    Item.findOne({_id:req.params.id},function(err,item){
        if(err){
            res.status(404).send({});
        }else{
            if(item){
               User.findOne({_id:item.user_id},function(error,user){
                 if(user){
                       res.json({
                    id:item._id,
                    created_at:item.created_at,
                    title:item.title,
                    price:item.price,
                    user_id:item.user_id,
                    user:{
                        id:user._id,
                        phone:user.phone,
                        name:user.Name,
                        email:user.email
                        
                    }
                });
                 }  
               });
              
            } 
        }
    });
});
router.get('/item/?',function(req,res,next){
 
    var title=req.query.title;
    var user_id=req.query.user_id;
    var order_by=req.query.order_by||"created_at";
    var order_type=req.query.order_type||"desc";
    if(order_type=="desc"){
        order_type=-1;
    }else{
        order_type=1;
    }
    var data;
    if(user_id!=null&&title!=null){
        Item.find({title:title,user_id:user_id}).sort({order_by:order_type}).exec(function(err,result){
     res.json(result); 
  });
    }
    else{
    
 if(user_id==null){ Item.find({title:title}).sort({order_by:order_type}).exec(function(err,result){
     res.json(result); 
  });
}else{
   Item.find({user_id:user_id}).sort({order_by:order_type}).exec(function(err,result){
     res.json(result); 
  }); 
}
    }
    
    
    
   
});

module.exports = router;
