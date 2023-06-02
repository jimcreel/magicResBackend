const mongoose = require("mongoose");
const requestSchema = require("./request");

const userSchema = new mongoose.Schema({
	name: {
		type: String
		
	},
	email: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		minlength: 8,
		required: true
	},
	phone: {
		type: String
	},
	requests: {
		type: [requestSchema]
	},
	notifications: {
		type: [String]
	},
	subscription: {
		type: Boolean
	},
	defaultResort: {
		type: String,
		enum: ["DLR", "WDW"],
	},
	defaultPass: {
		type: String,
		enum: [
			"inspire-key-pass",
			"believe-key-pass",
			"enchant-key-pass",
			"dream-key-pass",
			"imagine-key-pass",
			"disney-incredi-pass",
			"disney-sorceror-pass",
			"disney-pirate-pass",
			"disney-pixie-dust-pass",
		],
	},
});

module.exports = mongoose.model("User", userSchema);
