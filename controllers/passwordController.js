const bcrypt = require("bcryptjs");
// JWT
const jwt = require("jsonwebtoken");
//Helper
const GeneralHelper = require("../services/generalService.js");
const UserService = require("../services/userService.js");
// Mail
const { sendEmail } = require("../services/mailService.js");
// Models
const User = require("../models/user.js");
// Response Helpers
const {
	sendSuccessResponse,
	sendErrorResponse,
} = require("../services/responseService.js");

// Forgot Password
exports.forgotpassword = async (req, res) => {
	try {
		const { email } = req.body;
		const user = await User.findOne({ email });
		if (!user) return sendErrorResponse(res, "User Not Found!");

		// Generate password reset token
		const resetToken = GeneralHelper.getOtp();

		sendForgotLink(user, resetToken.code);

		// Update user's password reset token and expiration time
		user.resetToken = resetToken.code;
		user.resetTokenExpiration = resetToken.expiration;
		await user.save();
		console.log(user);

		return sendSuccessResponse(
			res,
			"Password reset instructions sent to your email!"
		);
	} catch (error) {
		return sendErrorResponse(res, "Internal server error");
	}
};
exports.verifyPasswordCode = async (req, res) => {
	let request = req.body;
	if (!request.code || !request.email)
		return sendErrorResponse(res, "Missing Parameter!");
	let verifyCode = request.code;
	let email = request.email;
	if (!(await UserService.findByEmail(email))) {
		return sendErrorResponse(res, "Email Not Exist!");
	} else {
		let userDetail = await UserService.findByEmail(email);
		let forgotCode = userDetail.resetToken;
		if (forgotCode != verifyCode)
			return sendErrorResponse(res, "Code Not Matched!");
		let data = {
			email: userDetail.email,
			userId: userDetail._id,
			role: userDetail.role,
		};
		const token = jwt.sign(data, process.env.JWT_SECRET);
		return sendSuccessResponse(res, "Verified Code!", {
			email: email,
			token: token,
		});
	}
};
// Reset Password
exports.resetpassword = async (req, res) => {
	try {
		let request = req.body;
		if (!request.newPassword || !request.confirmPassword) {
			return sendErrorResponse(res, "Missing Parameter!");
		}
		const { newPassword, confirmPassword } = req.body;
		let mail = req.user.email.trim().toLowerCase();
		const user = await User.findOne({ email: req.user.email });
		if (!user) return sendErrorResponse(res, "User not found!");
		if (!(await GeneralHelper.passwordCheck(newPassword)))
			return sendErrorResponse(res, "Invalid Password!");
		// Check if password and confirm password match
		if (newPassword !== confirmPassword)
			return sendErrorResponse(res, "Confirm Password does not match");

		// Hash the new password
		const hashedPassword = await bcrypt.hash(newPassword, 10);

		// Update user's password
		user.password = hashedPassword;
		// Clear reset token and code
		user.resetToken = null;
		user.resetCode = null;
		// Save the updated user
		await user.save();
		return sendSuccessResponse(res, "Password reset successfully");
	} catch (error) {
		console.log(error);

		return sendErrorResponse(res, "Internal server error");
	}
};
// Change Password
exports.change = async (req, res) => {
	try {
		let request = req.body;
		if (
			!request.oldPassword ||
			!request.newPassword ||
			!request.confirmNewPassword
		)
			return sendErrorResponse(res, "Missing Parameter!");
		const { oldPassword, newPassword, confirmNewPassword } = req.body;
		// Check if all required fields are provided
		if (!oldPassword || !newPassword || !confirmNewPassword)
			return sendErrorResponse(res, "Missing required fields!");
		// Check if new password matches confirm new password
		if (newPassword !== confirmNewPassword)
			return sendErrorResponse(res, "Confirm password does not match!");
		const user = await User.findById(req.user.userId);
		// Check if user exists
		if (!user) return sendErrorResponse(res, "User not found!");
		// Check if old password matches the current password
		const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
		if (!isPasswordValid)
			return sendErrorResponse(res, "Invalid old password!");
		if (!(await GeneralHelper.passwordCheck(newPassword)))
			return sendErrorResponse(res, "Invalid New Password!");
		// Hash the new password
		const hashedNewPassword = await bcrypt.hash(newPassword, 10);

		// Update user's password with the new hashed password
		user.password = hashedNewPassword;
		await user.save();

		// Password changed successfully
		return sendSuccessResponse(res, "Password changed successfully");
	} catch (error) {
		console.log(error.message);

		return sendErrorResponse(res, "Internal server error");
	}
};
async function sendForgotLink(user, resetToken) {
	const replacements = {
		reset_code: resetToken,
		name: user.fullname,
	};
	template = __dirname + "/../mails/forgot.html";
	sendEmail("Reset Your Password", template, user.email, replacements);
}
