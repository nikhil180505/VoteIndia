const express = require('express');
const router = express.Router();
const User = require('./../models/users.js');
const { jwtAuthMiddleware ,generateToken} = require('../jwt.js');
const Candidate = require('./../models/candidates.js');


//check if admin 

const checkAdminRole = async(userId)=>{
    try{
        const user = await User.findById(userId);
        return user.role === 'admin';

    }catch(err){
        return false;
    }
}
// new candidate

router.post('/', jwtAuthMiddleware,async(req,res)=>{

    try{
        if(! await checkAdminRole(req.user.id)){
            return res.status(404).json({message : 'user is not admin'});
        }
        const data = req.body

        const newCandidate = new Candidate(data);

        const response = await newCandidate.save();

        console.log('data saved');
       
        res.status(200).json({response: response});
    }catch(err){
        console.log(err);
        res.status(500).json({error:'internal server error'});
    }

})


//change Password 

router.put('/:candidateID',jwtAuthMiddleware,async(req,res)=>{
    try{

        if(!checkAdminRole(req.user.id)){
            return res.status(403).json({message : 'user is not admin'});
        }

        const candidateID = req.params.candidateID;
        const updatedCandidateData = req.body;
        
        const response = await Candidate.findByIdAndUpdate(candidateID,updatedCandidateData,{
            new : true,
            runValidators: true,
        })
        if(!response){
            return res.status(404).json({error: ' candidate not found'});
        }
      
        console.log('candidate data updated ');
        res.status(200).json({message:'updated'});
    }catch(err){
        console.log(err);
        res.status(500).json({error:'internal server error'});
    }
})

router.delete('/:candidateID',jwtAuthMiddleware,async(req,res)=>{
    try{

        if(!checkAdminRole(req.user.id)){
            return res.status(403).json({message : 'user is not admin'});
        }

        const candidateID = req.params.candidateID;
        
        
        const response = await Candidate.findByIdAndDelete(candidateID);
        if(!response){
            return res.status(404).json({error: ' candidate not found'});
        }
      
        console.log('candidate deleted ');
        res.status(200).json({message:'deleted'});
    }catch(err){
        console.log(err);
        res.status(500).json({error:'internal server error'});
    }
})

// voting routes

router.post('/vote/:candidateID',jwtAuthMiddleware,async(req,res)=>{
    candidateID=req.params.candidateID;
    userId = req.user.id;

    try{
        const candidate =  await Candidate.findById(candidateID);
            if(!candidate){
                res.status(404).json({message: 'candidate not found'});
                return ;
            }
            const user=await User.findById(userId);

            if(!user){ 
                res.status(404).json({message: 'user not found'});
                return ;
            }

            if(user.isVoted){
                res.status(404).json({message: 'user has already voted'});
                return; 
            }
            if(user.role == 'admin'){
                res.status(404).json({message: 'admin can not vote '});
                return ;
            }


            candidate.votes.push({user:userId});
            candidate.voteCount++;
            await candidate.save();

            user.isVoted=true;
            await user.save();

            res.status(200).json({message:" you have successfully voted "});
    }catch(err){
        console.log(err);
        res.status(500).json({error:'internal server error'});
    }
})

router.get('/vote/count',async(req,res)=>{
    try{

        const candidate = Candidate.find().sort({voteCount: 'desc'});

        const record = (await candidate).map((data)=>{
            return {
                party:data.party,
                count: data.voteCount
            }
        })

        return res.status(200).json(record);


    }catch(err){
        console.log(err);
        res.status(500).json({error:'internal server error'});
    }
})


router.get('/list',async(req,res)=>{
    try{
        const candidate = Candidate.find();
    const candidatelist= (await candidate).map((data)=>{
        return {
            name:data.name,
            party:data.party
        }
    })

    return res.status(200).json(candidatelist);
    }catch(err){
        console.log(err);
        res.status(500).json({error:'internal server error'});
    }
})
  
module.exports = router;