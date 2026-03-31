const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: 300 } // TTL 5 minutes
    }
});

/*
|--------------------------------------------------------------------------
| Pre Save Hook to hash OTP
|--------------------------------------------------------------------------
*/
otpSchema.pre("save", async function () {
    if (this.isModified("otp")) {
        this.otp = await bcrypt.hash(this.otp, 10);
    }
});

/*
|--------------------------------------------------------------------------
| Compare OTP Method
|--------------------------------------------------------------------------
*/
otpSchema.methods.compareOtp = async function (submittedOtp) {
    return await bcrypt.compare(submittedOtp, this.otp);
};

const otpModel = mongoose.model("otp", otpSchema);

module.exports = otpModel;
