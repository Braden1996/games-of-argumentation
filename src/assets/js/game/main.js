let cytoscape = require("cytoscape");
let cyto_helpers = require("./cytoscape-helpers.js");
let discuss = require("./discuss.js");

let cy_container = $("#l-grapharea__container");
let cy = cyto_helpers.create_cytoscape_instance(cy_container);

discuss.parse_cytoscape_instance(cy);

module.exports = {
	"cytoscape_instance": cy
}