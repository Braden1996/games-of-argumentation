let rules = require("./rules.js");

let MOVES = rules.MOVES;

// Find the nodes that can be used to play the HTB move.
function find_htb(move_stack) {
	let last_node = move_stack.slice(-1)[0];

	if (last_node !== undefined && rules.has_played(last_node, MOVES["CB"])) {
		let possible_nodes = last_node.incomers().sources();
		let nodes = possible_nodes.filter((i, node) => {
			return rules.can_htb(node, move_stack);
		});
		return nodes;
	} else {
		return undefined;
	}
}

// Find the nodes that can be used to play the CB move.
function find_cb(move_stack) {
}

// Find the nodes that can be used to play the CONCEDE move.
function find_concede(move_stack) {
}

// Find the nodes that can be used to play the RETRACT move.
function find_retract(move_stack) {
}

function get_move(move_stack, is_proponent) {
	let move = undefined;
	let node = undefined;

	if (is_proponent) {
		let htb_nodes = find_htb(move_stack);
		if (htb_nodes !== undefined && htb_nodes.length > 0) {
			move = MOVES["HTB"];

			let best_choice_node = htb_nodes[0];
			for(let i = 0; i < htb_nodes.length; i++) {
				let htb_node = htb_nodes[i];
				if (htb_node.data("min_max_numbering") < best_choice_node.data("min_max_numbering")) {
					best_choice_node = htb_node;
				}
			}

			node = best_choice_node;
		}
	}
	// } else {
	// 	if (rules.has_played(last_node, MOVES["HTB"])) {
	// 		the_move = MOVES["CONCEDE"];

	// 	} else 
	// 		the_move = MOVES["RETRACT"];

	// 	}
	// }

	return [move, node];
}

module.exports = {
	"find_htb": find_htb,
	"find_cb": find_cb,
	"find_concede": find_concede,
	"find_retract": find_retract,
	"get_move": get_move
}