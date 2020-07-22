if(process.env.NODE_ENV!=="production"){
    require("dotenv").config();
}
const express=require("express");
const app=express();
app.set("view engine","ejs");
const bodyParser=require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));
const bcrypt=require("bcrypt");
const volleyball=require("volleyball");
app.use(volleyball);
const methodOverride=require('method-override');
app.use(methodOverride("_method"));

const users=[];

//passport configuration
const passport=require("passport");
const initializePassport=require('./passport.config');
initializePassport(passport,(email)=>{
    return users.find(user=>{
        return user.email===email;
    });
},(id)=>{
   return users.find(user=>{
       return user.id===id;
   }) 
});

//session and flash
const flash=require("express-flash");
app.use(flash());
const session=require("express-session");
app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());


//index
app.get("/",checkAuthenticated,function(req,res){
    res.render("index",{name:req.user.name});
});

//register 
app.get("/register",checkNotAuthenticated,function(req,res){
    res.render("register");
});

app.post("/register",checkNotAuthenticated,async function(req,res){
    try{
        const hashpass=await bcrypt.hash(req.body.password,10);
        users.push({
            id:Date.now().toString(),
            name:req.body.name,
            email:req.body.email,
            password:hashpass
        });
        res.redirect('/login');
    }
    catch{
        res.redirect("/register");
    }
    console.log(users);
});

//login
app.get("/login",checkNotAuthenticated,function(req,res){
    res.render("login");
});
app.post("/login",checkNotAuthenticated,passport.authenticate('local',{
    successRedirect:"/",
    failureRedirect:"/login",
    failureFlash:true
}));

//logout
app.delete("/logout",function(req,res){
    req.logOut(); 
    res.redirect("/login");
});

function checkAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    else{
        res.redirect("/login");
    }
};

function checkNotAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return res.redirect("/");
    }
    else{
        return next();
    }
};

app.listen(3000);