require ("dotenv").config()
const app=require("./backend/src/app")
const connectToDB=require("./backend/src/config/db")

connectToDB()

app.listen(3000,()=>{
    console.log("server is running on port 3000")
})