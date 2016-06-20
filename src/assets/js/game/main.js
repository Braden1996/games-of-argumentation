let cytoscape = require("cytoscape");
let cyto_helpers = require("./cytoscape-helpers.js");
let config = require("./config.js");

// Load site
let graphviewswitch = require("./site/graphviewswitch.js");
let opengraphfile = require("./site/opengraphfile.js");
let playgame = require("./site/playgame.js");

// Load rest of game
let discuss = require("./discuss.js");
let labelling = require("./labelling.js");

function ready() {
	let cy_container = $(config.cytoscape_container);
	let cy = cyto_helpers.create_cytoscape_instance(cy_container);

	// Parse cy to site
	graphviewswitch.parse_cytoscape_instance(cy);
	opengraphfile.parse_cytoscape_instance(cy);
	playgame.parse_cytoscape_instance(cy);

	// Parse cy to rest of game
	discuss.parse_cytoscape_instance(cy);
	labelling.parse_cytoscape_instance(cy);
}

module.exports = {
	"ready": ready
}