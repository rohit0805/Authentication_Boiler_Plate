const LocalStrategy=require("passport-local").Strategy;
const bcrypt=require('bcrypt');

function initialize(passport,getUserByEmail,getUserByID){
    const authenticateUser=async (email,password,done)=>{
        const user=getUserByEmail(email);
        if(user==null){
             return done(null,false,{message:"No user exist with that email"});
        }
        try{
            if(await bcrypt.compare(password,user.password)){
                console.log("kjsdaflkj");
                return done(null,user);
            }
            else
                return done(null,false,{message:"Password incorrect"})
        }
        catch(e){
            return done(e);
        }
    }; 
    passport.use(new LocalStrategy({
        usernameField:"email",
        passwordField:"password"
    },authenticateUser));
    passport.serializeUser((user,done)=>{
        return done(null,user.id); 
    });
    passport.deserializeUser((id,done)=>{
        return done(null,getUserByID(id));
    });
}


module.exports=initialize;