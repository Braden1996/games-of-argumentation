let cytoscape = require("cytoscape");
let config = require("./config.js");

// Load some helper functions for interfacing with Cytoscape
let cyto_helpers = require("./util/cytoscape-helpers.js");

// Load views
let graphviewswitch = require("./views/graphviewswitch.js");
let opengraphfile = require("./views/opengraphfile.js");
let viewgraphfile = require("./views/viewgraphfile.js");

// Load logic
let labelling = require("./logic/labelling.js");

// Load games
let discuss = require("./games/discuss/main.js");
let grounded = require("./games/grounded/main.js");

// The modules which we parse our Cytoscape instance into.
let parse_cytoscape_modules = [graphviewswitch, opengraphfile, viewgraphfile, labelling, discuss, grounded];

function ready() {
	let cy_container = $(config.cytoscape_container);
	let cy = cyto_helpers.create_cytoscape_instance(cy_container);
	cy.style(config.cytoscape_stylesheet);

	parse_cytoscape_modules.forEach((module, i, arr) => module.parse_cytoscape_instance(cy));

	return cy;
}

module.exports = {
	"ready": ready
}