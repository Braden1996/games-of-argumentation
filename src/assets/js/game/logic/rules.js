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

let ROUND_STATES = {
	"PLAYING": 0,
	"PROPONENT_WIN": 1,
	"OPPONENT_WIN": 2
}

function hasPlayed(node, move) {
	return node.hasClass(MOVE_CLASSES[move]);
}

function getMoveClass(move) {
	return MOVE_CLASSES[MOVES[move]];
}

function getMoveNodes(move_stack, move) {
	let move_nodes = move_stack.filter((node, i, nodes) => hasPlayed(node, move));

	let cy = cyto_helpers.get_cy(move_stack);
	return cy.collection(move_nodes);
}

// The discussion is terminated iff no next move is possible.
function getRoundState(move_stack) {
	let last_node = move_stack.slice(-1)[0];
	if (hasPlayed(last_node, MOVES["CB"])) {
		let attackers = last_node.incomers().sources();
		let available_attackers = attackers.filter((i, ele) => {
			return !(hasPlayed(ele, MOVES["HTB"]) || hasPlayed(ele, MOVES["CONCEDE"]));
		});

		if (available_attackers.empty() && !isValidMove(MOVES["RETRACT"], last_node)) {
			return ROUND_STATES["OPPONENT_WIN"];
		}

	} else if (hasPlayed(last_node, MOVES["CONCEDE"])) {
		console.log("Cunt:", last_node.id(), move_stack[0].id(), last_node.same(move_stack[0]));
		if (last_node.same(move_stack[0])) {
			console.log("Fucker");
			return ROUND_STATES["PROPONENT_WIN"];
		}
	}

	return ROUND_STATES["PLAYING"];
}

// Return true if the given mode valid for the given node.
function isValidMove(the_move, node) {
	// Can HTB be played?
	// 	- No move has yet been made.
	//	OR
	// 	- Preceding move was CB(B), where A attacks B.
	//	- No CONCEDE or RETRACT move is applicable.
	if (the_move === MOVES["HTB"]) {
		let move_stack = node.cy().game_play_stack;
		let last_node = move_stack.slice(-1)[0];
		return move_stack.length === 0 || (
			(hasPlayed(last_node, MOVES["CB"]) && cyto_helpers.attacks(node, last_node)) &&
			(findMoveNodes(MOVES["CONCEDE"], move_stack).empty() && findMoveNodes(MOVES["RETRACT"], move_stack).empty())
		);

	// Can CB be played?
	// 	- A is an attacker of the last HTB(B) statement, that has not yet been played CONCEDE.
	//	- B has not yet been played RETRACT.
	//	- No CONCEDE or RETRACT move is applicable.
	} else if (the_move === MOVES["CB"]) {
		let move_stack = node.cy().game_play_stack;
		let last_htb = getMoveNodes(move_stack, MOVES["HTB"]).last();
		return last_htb.nonempty() && (
			cyto_helpers.attacks(node, last_htb) && !hasPlayed(node, MOVES["RETRACT"]) &&
			(findMoveNodes(MOVES["CONCEDE"], move_stack).empty() && findMoveNodes(MOVES["RETRACT"], move_stack).empty())
		);

	// Can CONCEDE be played?
	// 	- HTB has been played on node.
	// 	- Every attacker of node is RETRACT.
	// 	- CONCEDE has not yet been played on node.
	} else if (the_move === MOVES["CONCEDE"]) {
		if (hasPlayed(node, MOVES["HTB"]) && !hasPlayed(node, MOVES["CONCEDE"])) {
			let attackers = node.incomers().sources();
			let non_retracted_attackers = attackers.filter((i, attacker) => {
				return !hasPlayed(attacker, MOVES["RETRACT"]);
			});

			return non_retracted_attackers.empty();
		}

	// Can RETRACT be played?
	// 	- CB has been played on node.
	// 	- Every attacker of node is CONCEDE.
	// 	- RETRACT has not yet been played on node.
	} else if (the_move === MOVES["RETRACT"]) {
		if (hasPlayed(node, MOVES["CB"]) && !hasPlayed(node, MOVES["RETRACT"])) {
			let attackers = node.incomers().sources();
			let conceded_attackers = attackers.filter((i, ele) => {
				return hasPlayed(ele, MOVES["CONCEDE"]);
			});

			return conceded_attackers.nonempty();
		}
	}

	return undefined;
}

// Find the nodes that can be used to play the given move.
function findMoveNodes(the_move, move_stack) {
	// Find the nodes that can be used to play the HTB move.
	// As we know a HTB move can only be played if the last move was CB,
	// we only need to filter the attackers of said previous CB move.
	if (the_move === MOVES["HTB"]) {
		let last_node = move_stack.slice(-1)[0];
		if (last_node.empty() || hasPlayed(last_node, MOVES["CB"])) {
			let possible_nodes = last_node.incomers().sources();
			return possible_nodes.filter((i, node) =>  isValidMove(MOVES["HTB"], node));
		} else {
			let cy = cyto_helpers.get_cy(move_stack);
			return cy.collection();
		}

	// Find the nodes that can be used to play the CB move.
	// As we know a CB move can only be played against the last HTB move,
	// we only need to filter the attackers of that previous HTB move.
	} else if (the_move === MOVES["CB"]) {
		let last_node = move_stack.slice(-1)[0];

		if (hasPlayed(last_node, MOVES["CB"])) {
			let cy = cyto_helpers.get_cy(move_stack);
			return cy.collection();
		} else {
			let last_htb = getMoveNodes(move_stack, MOVES["HTB"]).last();
			let htb_attackers = last_htb.incomers().sources();
			return htb_attackers.filter((i, node) => isValidMove(MOVES["CB"], node));
		}

	// Find the nodes that can be used to play the CONCEDE move.
	// As we know a CONCEDE move can only be played against a HTB move,
	// we only need to filter the existing HTB moves.
	} else if (the_move === MOVES["CONCEDE"]) {
		let htb_nodes = getMoveNodes(move_stack, MOVES["HTB"]);
		return htb_nodes.filter((i, node) => isValidMove(MOVES["CONCEDE"], node));

	// Find the nodes that can be used to play the RETRACT move.
	// As we know a RETRACT move can only be played against a CB move,
	// we only need to filter the existing CB moves.
	} else if (the_move === MOVES["RETRACT"]) {
		let cb_nodes = getMoveNodes(move_stack, MOVES["CB"]);
		return cb_nodes.filter((i, node) => isValidMove(MOVES["RETRACT"], node));
	}

	return undefined;
}

function isProponentsTurn(move_stack) {
	return move_stack.length === 0 || findMoveNodes(MOVES["HTB"], move_stack).length > 0;
}

module.exports = {
	"MOVES": MOVES,
	"MOVE_CLASSES": MOVE_CLASSES,
	"ROUND_STATES": ROUND_STATES,
	"hasPlayed": hasPlayed,
	"getMoveClass": getMoveClass,
	"getMoveNodes": getMoveNodes,
	"getRoundState": getRoundState,
	"isValidMove": isValidMove,
	"findMoveNodes": findMoveNodes,
	"isProponentsTurn": isProponentsTurn
}