// Mongoose
const mongoose = require("mongoose");

// Moment
const moment = require("moment");

const TwoFactorAuth = require("../models/auth.js");
exports.create = async (user, otp) => {
	const authData = new TwoFactorAuth({
		_id: new mongoose.Types.ObjectId(),
		userId: user._id,
		email: user.email,
		authCode: otp.code,
		status: false,
		expiration: otp.expiration,
	});
	await authData.save();
};
exports.findByEmailAndCode = async (email, code) => {
	return await TwoFactorAuth.findOne({
		email: email,
		authCode: code,
	});
};
