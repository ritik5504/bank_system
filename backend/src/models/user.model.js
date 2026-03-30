const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

/*
|--------------------------------------------------------------------------
| Customer ID Generator
|--------------------------------------------------------------------------
| Example Output: CIF482739182
|--------------------------------------------------------------------------
*/
const generateCustomerId = () => {
    const random = Math.floor(100000 + Math.random() * 900000)
    return `CIF${Date.now().toString().slice(-4)}${random}`
}

const userSchema = new mongoose.Schema({

    customerId: {
        type: String,
        unique: true,
        index: true
    },

    email: {
        type: String,
        required: [true, "Email is required for creating a user"],
        trim: true,
        lowercase: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid Email address"],
        unique: [true, "Email already exists."]
    },

    name: {
        type: String,
        required: [true, "Name is required for creating an account"]
    },

    password: {
        type: String,
        required: [true, "Password is required for creating an account"],
        minlength: [6, "Password should contain more than 6 characters"],
        select: false
    },

    systemUser: {
        type: Boolean,
        default: false,
        immutable: true,
        select: false
    }

}, {
    timestamps: true
})

/*
|--------------------------------------------------------------------------
| Pre Save Hook
|--------------------------------------------------------------------------
| 1. Generate Customer ID (only for new users)
| 2. Hash password (only if modified)
|--------------------------------------------------------------------------
*/
userSchema.pre("save", async function () {

    // Generate customerId only when new user
    if (this.isNew && !this.customerId) {
        this.customerId = generateCustomerId()
    }

    // Skip hashing if password not modified
    if (!this.isModified("password")) {
        return
    }

    // Hash password
    this.password = await bcrypt.hash(this.password, 10)
})

/*
|--------------------------------------------------------------------------
| Compare Password Method
|--------------------------------------------------------------------------
*/
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}

const userModel = mongoose.model("user", userSchema)

module.exports = userModel