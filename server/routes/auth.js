const router=require("express").Router(), jwt=require("jsonwebtoken"), bcrypt=require("bcryptjs");
const User=require("../models/User");
const secret="book-rent-app";
router.post("/login",async(req,res)=>{try{const {email,password}=req.body;const u=await User.findOne({email:email?.toLowerCase()});if(!u||!(await bcrypt.compare(password,u.password)))return res.status(401).json({message:"Invalid email or password"});res.json({token:jwt.sign({id:u._id,role:u.role},secret,{expiresIn:"7d"}),user:{id:u._id,name:u.name,email:u.email,role:u.role}})}catch(e){res.status(500).json({message:e.message})}});
router.post("/seed-admin",async(req,res)=>{try{const email=req.body.email||"admin@bookrental.com";if(await User.findOne({email}))return res.json({message:"Admin exists"});const password=await bcrypt.hash(req.body.password||"Admin@123",10);const u=await User.create({name:"Administrator",email,password,role:"admin"});res.json({message:"Admin created",email,passwordHint:"Use the password supplied to this endpoint"})}catch(e){res.status(500).json({message:e.message})}});
module.exports=router;
