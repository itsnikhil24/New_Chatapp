const express=require("express");
const app=express();
const PORT=3000;
const userroutes=require("./routes/userroutes")
const bcrypt=require("bcrypt");
var cookieParser = require('cookie-parser')


app.set("view engine","ejs");
app.use(cookieParser());
app.use(userroutes);


app.listen(PORT,()=>{
    console.log(`Server running on Port ${PORT}`);
})