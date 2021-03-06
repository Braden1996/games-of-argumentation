let cytoscape = require("cytoscape");
let config = require("./config.js");

// Load some helper functions for interfacing with Cytoscape
let cyto_helpers = require("./util/cytoscape-helpers.js");

// The modules which we parse our Cytoscape instance into.
let parse_cytoscape_modules = [
	// Load views
	require("./views/open-graph-file.js"),
	require("./views/save-graph-file.js"),
	require("./views/save-graph-png.js"),
	require("./views/switch-graph-delete.js"),

	// Load logic
	require("./logic/labelling.js"),

	// Load games
	require("./games/grounded/view.js"),
	require("./games/preferred/view.js"),
];

function ready() {
	let cy_container = $(config.cytoscape_container);
	let cy = cyto_helpers.createCytoscapeInstance(cy_container);
	cy.style(config.cytoscapeStylesheet);

	parse_cytoscape_modules.forEach((m, i) => m.parseCytoscapeInstance(cy));

	return cy;
}

module.exports = {
	"ready": ready
}