const mongoose=require("mongoose")
const bcrypt=require("bcrypt")

const userSchema=new mongoose.Schema({
    email:{
        type:String,
        require:[true,"email is required"],
        trim:true,
        lowercase:true,
        match: [ /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid Email address" ],
        unique:[true,"email already exist"]
    },
    name:{
        type:String,
        require:[true,"name is required"]
    },
    password:{
        type:String,
        require:true,
        trim:true,
        minlength:[6,"password should be more than 6 character"],
        select:false

    },
    
},
{
    timestamps:true
})

userSchema.pre("save",async function(){
    if(!this.isModified("password")){
        return 
    }

    const hash=await bcrypt.hash(this.password, 10)
    this.password=hash

    return 
})

userSchema.methods.comparePasswod=async function(password){
    return await bcrypt.compare(password,this.password)
}

const userModel = mongoose.model("user", userSchema)

module.exports=userModel
