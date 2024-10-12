const express = require('express');
const router = express.Router();
const User = require('./../models/users.js');
const { jwtAuthMiddleware ,generateToken} = require('../jwt.js');
const db =require('./../db');
//check admin
const checkAdminRole = async(userId)=>{
    try{
        const user = await User.findById(userId);
        return user.role === 'admin';

    }catch(err){
        return false;
    }
}
// check if admin is already present

var alreadyadmin = async()=>{
    const users =  await User.find();
    for(var ele = 0 ; ele <users.length; ele++){
        if(users[ele].role === 'admin') return 1;
    }
    return 0;
    console.log(users[0]);
};
// Sign Up

router.post('/signup', async(req,res)=>{

    try{

        
        const data = req.body

        if(data.role === 'admin'){ 
            if( await alreadyadmin ()){
                console.log('no two admins');
                return res.status(404).json({message:'there cannot be two admin'})
            }
            alreadyadmin=1;
        }

        

        const newUser = new User(data);

        const response = await newUser.save();

        console.log('data saved');
 
        const payload= {
            id: response.id
            
        }

        console.log(JSON.stringify(payload));
        const token = generateToken(payload);

        console.log("Token is :",token);
        res.status(200).json({response: response, token: token});
    }catch(err){
        console.log(err);
        res.status(500).json({error:'internal server error'});
    }

})

//Login route 
router.post('/login',async(req,res)=>{
    try{
        const {adharCardNumber,password}= req.body;

        const user = await User.findOne({adharCardNumber:adharCardNumber});

        if(!user || !(await user.comparePassword(password))){
            return res.status(401).json({error:'Invalid Username or Password'});
        }

        const payload={
            id:user.id
        }
        const token = generateToken(payload);

        res.json({token})

    }catch(err){
        console.log(err);
        res.status(500).json({error:'internal server error'});
    }
})

// Profile 

router.get('/profile',jwtAuthMiddleware, async(req,res)=>{
    try{
        const userData=req.user;
        const userId=userData.id;

        const user = await User.findById(userId);

        res.status(200).json({user});

    }catch(err){
        console.log(err);
        res.status(500).json({error:'Internal server error'});
    }
})

//change Password 

router.put('/profile/password',jwtAuthMiddleware,async(req,res)=>{
    try{
        const userId= req.user
        const {currentPassword,newPassword}= req.body

        const user = await User.findById(userId);

        if( !(await user.comparePassword(password))){
            return res.status(401).json({error:'Invalid Username or Password'});
        }

        user.password=newPassword;
        await user.save();
        console.log('Password changed');
        res.status(200).json({message:'password is changed'});
    }catch(err){
        console.log(err);
        res.status(500).json({error:'internal server error'});
    }
})
//delete

router.delete('/:userID',jwtAuthMiddleware,async(req,res)=>{
    try{
 
        if(!checkAdminRole(req.user.id)){
            return res.status(403).json({message : 'user is not admin'});
        }

        const userID = req.params.userID; 
        
          
        const response = await User.findByIdAndDelete(userID);
        if(!response){
            return res.status(404).json({error: ' user not found'});
        }
      
        console.log('user deleted ');
        res.status(200).json({message:'deleted'});
    }catch(err){
        console.log(err);
        res.status(500).json({error:'internal server error'});
    }
})
module.exports = router;