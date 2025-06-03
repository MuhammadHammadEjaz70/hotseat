var express = require("express");
var router = express.Router();

const jwt = require("../middlewares/jwt.js");

const authController = require("../controllers/authController.js");
const passwordController = require("../controllers/passwordController.js");

router.post("/login", authController.login);
router.post("/sign-up", authController.signup);
router.post("/verify-account", authController.verify);
router.post("/resend-code", authController.resendVerification);
router.post("/forgot-password", passwordController.forgotpassword);
router.post("/verify-forgot-password", passwordController.verifyPasswordCode);
router.post("/reset-password", jwt, passwordController.resetpassword);
router.post("/change-password", jwt, passwordController.change);

module.exports = router;
