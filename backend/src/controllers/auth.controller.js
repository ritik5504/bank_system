const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const emailService = require("../services/email.service")
const tokenBlackListModel = require("../models/blackList.model")

/**
 * - User Register Controller
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

        res.cookie("token", token)

        res.status(201).json({
            message: "Registration successful",
            user: {
                _id: user._id,
                customerId: user.customerId,   // 🔥 Important
                email: user.email,
                name: user.name
            },
            token
        })

        await emailService.sendRegistrationEmail(user.email, user.name)

    } catch (error) {
        res.status(500).json({
            message: "Registration failed",
            error: error.message
        })
    }
}


/**
 * - User Login Controller
 * - POST /api/auth/login
 */
async function userLoginController(req, res) {
    try {
        const { customerId, email, password } = req.body

        // require either customerId or email along with password
        if ((!customerId && !email) || !password) {
            return res.status(400).json({
                message: "Customer ID or email, and password are required"
            })
        }

        // build query based on provided identifier
        const query = customerId
            ? { customerId }
            : { email: email.toLowerCase().trim() }

        console.log('Login attempt query:', query);
        const user = await userModel
            .findOne(query)
            .select("+password")
        console.log('Login found user:', user ? user._id : null);

        if (!user) {
            return res.status(401).json({
                message: "Customer ID/email or password is INVALID"
            })
        }

        const isValidPassword = await user.comparePassword(password)

        if (!isValidPassword) {
            return res.status(401).json({
                message: "Customer ID or password is INVALID"
            })
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "3d" }
        )

        res.cookie("token", token)

        res.status(200).json({
            message: "Login successful",
            user: {
                _id: user._id,
                customerId: user.customerId,   // 🔥 Important
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

        res.clearCookie("token")

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
    userLoginController,
    userLogoutController
}