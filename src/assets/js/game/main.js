let cytoscape = require("cytoscape");
let cyto_helpers = require("./cytoscape-helpers.js");
let config = require("./config.js");

// Load site
let graphviewswitch = require("./site/graphviewswitch.js");
let opengraphfile = require("./site/opengraphfile.js");

// Load rest of game
let discuss = require("./logic/discuss.js");
let labelling = require("./logic/labelling.js");
let playgame = require("./playgame.js");

function ready() {
	let cy_container = $(config.cytoscape_container);
	let cy = cyto_helpers.create_cytoscape_instance(cy_container);

	// Parse cy to site
	cy = graphviewswitch.parse_cytoscape_instance(cy);
	cy = opengraphfile.parse_cytoscape_instance(cy);

	// Parse cy to rest of game
	cy = discuss.parse_cytoscape_instance(cy);
	cy = labelling.parse_cytoscape_instance(cy);
	cy = playgame.parse_cytoscape_instance(cy);

	return cy;
}

module.exports = {
	"ready": ready
}