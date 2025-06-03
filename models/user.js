const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
	{
		//required
		_id: mongoose.Schema.Types.ObjectId,
		username: { type: String, default: "" },
		fullname: { type: String, default: "" },
		email: { type: String, required: true },
		password: { type: String, required: true },
		role: {
			type: String,
			default: "User",
			enum: ["Admin", "User", "FandomManager", "BusinessMnager"],
		},
		//profile
		dob: { type: String, default: null },
		phone: { type: String, default: null },
		gender: {
			type: String,
			default: "Other",
			enum: ["Male", "Female", "Other"],
		},
		profilePicture: { type: String, default: "default.jpg" },
		shortBio: { type: String, default: null },
		location: {},
		//fan things
		interests: [{ type: String, default: null }],
		fandoms: [],
		//checks
		isSocial: { type: Boolean, default: false },
		isBlocked: { type: Boolean, default: false },
		isVerified: { type: Boolean, default: false },
		notificationEnabled: { type: Boolean, default: false },
		//business / fandom partner
		fandomType: { type: String, default: null },
		brandAsset: { type: String, default: null },
		brandColor: { type: String, default: null },
		//others
		resetToken: { type: Number, default: null },
		resetTokenExpiration: { type: Date, default: null },
		deletedAt: { type: Date, default: null },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
