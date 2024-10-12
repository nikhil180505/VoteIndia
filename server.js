const express =require("express");
const app=express();
const db =require('./db');
const bodyParser=require('body-parser');
require ('dotenv').config();
const bodyparser=require('body-parser');
const {jwtAuthMiddleware} = require("./jwt");

app.use(bodyparser.json());

const PORT=process.env.PORT || 3000;


//import routesfiles
const userRoutes= require("./routes/userRoutes");
const candidateRoutes= require("./routes/candidateRoutes");


//use the routes
app.use('/user',userRoutes);
app.use('/candidate',candidateRoutes);

app.listen(PORT ,()=>{
    console.log('Server is Active On Port ',PORT);
    
})


