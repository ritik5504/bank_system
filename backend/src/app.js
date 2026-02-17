const express=require("express");
const cookieParser = require("cookie-parser")

// const router = require("./routes/auth.route")
// const router=require("./routes/auth.route")

const app=express();

app.use(express.json())
app.use(cookieParser())

const authRouter = require("./routes/auth.route")
const accountRouter = require("./routes/account.route")

app.use("/api/auth",authRouter)
app.use("/api/accounts", accountRouter)

module.exports=app;