

function parse_cytoscape_instance(cy) {
	$("[data-js='graph-delete-mode']").on("m-button-switched", function(event, is_on) {
		cy.graph_delete_mode = is_on;
	});

	function tryRemoveElement(evt) {
		if (cy.graph_delete_mode) {
			evt.cyTarget.remove();
		}
	}

	cy.on("tap", "edge", tryRemoveElement);
	cy.on("tap", "node", tryRemoveElement);

	return cy;
}

module.exports = {
	"parse_cytoscape_instance": parse_cytoscape_instance
}