let cyto_helpers = require("../cytoscape-helpers.js");

let MOVES = {
	"HTB":     0,
	"CB":      1,
	"CONCEDE": 2,
	"RETRACT": 3
}

let MOVE_CLASSES = {}
MOVE_CLASSES[MOVES["HTB"]]     = "htb";
MOVE_CLASSES[MOVES["CB"]]      = "cb";
MOVE_CLASSES[MOVES["CONCEDE"]] = "concede";
MOVE_CLASSES[MOVES["RETRACT"]] = "retract";

function move_class(move) {
	return MOVE_CLASSES[MOVES[move]];
}

function has_played(node, move) {
	return node.hasClass(MOVE_CLASSES[move]);
}

function attacks(attacker, victim) {
	return attacker.edgesTo(victim).length > 0;
}

function get_move_nodes(move_stack, move) {
	let cy = cyto_helpers.get_cy(move_stack);

	if (cy === undefined) {
		return undefined;
	} else {
		let move_nodes = cy.collection();
		for (let old_move_node of move_stack) {
			if (has_played(old_move_node, move)) {
				move_nodes = move_nodes.add(old_move_node);
			}
		}
		return move_nodes;
	}
}

function get_min_max_node(nodes, highest=false) {
	if (nodes.length === 0) {
		return undefined;
	} else {
		let best_choice = nodes[0];
		for(let i = 0; i < nodes.length; i++) {
			let node = nodes[i];
			if (highest && node.data("min_max_numbering") > best_choice.data("min_max_numbering")) {
				best_choice = node;
			} else if (!highest && node.data("min_max_numbering") < best_choice.data("min_max_numbering")) {
				best_choice = node;
			}
		}
		return best_choice;
	}
}

// Can HTB be played?
// 	- Preceding move was CB(B), where A attacks B.
//	- No CONCEDE or RETRACT move is applicable.
function can_htb(node, move_stack) {
	let last_node = move_stack.slice(-1)[0];
	if (last_node === undefined) {
		return true;
	} else {
		return (has_played(last_node, MOVES["CB"]) && attacks(node, last_node)) &&
			(find_concede(move_stack).length === 0 && find_retract(move_stack).length === 0);
	}

	return false;
}

// Can CB be played?
// 	- A is an attacker of the last HTB(B) statement, that has not yet been played CONCEDE.
//	- B has not yet been played RETRACT.
//	- No CONCEDE or RETRACT move is applicable.
function can_cb(node, move_stack) {
	let htb_nodes = get_move_nodes(move_stack, MOVES["HTB"]);
	let last_htb = htb_nodes.last();

	return last_htb !== undefined && attacks(node, last_htb) &&
		!has_played(node, MOVES["RETRACT"]) &&
		(find_concede(move_stack).length === 0 && find_retract(move_stack).length === 0);

	return false;
}

// Can CONCEDE be played?
// 	- HTB has been played on node.
// 	- Every attacker of node is RETRACT.
// 	- CONCEDE has not yet been played on node.
function can_concede(node, move_stack) {
	if (has_played(node, MOVES["HTB"]) && !has_played(node, MOVES["CONCEDE"])) {
		let attackers = node.incomers().sources();
		let non_retracted_attackers = attackers.filter((i, attacker) => {
			return !has_played(attacker, MOVES["RETRACT"]);
		});

		return non_retracted_attackers.length === 0;
	}

	return false;
}

// Can RETRACT be played?
// 	- CB has been played on node.
// 	- Every attacker of node is CONCEDE.
// 	- RETRACT has not yet been played on node.
function can_retract(node, move_stack) {
	if (has_played(node, MOVES["CB"]) && !has_played(node, MOVES["RETRACT"])) {
		let attackers = node.incomers().sources();
		let conceded_attackers = attackers.filter((i, ele) => {
			return has_played(ele, MOVES["CONCEDE"]);
		});

		return conceded_attackers.length > 0;
	}

	return false;
}

