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

	create_log_msg(cy, node, highlighted_nodes);

	// Discuss the newly highlighted nodes
	for(let i = 0; i < highlighted_nodes.length; i++) {
		let discuss_node = highlighted_nodes[i];
		discuss(cy, discuss_node, highlight_class, highlight_class);
	}
}

function clear_discuss(cy, discuss_class="discuss", highlight_class="highlight") {
	clear_log();
	for(let style_class of [discuss_class, highlight_class]) {
		cy.nodes().removeClass(style_class);
		cy.edges().removeClass(style_class);
	}
}

function create_log_msg(cy, node, highlighted_nodes) {
	let is_in = node.anySame(cy.lab["in"]);
	let is_out = node.anySame(cy.lab["out"]);
	let is_undec = node.anySame(cy.lab["undec"]);

	let highlighted_str = "";
	for(let i = 0; i < highlighted_nodes.length; i++) {
		let highlight_node = highlighted_nodes[i];
		if(i !== 0) {
			highlighted_str += ", ";
		}
		highlighted_str += "<em>" + highlight_node.id() + "</em>";
	}

	let log_str = "<em>" + node.id() + "</em> is labelled ";
	if(is_in) {
		log_str += "<em>in</em> as ";
		if(highlighted_nodes.length === 0) {
			log_str += "it has no attackers, therefore all its attackers \
				must be labelled <em>out</em>.";
		} else {
			log_str += "all its attackers (" + highlighted_str + ") are labelled <em>out</em>.";
		}
	} else if(is_out) {
		log_str += "<em>out</em> as it has at least one attacker (" + highlighted_str + ") labelled \
			<em>in</em>.";
	} else if(is_undec) {
		log_str += "<em>undec</em> as it is not either <em>in</em> or <em>out</em>."
	}

	append_log(log_str);
}

function append_log(msg) {
	$("[data-discuss-empty]").hide();
	$("[data-discuss-list]").show();

	$("[data-discuss-list]").append("<li>" + msg + "</li>");
}

function clear_log() {
	$("[data-discuss-empty]").show();
	$("[data-discuss-list]").hide();
	$("[data-discuss-list]").empty();
}

function parse_cytoscape_instance(cy) {
	clear_log();

	cy.on("tap", "node", function (evt) {
		clear_discuss(evt.cy);
		append_log("Discussing argument '" + evt.cyTarget.id() + "'");
		discuss(evt.cy, evt.cyTarget);
	});
	return cy;
}

module.exports = {
	"discuss": discuss,
	"parse_cytoscape_instance": parse_cytoscape_instance
}