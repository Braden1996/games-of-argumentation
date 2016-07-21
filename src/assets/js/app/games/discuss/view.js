let cyto_helpers = require("../../util/cytoscape-helpers.js");

function createLogMsg(node, highlighted_nodes) {
	let cy = cyto_helpers.getCy(node);

	let lab = cy.app_data.labelling["grounded"];
	let is_in = node.anySame(lab["in"]);
	let is_out = node.anySame(lab["out"]);
	let is_undec = node.anySame(lab["undec"]);

	let highlighted_str = "";
	for (let i = 0; i < highlighted_nodes.length; i++) {
		let highlight_node = highlighted_nodes[i];
		if(i !== 0) {
			highlighted_str += ", ";
		}
		highlighted_str += "<em>" + highlight_node.id() + "</em>";
	}

	let log_str = "<em>" + node.id() + "</em> is labelled ";
	if (is_in) {
		log_str += "<em>in</em> as ";
		if (highlighted_nodes.length === 0) {
			log_str += "it has no attackers, therefore all its attackers \
				must be labelled <em>out</em>.";
		} else {
			log_str += "all its attackers (" + highlighted_str + ") are labelled <em>out</em>.";
		}
	} else if (is_out) {
		log_str += "<em>out</em> as it has at least one attacker (" + highlighted_str + ") labelled \
			<em>in</em>.";
	} else if (is_undec) {
		log_str += "<em>undec</em> as it is not either <em>in</em> or <em>out</em>."
	}

	appendLog("<li>" + log_str + "</li>");
}

function appendLog(msg) {
	$("[data-discuss-empty]").hide();
	$("[data-discuss-list]").show();

	$("[data-discuss-list]").append(msg);
}

function clearLog() {
	$("[data-discuss-empty]").show();
	$("[data-discuss-list]").hide();
	$("[data-discuss-list]").empty();
}

function parseCytoscapeInstance(cy, discussCallback) {
	cy.on("tap", "node", (evt) => {
		if((!cy.app_data.grounded || cy.app_data.grounded["state"] === cy.app_data.grounded["UNKNOWN_STATE"]) &&
			(!cy.app_data.socratic || cy.app_data.socratic["state"] === cy.app_data.socratic["UNKNOWN_STATE"])) {
			let old_node = evt.cy.app_data.discuss["target"];
			let new_node = evt.cyTarget

			appendLog("Discussing argument '" + new_node + "'");

			discussCallback(new_node, old_node);
		}
	});

	return cy;
}

module.exports = {
	"createLogMsg": createLogMsg,
	"appendLog": appendLog,
	"clearLog": clearLog,
	"parseCytoscapeInstance": parseCytoscapeInstance
}