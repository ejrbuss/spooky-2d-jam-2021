const merge = require("webpack-merge");
const base = require("./base");

module.exports = merge(base, {
	output: {
		filename: "bundle.min.js",
	},
});
