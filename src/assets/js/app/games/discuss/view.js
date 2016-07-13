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

	append_log("<li>" + log_str + "</li>");
}

function append_log(msg) {
	$("[data-discuss-empty]").hide();
	$("[data-discuss-list]").show();

	$("[data-discuss-list]").append(msg);
}

function clear_log() {
	$("[data-discuss-empty]").show();
	$("[data-discuss-list]").hide();
	$("[data-discuss-list]").empty();
}

function parse_cytoscape_instance(cy, discuss_callback) {
	cy.on("tap", "node", (evt) => {
		if(!evt.cy.game_play_playing) {
			let old_node = evt.cy.discuss_target;
			let new_node = evt.cyTarget

			append_log("Discussing argument '" + new_node + "'");

			discuss_callback(new_node, old_node);
		}
	});

	return cy;
}

module.exports = {
	"create_log_msg": create_log_msg,
	"append_log": append_log,
	"clear_log": clear_log,
	"parse_cytoscape_instance": parse_cytoscape_instance
}