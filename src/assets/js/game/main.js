let cytoscape = require("cytoscape");
let cyto_helpers = require("./cytoscape-helpers.js");

let cy = cytoscape({
	container: $("#l-grapharea__container"),

	boxSelectionEnabled: false,
	autounselectify: true,
});

let our_style = cyto_helpers.build_stylesheet();
cy.style(our_style);

module.exports = {
	"cytoscape_instance": cy
}