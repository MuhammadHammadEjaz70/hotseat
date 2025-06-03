//General Helper
const GeneralHelper = require("../services/generalService.js");

// Servivces
const UserService = require("../services/userService.js");
// Response Helpers
const {
	sendSuccessResponse,
	sendErrorResponse,
} = require("../services/responseService.js");
exports.createProfile = async (req, res, next) => {
	try {
		// dob,phone,gender,bio,location,interests,picture//user
		//fandom type,location
		let imagePath = null;
		if (req.file) {
			if (req.file.mimetype != "image/jpeg") {
				jpgImage = false;
			} else {
				jpgImage = true;
			}
			if (req.file.mimetype != "image/png") {
				pngImage = false;
			} else {
				pngImage = true;
			}
			imagePath = req.file.path;
			if (jpgImage == false && pngImage == false) {
				fs.unlinkSync(imagePath);
				return sendErrorResponse(res, "Image Type Error!");
			}
		}
		let userModel = await UserService.findById(req.user.userId);
		if (userModel != null)
			return sendErrorResponse(res, "Email Already Exist!");
		req.body.profilePicture = imagePath;
		let update = await UserService.update({ _id: req.user.userId }, req.body);
		return sendSuccessResponse(res, "Profile created!", {
			update,
		});
	} catch (error) {
		console.error("Error while creating profile :", error);
		return sendErrorResponse(res, `Failed to create profile: ${error.message}`);
	}
};