// Find the nodes that can be used to play the HTB move.
function find_htb(move_stack) {
	let cy = cyto_helpers.get_cy(move_stack);

	if (cy === undefined) {
		return undefined;
	} else {
		let nodes = cy.collection();
		let last_node = move_stack.slice(-1)[0];

		// As we know a HTB move can only be played if the last move was CB,
		// we only need to filter the attackers of that previous CB move.
		if (last_node === undefined || has_played(last_node, MOVES["CB"])) {
			let possible_nodes = last_node.incomers().sources();
			nodes = possible_nodes.filter((i, node) => {
				return can_htb(node, move_stack);
			});
		}

		return nodes;
	}
}

// Find the nodes that can be used to play the CB move.
function find_cb(move_stack) {
	let cy = cyto_helpers.get_cy(move_stack);

	if (cy === undefined) {
		return undefined;
	} else {
		let nodes = cy.collection();

		let last_node = move_stack.slice(-1)[0];
		let last_move_cb = has_played(last_node, MOVES["CB"]);

		if (!last_move_cb) {
			// As we know a CB move can only be played against the last HTB move,
			// we only need to filter the attackers of that previous HTB move.
			let htb_nodes = get_move_nodes(move_stack, MOVES["HTB"]);
			let last_htb = htb_nodes.last();
			let htb_attackers = last_htb.incomers().sources();
			nodes = htb_attackers.filter((i, node) => {
				return can_cb(node, move_stack);
			});
		}

		return nodes;
	}
}

// Find the nodes that can be used to play the CONCEDE move.
function find_concede(move_stack) {
	let cy = cyto_helpers.get_cy(move_stack);

	if (cy === undefined) {
		return undefined;
	} else {
		let nodes = cy.collection();

		// As we know a CONCEDE move can only be played against a HTB move,
		// we only need to filter the existing HTB moves.
		let htb_nodes = get_move_nodes(move_stack, MOVES["HTB"]);
		nodes = htb_nodes.filter((i, node) => {
			return can_concede(node, move_stack);
		});

		return nodes;
	}
}

// Find the nodes that can be used to play the RETRACT move.
function find_retract(move_stack) {
	let cy = cyto_helpers.get_cy(move_stack);

	if (cy === undefined) {
		return undefined;
	} else {
		let nodes = cy.collection();

		// As we know a RETRACT move can only be played against a CB move,
		// we only need to filter the existing CB moves.
		let cb_nodes = get_move_nodes(move_stack, MOVES["CB"]);
		nodes = cb_nodes.filter((i, node) => {
			return can_retract(node, move_stack)
		});

		return nodes;
	}
}

// The discussion is terminated iff no next move is possible.
function check_termination(the_move, node, move_stack) {
	if (the_move === MOVES["HTB"]) {
		return false;

	} else if (the_move === MOVES["CB"]) {
		let attackers = node.incomers().sources();
		let available_attackers = attackers.filter((i, ele) => {
			return !(has_played(ele, MOVES["HTB"]) || has_played(ele, MOVES["CONCEDE"]));
		});
		return available_attackers.length === 0 && !can_retract(node, move_stack);

	} else if (the_move === MOVES["CONCEDE"]) {
		return has_played(move_stack[0], MOVES["CONCEDE"]);

	} else if  (the_move === MOVES["RETRACT"]) {
		return false;
	}
	return false;
}

// The proponent only wins when their initial HTB is CONCEDE.
function check_proponent_win(the_move, node, move_stack) {
	return the_move === MOVES["CONCEDE"] && has_played(move_stack[0], MOVES["CONCEDE"]);
}

module.exports = {
	"MOVES": MOVES,
	"MOVE_CLASSES": MOVE_CLASSES,
	"move_class": move_class,
	"has_played": has_played,
	"attacks": attacks,
	"get_move_nodes": get_move_nodes,
	"get_min_max_node": get_min_max_node,
	"can_htb": can_htb,
	"can_cb": can_cb,
	"can_concede": can_concede,
	"can_retract": can_retract,
	"find_htb": find_htb,
	"find_cb": find_cb,
	"find_concede": find_concede,
	"find_retract": find_retract,
	"check_termination": check_termination,
	"check_proponent_win": check_proponent_win
}