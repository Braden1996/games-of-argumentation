let discuss_site = require("./site/discuss.js");

function discuss(cy, node, discuss_class="discuss", highlight_class="highlight") {
	let is_in = node.anySame(cy.lab["in"]);
	let is_out = node.anySame(cy.lab["out"]);
	let is_undec = node.anySame(cy.lab["undec"]);

	node.addClass(discuss_class);

	let highlighted_nodes = cy.collection();
	if(is_in) {
		// As the node is labelled 'in', we know ALL attackers are 'out'
		highlighted_nodes = node.incomers().sources();
	} else if(is_out) {
		// As the node is labelled 'out', we know at least one attacker is 'in'
		let attackers = node.incomers().sources();
		let in_attackers = attackers.intersection(cy.lab["in"]);

		// We should only consider attackers who have a lower min-max numbering
		let node_min_max = node.data("min_max_numbering");
		highlighted_nodes = in_attackers.filter((i, attacker) => attacker.data("min_max_numbering") < node_min_max);
	} else if(is_undec) {
		// It is undefined how we should discuss an 'undec' node
	}

	let highlighted_edges = node.edgesWith(highlighted_nodes).difference(node.edgesTo(highlighted_nodes));

	highlighted_edges.addClass(highlight_class);
	highlighted_nodes.addClass(highlight_class);

	discuss_site.create_log_msg(cy, node, highlighted_nodes);

	// Discuss the newly highlighted nodes
	for(let i = 0; i < highlighted_nodes.length; i++) {
		let discuss_node = highlighted_nodes[i];
		discuss(cy, discuss_node, highlight_class, highlight_class);
	}
}

function clear_discuss(cy, discuss_class="discuss", highlight_class="highlight") {
	cy.discuss_target = undefined;

	discuss_site.clear_log();
	for(let style_class of [discuss_class, highlight_class]) {
		cy.nodes().removeClass(style_class);
		cy.edges().removeClass(style_class);
	}
}

function parse_cytoscape_instance(cy) {
	clear_discuss(cy);
	cy = discuss_site.parse_cytoscape_instance(cy, (new_node, old_node) => {
		clear_discuss(cy);
		if(new_node !== old_node) {
			cy.discuss_target = new_node;
			discuss(cy, new_node);
		}
	});
	return cy;
}

module.exports = {
	"discuss": discuss,
	"clear_discuss": clear_discuss,
	"parse_cytoscape_instance": parse_cytoscape_instance
}