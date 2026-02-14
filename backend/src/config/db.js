const mongoose=require("mongoose")

function connectToDB(){
    mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("server is connected to DB");
    })
    .catch(()=>{
        console.log("error to db")
        process.exit(1);
    })
}

module.exports=connectToDB