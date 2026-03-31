const express = require("express")
const authController = require("../controllers/auth.controller")

const router = express.Router()

/* POST /api/auth/register (Step 1: Init OTP) */
router.post("/register", authController.userRegisterController)

/* POST /api/auth/verify-register (Step 2: Verify OTP & Create User) */
router.post("/verify-register", authController.verifyRegisterOtpController)

/* POST /api/auth/login (Direct Login) */
router.post("/login",authController.userLoginController)

/* POST /api/auth/logout */
router.post("/logout", authController.userLogoutController)

module.exports = router