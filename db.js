const mongoose =require('mongoose');

const mongooseUri='mongodb://localhost:27017/votingdata'

mongoose.connect(mongooseUri,{
    useNewUrlParser: true,
    useUnifiedTopology:true
})

const db=mongoose.connection;

// db.on('connection',()=>{

// });
db.on('connected',()=>{
    console.log('connection established ',db.host)

});

db.on("error",()=>{
    console.error('there is some error with the connection',error)
});
 
db.on("disconnected",()=>{
    console.log('the connection is disconnected')
});


module.exports = db;