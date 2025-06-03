// Bacrypt passwords
const bcrypt = require("bcryptjs");

async function bcryptPassword(password) {
	return await bcrypt.hash(password, 10);
}
async function comparePassword(enteredPassword, userPassword) {
	return await bcrypt.compare(enteredPassword, userPassword);
}

//formats
const mailFormat = /^[a-zA-Z0-9_\\..-\\+]+@[a-zA-Z0-9-]+(\.[a-z]{2,})+$/;
const passwordFormat = /^(?=.*?[A-Z])(?=.*?[#?!@$%^&*-]).{8,}$/;
const nameFormat = /^[a-zA-Z0-9]+$/;
function escapeLike(string) {
	return string
		.replace("#", "\\#")
		.replace("$", "\\$")
		.replace("%", "\\%")
		.replace("+", "\\+")
		.replace("_", "\\_");
}

//checks
async function emailCheck(emailAddress) {
	if (!emailAddress.match(mailFormat)) {
		return false;
	} else {
		return true;
	}
}
async function passwordCheck(passwordCheck) {
	if (!passwordCheck.match(passwordFormat)) {
		return false;
	} else {
		return true;
	}
}
async function nameCheck(nameCheck) {
	if (!nameCheck.match(nameFormat)) {
		return false;
	} else {
		return true;
	}
}

//values check
function makeRegex(searchValue) {
	searchValue = escapeLike(searchValue);
	return new RegExp(searchValue, "i");
}
function isValueSet(value) {
	return !(value == "" || value == null || value == undefined);
}

//pagination
function getPageSize() {
	return 10;
}
function getSkipCount(pageNo, pageSize) {
	return (pageNo - 1) * pageSize;
}
function checkPageLowerLimit(pageNo) {
	return pageNo < 1 ? 1 : pageNo;
}
function getPaginationDetails(pageNo) {
	return {
		pageNo: checkPageLowerLimit(pageNo),
		pageSize: getPageSize(),
		skip: getSkipCount(pageNo, getPageSize()),
	};
}
function makePaginationObject(
	pageNo,
	pageSize,
	skip,
	total,
	currentPageRecords
) {
	return {
		currentPage: pageNo,
		pageSize: pageSize,
		from: skip == 0 ? 1 : skip + 1,
		to: currentPageRecords + (pageNo == 1 ? 0 : (pageNo - 1) * pageSize),
		total: total,
	};
}

//app url functions
function getFrontAppUrl() {
	return process.env.MODE == "DEV"
		? process.env.FRONT_APP_URL_DEV
		: process.env.FRONT_APP_URL_PRO;
}
function getFrontAppResetUrl() {
	return process.env.MODE == "DEV"
		? process.env.FRONT_APP_RESET_PASSWORD_URL_DEV
		: process.env.FRONT_APP_RESET_PASSWORD_URL_PRO;
}
function getFrontAppSetUrl() {
	return process.env.MODE == "DEV"
		? process.env.FRONT_APP_SET_PASSWORD_URL_DEV
		: process.env.FRONT_APP_SET_PASSWORD_URL_PRO;
}
function getBackAppUrl() {
	return process.env.MODE == "DEV"
		? process.env.BACK_APP_URL_DEV
		: process.env.BACK_APP_URL_PRO;
}

//paths
function makeImagePath(dir, name) {
	return dir + "/" + name;
}
function makeFilePath(dir, name) {
	return dir + "/" + name;
}

//randoms
function passwordGenerator() {
	return (
		"Te" + Math.floor(Math.random() * (999999 - 111111) + 111111) + "nant#"
	);
}
async function randomPasswordMaker(password) {
	return await bcryptPassword(password);
}

function getOtp() {
	const code = Math.floor(1000 + Math.random() * 9000); // Generate 4-digit OTP
	//   const expiration = 5; // OTP expiration time in minutes
	const expirationTime = new Date(Date.now() + 3600000); // Current time + expiration time
	return { code: code, expiration: expirationTime };
}

module.exports = {
	bcryptPassword,
	getPageSize,
	getSkipCount,
	checkPageLowerLimit,
	makePaginationObject,
	getPaginationDetails,
	getFrontAppUrl,
	getFrontAppSetUrl,
	getFrontAppResetUrl,
	getBackAppUrl,
	escapeLike,
	makeImagePath,
	isValueSet,
	passwordGenerator,
	randomPasswordMaker,
	comparePassword,
	makeFilePath,
	makeRegex,
	getOtp,
	emailCheck,
	passwordCheck,
	nameCheck,
};
