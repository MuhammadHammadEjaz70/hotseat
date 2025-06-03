// JWT
const jwt = require("jsonwebtoken");
//General Helper
const GeneralHelper = require("../services/generalService.js");
// Mail
const { sendEmail } = require("../services/mailService.js");

// Servivces
const UserService = require("../services/userService.js");
const authService = require("../services/authService.js");
// Response Helpers
const {
	sendSuccessResponse,
	sendErrorResponse,
} = require("../services/responseService.js");

//SignUp
exports.signup = async (req, res, next) => {
	try {
		let request = req.body;
		if (
			!request.email ||
			!request.fullname ||
			!request.username ||
			!request.password ||
			!request.confirmPassword ||
			!request.role
		)
			return sendErrorResponse(res, "Missing Parameters!");
		const { username, fullname, email, password, confirmPassword, role } =
			req.body;
		let userModel = await UserService.findByEmail(email);
		if (userModel != null)
			return sendErrorResponse(res, "Email Already Exist!");
		if (!(await GeneralHelper.nameCheck(username)))
			return sendErrorResponse(res, "Invalid username!");
		if (!(await GeneralHelper.emailCheck(email)))
			return sendErrorResponse(res, "Invalid Email!");
		if (!(await GeneralHelper.passwordCheck(password)))
			return sendErrorResponse(res, "Invalid Password!");
		if (password !== confirmPassword)
			return sendErrorResponse(res, "Confirm password does not match!");
		let user = await UserService.create(
			fullname,
			username,
			email,
			password,
			role
		);
		// Generate OTP
		const otp = GeneralHelper.getOtp();
		const auth = await authService.create(user, otp);
		sendVerificationLink(email, fullname, otp);
		return sendSuccessResponse(res, "Verification sent to your email", {
			userId: user._id,
			data: auth,
		});
	} catch (error) {
		console.error("Error while signing up :", error);
		return sendErrorResponse(res, `Failed to signup: ${error.message}`);
	}
};
// Login
exports.login = async (req, res, next) => {
	let request = req.body;
	if (!request.email) return sendErrorResponse(res, "Missing Parameters!");
	let user = await UserService.findByEmail(request.email);
	if (user == null) return sendErrorResponse(res, "User Does not exist!");
	if (user.isVerified == false)
		return sendErrorResponse(res, "Please verify yourself first");
	let matched = await GeneralHelper.comparePassword(
		request.password,
		user.password
	);
	if (!matched) return sendErrorResponse(res, "Invalid Password!");
	let data = {
		email: user.email,
		userId: user._id,
		role: user.role,
	};
	const token = jwt.sign(data, process.env.JWT_SECRET);
	let result = {
		_id: user._id,
		role: user.role,
		email: user.email,
		token: token,
		user: user,
	};
	return sendSuccessResponse(res, "Login Successful", result);
};
exports.verify = async (req, res) => {
	try {
		let request = req.body;
		if (!request.code || !request.email)
			return sendErrorResponse(res, "Missing Parameter!");
		let verifyCode = request.code;
		let email = request.email;
		let user = await UserService.findByEmail(email);
		if (!user) {
			return sendErrorResponse(res, "User Not Exist!");
		} else {
			const authRecord = await authService.findByEmailAndCode(
				email,
				verifyCode
			);
			if (!authRecord) {
				return sendErrorResponse(res, "Invalid Verification Code");
			}
			if (authRecord.authCode != verifyCode) {
				return sendErrorResponse(res, "Invalid OTP");
			}
			if (new Date() > new Date(authRecord.expiration)) {
				return sendErrorResponse(res, "OTP has expired");
			}
			let user = await UserService.findByEmail(email);
			authRecord.authCode = null;
			authRecord.expiration = null;
			await authRecord.save();
			const updateVerification = await UserService.update(
				{ _id: user._id },
				{
					isVerified: true,
				}
			);
			console.log("hi");

			return sendSuccessResponse(res, "Verification successfull!");
		}
	} catch (error) {
		console.error("Error verifying OTP:", error);
		return sendErrorResponse(res, "Internal server error");
	}
};
exports.resendVerification = async (req, res, next) => {
	const { email } = req.body;
	try {
		let userExist = await UserService.findByEmail(email);
		if (userExist == null) {
			return sendErrorResponse(res, "User Not Exist!");
		}
		if (userExist.isVerified) {
			return sendErrorResponse(res, "Already Verified");
		}
		const otp = GeneralHelper.getOtp();
		const auth = await authService.create(userExist, otp);
		sendVerificationLink(email, userExist.fullname, otp);
		return sendSuccessResponse(res, "Verification sent to your email");
	} catch (error) {
		console.error("Error whili re sending otp up :", error);
		return sendErrorResponse(res, `Failed to sent otp: ${error.message}`);
	}
};
async function sendVerificationLink(email, fullname, otp) {
	const replacements = {
		expiration: otp.expiration,
		code: otp.code,
		name: fullname,
		mail: email,
	};

	template = __dirname + "/../mails/verification.html";
	sendEmail("Verification Link", template, email, replacements);
}
