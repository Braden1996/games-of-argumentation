let cyto_helpers = require("../../util/cytoscape-helpers.js");
let discuss_site = require("./view.js");

function discuss(node, discuss_class="discuss", highlight_class="highlight") {
	let cy = cyto_helpers.getCy(node);

	let is_in = node.anySame(cy.app_data.labelling["grounded"]["in"]);
	let is_out = node.anySame(cy.app_data.labelling["grounded"]["out"]);
	let is_undec = node.anySame(cy.app_data.labelling["grounded"]["undec"]);

	node.addClass(discuss_class);

	let highlighted_nodes = cy.collection();
	if (is_in) {
		// As the node is labelled 'in', we know ALL attackers are 'out'
		highlighted_nodes = node.incomers().sources();
	} else if (is_out) {
		// As the node is labelled 'out', we know at least one attacker is 'in'
		let attackers = node.incomers().sources();
		let in_attackers = attackers.intersection(cy.app_data.labelling["grounded"]["in"]);

		// We should only consider attackers who have a lower min-max numbering
		let node_min_max = node.data("min_max_numbering");
		highlighted_nodes = in_attackers.filter((i, attacker) => attacker.data("min_max_numbering") < node_min_max);
	} else if (is_undec) {
		// It is undefined how we should discuss an 'undec' node
	}

	let highlighted_edges = node.edgesWith(highlighted_nodes).difference(node.edgesTo(highlighted_nodes));

	highlighted_edges.addClass(highlight_class);
	highlighted_nodes.addClass(highlight_class);

	discuss_site.createLogMsg(node, highlighted_nodes);

	// Discuss the newly highlighted nodes
	for (let i = 0; i < highlighted_nodes.length; i++) {
		let discuss_node = highlighted_nodes[i];
		discuss(discuss_node, highlight_class, highlight_class);
	}
}

function clearDiscuss(cy, discuss_class="discuss", highlight_class="highlight") {
	cy.app_data.discuss["target"] = undefined;

	discuss_site.clearLog();
	for (let style_class of [discuss_class, highlight_class]) {
		cy.nodes().removeClass(style_class);
		cy.edges().removeClass(style_class);
	}
}

function parseCytoscapeInstance(cy) {
	cy.app_data.discuss = {}

	clearDiscuss(cy);
	cy = discuss_site.parseCytoscapeInstance(cy, (new_node, old_node) => {
		clearDiscuss(cy);
		if (new_node !== old_node) {
			cy.app_data.discuss["target"] = new_node;
			discuss(new_node);
		}
	});
	return cy;
}

module.exports = {
	"discuss": discuss,
	"clearDiscuss": clearDiscuss,
	"parseCytoscapeInstance": parseCytoscapeInstance
}