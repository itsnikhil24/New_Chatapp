exports.hello=function(req,res){
    res.cookie("password","123");
    res.render("register.ejs");
    // res.cookie("password1","1234");
    
}

exports.checkcookie=(req,res)=>{
    console.log(req.cookies);
    res.json(req.cookies);
}

