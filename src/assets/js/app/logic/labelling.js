function get_labelling(cy) {
	// Note: 'cy.collection()', in this case, is just an empty set.
	let lab = {"in": cy.collection(), "out": cy.collection(), "undec": cy.collection()};

	let nodes = cy.nodes();

	if(nodes.length != 0) {
		// A node is labelled 'in' iff all attackers are already labelled 'out'.
		function should_label_in(node) {
			let attackers = node.incomers().sources();
			let out_attackers = attackers.intersection(lab["out"]);
			return out_attackers.same(attackers);
		}

		// A node is labelled 'out' iif it has at least one attacker that is already labelled 'in'
		function should_label_out(node) {
			let attackers = node.incomers().sources();
			let in_attackers = attackers.intersection(lab["in"]);
			return in_attackers.length >= 1;
		}

		// This array will store all the nodes which were labelled in the past iteration.
		// So, each contained node has the same min-max numbering, which is exactly one-less
		// than the current labelling iteration.
		let node_array = [];

		// A counter used to assign each node their min-max number.
		// This can be thought of as their distance (+1) from the initial
		// 'in' nodes.
		let min_max_counter = 1;

		// Perform initial iteration over all nodes, labelling 'in' on those with no attackers.
		for(let i = 0; i < nodes.length; i++) {
	    	let node = nodes[i];
	    	if (should_label_in(node)) {
				lab["in"] = lab["in"].add(node);
				node.data("min_max_numbering", min_max_counter);
				node_array.push(node);
			}
		}

		let next_node_array = node_array;
		let label_made = true;
		while (label_made) {
			label_made = false;

			node_array = next_node_array;
			next_node_array = [];
			min_max_counter++;

			for(let i = 0; i < node_array.length; i++) {
	    		let node = node_array[i];

				let attacked = node.outgoers().targets();

				for(let j = 0; j < attacked.length; j++) {
					let attacked_node = attacked[j];

					// Check that attacked_node isn't already labelled
					if (!(attacked_node.anySame(lab["in"]) || attacked_node.anySame(lab["out"]))) {
						let labelled = false;
						if (should_label_in(attacked_node)) {
							lab["in"] = lab["in"].add(attacked_node);
							labelled = true;
						} else if (should_label_out(attacked_node)) {
							lab["out"] = lab["out"].add(attacked_node);
							labelled = true;
						}

						if(labelled) {
							label_made = true;
							attacked_node.data("min_max_numbering", min_max_counter);
							next_node_array.push(attacked_node);
						}
					}
				}
			}
		}

		// All nodes that aren't 'in' or 'out' must be 'undec'
		lab["undec"] = nodes.diff(lab["in"].union(lab["out"]))["left"];
		lab["undec"].data("min_max_numbering", Infinity);
	}

	return lab;
}

function is_labelling_shown(cy) {
	return cy.lab["in"].hasClass("in") || cy.lab["out"].hasClass("out") || cy.lab["undec"].hasClass("undec");
}

function is_minmax_shown(cy) {
	return cy.nodes().hasClass("minmax");
}

function show_labelling(cy) {
	if(!cy.lab) {
		return;
	} else {
		hide_labelling(cy);
		cy.lab["in"].addClass("in");
		cy.lab["out"].addClass("out");
		cy.lab["undec"].addClass("undec");
	}
}

function hide_labelling(cy) {
	if(!cy.lab) {
		return;
	} else {
		cy.nodes().removeClass("in out undec");
	}
}

function show_minmax(cy) {
	if(!cy.lab) {
		return;
	} else {
		hide_minmax(cy);
		show_labelling(cy)
		cy.nodes().addClass("minmax");
	}
}

function hide_minmax(cy) {
	if(!cy.lab) {
		return;
	} else {
		hide_labelling(cy)
		cy.nodes().removeClass("minmax");
	}
}

function parse_cytoscape_instance(cy) {
	let setLabelling = function(evt) {
		evt.cy.lab = get_labelling(evt.cy)
		if (is_labelling_shown(cy)) {
			show_labelling(cy);
		}
	}

	cy.on("graphClear", setLabelling);
	cy.on("graphSet", setLabelling);

	return cy;
}

module.exports = {
	"get_labelling": get_labelling,
	"is_labelling_shown": is_labelling_shown,
	"is_minmax_shown": is_minmax_shown,
	"show_labelling": show_labelling,
	"hide_labelling": hide_labelling,
	"show_minmax": show_minmax,
	"hide_minmax": hide_minmax,
	"parse_cytoscape_instance": parse_cytoscape_instance
}