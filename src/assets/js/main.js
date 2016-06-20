// Libraries
// (check package.json for library "entry-point" information)
require("jquery");


$(document).ready(function() {
	// Load visuals
	require("./visuals/m-button.js");
	require("./visuals/m-tablist.js");

	// Load site
	require("./site/onclick.js");

	// Load game
	let game = require("./game/main.js");
	game.ready();
});