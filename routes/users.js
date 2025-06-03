var express = require("express");
var router = express.Router();
const multer = require("multer");
const path = require("path");

const UserController = require("../controllers/userController");
/* GET users listing. */
//Middlewares
const jwt = require("../middlewares/jwt");

//Upload photo
var storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "uploads/Profiles/");
	},
	filename: (req, file, cb) => {
		cb(
			null,
			file.fieldname + "-" + Date.now() + path.extname(file.originalname)
		);
	},
});
const upload = multer({ storage: storage });

router.post(
	"/update-profile",
	upload.single("file"),
	jwt,
	UserController.createProfile
);

router.get("/", function (req, res, next) {
	res.send("respond with a resource");
});

module.exports = router;
