function parseCytoscapeInstance(cy) {
	cy.app_data.switch_graph_delete = {};

	$("[data-switch-graph-delete]").on("m-button-switched", function(event, is_on) {
		cy.app_data.switch_graph_delete["delete_mode"] = is_on;
	});

	function tryRemoveElement(evt) {
		if (cy.app_data.switch_graph_delete["delete_mode"]) {
			evt.cyTarget.remove();
		}
	}

	cy.on("tap", "edge", tryRemoveElement);
	cy.on("tap", "node", tryRemoveElement);

	return cy;
}

module.exports = {
	"parseCytoscapeInstance": parseCytoscapeInstance
}