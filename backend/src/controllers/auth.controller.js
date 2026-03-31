const userModel = require("../models/user.model")
const otpModel = require("../models/otp.model")
const jwt = require("jsonwebtoken")
const emailService = require("../services/email.service")
const tokenBlackListModel = require("../models/blackList.model")

// Generate 6 digit numeric OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * - User Register Controller (Step 1: Init & Send OTP)
 * - POST /api/auth/register
 */
async function userRegisterController(req, res) {
    try {
        const { email, password, name } = req.body

        const isExists = await userModel.findOne({ email })

        if (isExists) {
            return res.status(422).json({
                message: "User already exists with email.",
                status: "failed"
            })
        }

        // Generate OTP
        const otp = generateOTP();

        // Clear existing OTPs for email
        await otpModel.deleteMany({ email });

        // Save new OTP
        await otpModel.create({ email, otp });

        // Send OTP via email
        await emailService.sendOtpEmail(email, name, otp);

        res.status(200).json({
            message: "OTP sent to email. Please verify to complete registration.",
            status: "pending_verification"
        })

    } catch (error) {
        res.status(500).json({
            message: "Registration failed",
            error: error.message
        })
    }
}

/**
 * - Verify Register OTP (Step 2: Verify & Create User)
 * - POST /api/auth/verify-register
 */
async function verifyRegisterOtpController(req, res) {
    try {
        const { email, password, name, otp } = req.body

        // Verify OTP
        const otpRecord = await otpModel.findOne({ email }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({ message: "OTP not found or expired" });
        }

        const isValidOtp = await otpRecord.compareOtp(otp);
        if (!isValidOtp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // Delete OTP
        await otpModel.deleteMany({ email });

        // Double check user doesn't exist
        const isExists = await userModel.findOne({ email })
        if (isExists) {
             return res.status(422).json({ message: "User already exists" })
        }

        // Create User
        const user = await userModel.create({
            email,
            password,
            name
        })

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "3d" }
        )

        const isProduction = process.env.NODE_ENV === "production";
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 3 * 24 * 60 * 60 * 1000 // 3 days
        });

        res.status(201).json({
            message: "Registration successful",
            user: {
                _id: user._id,
                customerId: user.customerId,
                email: user.email,
                name: user.name
            },
            token
        })

        await emailService.sendRegistrationEmail(user.email, user.name)

    } catch (error) {
        res.status(500).json({
            message: "OTP Verification failed",
            error: error.message
        })
    }
}

/**
 * - User Login Controller (Direct Login, No OTP)
 * - POST /api/auth/login
 */
async function userLoginController(req, res) {
    try {
        const { customerId, email, password } = req.body

        if ((!customerId && !email) || !password) {
            return res.status(400).json({
                message: "Customer ID or email, and password are required"
            })
        }

        const query = customerId
            ? { customerId }
            : { email: email.toLowerCase().trim() }

        const user = await userModel.findOne(query).select("+password")

        if (!user) {
            return res.status(401).json({ message: "Customer ID/email or password is INVALID" })
        }

        const isValidPassword = await user.comparePassword(password)
        if (!isValidPassword) {
            return res.status(401).json({ message: "Customer ID/email or password is INVALID" })
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "3d" }
        )

        const isProduction = process.env.NODE_ENV === "production";
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 3 * 24 * 60 * 60 * 1000 // 3 days
        });

        res.status(200).json({
            message: "Login successful",
            user: {
                _id: user._id,
                customerId: user.customerId,
                email: user.email,
                name: user.name
            },
            token
        })

    } catch (error) {
        res.status(500).json({
            message: "Login failed",
            error: error.message
        })
    }
}


/**
 * - User Logout Controller
 * - POST /api/auth/logout
 */
async function userLogoutController(req, res) {
    try {
        const token =
            req.cookies.token ||
            req.headers.authorization?.split(" ")[1]

        if (!token) {
            return res.status(200).json({
                message: "User logged out successfully"
            })
        }

        await tokenBlackListModel.create({ token })

        const isProduction = process.env.NODE_ENV === "production";
        res.clearCookie("token", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax"
        });

        res.status(200).json({
            message: "User logged out successfully"
        })

    } catch (error) {
        res.status(500).json({
            message: "Logout failed",
            error: error.message
        })
    }
}

module.exports = {
    userRegisterController,
    verifyRegisterOtpController,
    userLoginController,
    userLogoutController
}