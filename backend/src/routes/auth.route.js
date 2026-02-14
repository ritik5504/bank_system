const express=require("express")
const authController=require("../controllers/auth.controllers")
const { model } = require("mongoose")

const router=express.Router()

router.post("/register",authController.userRegisterController)

router.post("/login",authController.userLoginController)



module.exports= router


