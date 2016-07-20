let cytoscape = require("cytoscape");
let config = require("./config.js");

// Load some helper functions for interfacing with Cytoscape
let cyto_helpers = require("./util/cytoscape-helpers.js");

// The modules which we parse our Cytoscape instance into.
let parse_cytoscape_modules = [
	// Load views
	require("./views/open-graph-file.js"),
	require("./views/save-graph-file.js"),
	require("./views/switch-graph-delete.js"),
	require("./views/switch-graph-view.js"),

	// Load logic
	 require("./logic/labelling.js"),

	// Load games
	require("./games/discuss/main.js"),
	require("./games/grounded/main.js")
];

function ready() {
	let cy_container = $(config.cytoscape_container);
	let cy = cyto_helpers.createCytoscapeInstance(cy_container);
	cy.style(config.cytoscapeStylesheet);

	parse_cytoscape_modules.forEach((module, i, arr) => module.parseCytoscapeInstance(cy));

	return cy;
}

module.exports = {
	"ready": ready
}