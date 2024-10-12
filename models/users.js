const mongoose =require('mongoose');
const bcrypt=require('bcrypt');
const userSchema=new mongoose.Schema({

    name:{
        type:String,
        require:true,

    },
    age:{
        type:Number,
        require:true,

    },

    email:{
        type:String,
    
    },
    mobile:{
        type:String,
    
    },
    adress:{
        type:String,
        require:true,
    },
    adharCardNumber:{
        type:Number,
        require:true,
        unique:true,
    },
    password:{
        type:String,
        require:true,
    },
    role:{
        type:String,
        enum:['voter','admin'],
        default:'voter',
    },
    isVoted:{
        type:Boolean,
        default:false,
    }

});
 
userSchema.pre('save',async function(next){
    const person =this;

    if(!person.isModified('password')) return next();

    try{

        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(person.password,salt);
        person.password = hashedPassword;
        next();
    }catch(err){
        return next(err);
    }
})

userSchema.methods.comparePassword = async function(candidatePasswod){
    try{
        const ismatch = await bcrypt.compare(candidatePasswod,this.password);
        return ismatch;

    }catch(err){
        throw err;
    }
}
const User=mongoose.model('User',userSchema);
module.exports=User;