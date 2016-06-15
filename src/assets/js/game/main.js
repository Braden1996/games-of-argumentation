let cytoscape = require("cytoscape");
let cyto_helpers = require("./cytoscape-helpers.js");

let cy_container = $("#l-grapharea__container");
let cy = cyto_helpers.create_cytoscape_instance(cy_container);

let our_style = cyto_helpers.build_stylesheet();
cy.style(our_style);

module.exports = {
	"cytoscape_instance": cy
}