// Mongoose
const mongoose = require("mongoose");

// Moment
const moment = require("moment");

// Models
const User = require("../models/user");

// Helpers
const GeneralHelper = require("../services/generalService");

exports.list = async (pageNo = 1, searchValue = null, role) => {
	let pg = GeneralHelper.getPaginationDetails(pageNo);
	let condition = [{ deletedAt: null }];
	if (searchValue) {
		const regex = GeneralHelper.makeRegex(searchValue);
		condition.push({
			$or: [{ name: regex }, { email: regex }],
		});
	}
	if (role) {
		condition.push({
			role: role,
		});
	}
	condition = { $and: condition };
	console.log(condition);

	let result = await User.find(condition)
		.sort({ _id: -1 })
		.skip(pg.skip)
		.limit(pg.pageSize)
		.exec();
	console.log(result);

	let total = await User.find(condition).countDocuments();

	return {
		pagination: GeneralHelper.makePaginationObject(
			pg.pageNo,
			pg.pageSize,
			pg.skip,
			total,
			result.length
		),
		data: result,
	};
};
exports.findByEmail = async (email) => {
	return await User.findOne({
		email: email.trim().toLowerCase(),
		deletedAt: null,
	});
};
exports.findByusername = async (name) => {
	return await User.findOne({
		username: name,
		deletedAt: null,
	});
};
exports.findById = async (_id) => {
	return await User.findOne({ _id: _id, deletedAt: null });
};
exports.findAll = async () => {
	return await User.find({ deletedAt: null });
};
exports.update = async (findObj, setObj) => {
	return await User.updateOne(findObj, { $set: setObj });
};
exports.create = async (fullname, username, email, password, role) => {
	const hashPassword = await GeneralHelper.bcryptPassword(password);
	const user = new User({
		_id: new mongoose.Types.ObjectId(),
		email: email.trim().toLowerCase(),
		password: hashPassword,
		username: username,
		fullname: fullname,
		role: role,
	});
	return await user.save();
};
exports.delete = async (id) => {
	return await User.updateOne(
		{ _id: id },
		{
			$set: {
				deletedAt: moment(),
			},
		}
	).exec();
};
