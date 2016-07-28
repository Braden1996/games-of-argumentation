let cyto_helpers = require("../../util/cytoscape-helpers.js");

let MOVES = {
	"IN": 0,
	"OUT": 1
}

let MOVE_CLASSES = {};
MOVE_CLASSES[MOVES["IN"]] = "discuss-in";
MOVE_CLASSES[MOVES["OUT"]] = "discuss-out";

let ROUND_STATES = {
	"UNKNOWN": -1,
	"PLAYING": 0,
	"TERMINATE": 1,
}

let TERMINATE_STATES = {
	"UNKNOWN": -1,
	"SM_REPEAT": 0,
	"MS_REPEAT": 1,
	"M_NOMOVE": 2,
	"S_NOMOVE": 3
}

class Game {
	constructor() {
		this.move_stack = height;
		this.node_stack = width;
	}
}

// Calculate and return the current state of the game.
// The game terminates when:
//	- If S uses an argument previously used by M (S wins)
//	- If M uses an argument previously used by S (S wins)
//	- If M cannot make a move (S wins)
//	- If S cannot make a move (M wins)
function getRoundState(node_stack) {
	let cy = cyto_helpers.getCy(node_stack);
	let move_stack = cy.app_data.preferred["move_stack"];

	let last_move = move_stack.slice(-1)[0];
	let last_node = node_stack.slice(-1)[0];

	// If S uses an argument previously used by M (S wins).
	if (last_move === MOVES["OUT"] && hasPlayed(last_node, MOVES["IN"])) {
		return {"state": ROUND_STATES["TERMINATE"], "terminate_state": TERMINATE_STATES["SM_REPEAT"]};

	// If M uses an argument previously used by S (S wins).
	} else if (last_move === MOVES["OUT"] && hasPlayed(last_node, MOVES["IN"])) {
		return {"state": ROUND_STATES["TERMINATE"], "terminate_state": TERMINATE_STATES["MS_REPEAT"]};

	// If M cannot make a move (S wins)
	} else if (findMoveNodes(MOVES["IN"], node_stack).empty()) {
		return {"state": ROUND_STATES["PLAYING"], "terminate_state": TERMINATE_STATES["M_NOMOVE"]};

	// If S cannot make a move (M wins)
	} else if (findMoveNodes(MOVES["OUT"], node_stack).empty()) {
		return {"state": ROUND_STATES["PLAYING"], "terminate_state": TERMINATE_STATES["S_NOMOVE"]};
	}

	return {"state": ROUND_STATES["PLAYING"], "terminate_state": TERMINATE_STATES["UNKNOWN"]};
}

// Return true if the playing the given move on the given node is allowed.
function isValidMove(the_move, node) {
	let cy = cyto_helpers.getCy(node);
	let move_stack = cy.app_data.preferred["move_stack"];
	let node_stack = cy.app_data.preferred["node_stack"];

	// An IN move is valid when:
	//	- No previous moves have been played.
	//	- Attacks the directly preceding OUT move.
	if (the_move === MOVES["IN"]) {
		if (move_stack.length === 0) {
			return true;
		} else {
			let last_out_node = getMoveNodes(MOVES["OUT"], node_stack).last();
			return cyto_helpers.attacks(node, last_out_node);
		}

	// An OUT move is valid when:
	//	- Attacks any preceding IN move.
	} else if (the_move === MOVES["OUT"]) {
		let in_nodes = getMoveNodes(MOVES["IN"], node_stack);

		let attack_found = false;
		in_nodes.forEach((in_arg) => {
			if (cyto_helpers.attacks(node, in_arg)) {
				attack_found = true;
				return false;  // Return 'false' to exit iteration early.
			}
		});
		return attack_found
	}

	return false;
}

// Return true if 'Socrates' is expected to play the next move.
// This is the case when:
//	- The directly preceding move was 'IN'.
function isSocratesTurn(move_stack) {
	let last_move = move_stack.slice(-1)[0];
	return last_move === MOVES["IN"];
}

module.exports = {
	"MOVES": MOVES,
	"MOVE_CLASSES": MOVE_CLASSES,
	"ROUND_STATES": ROUND_STATES,
	"TERMINATE_STATES": TERMINATE_STATES,
	"getMoveClass": getMoveClass,
	"getRoundState": getRoundState,
	"isValidMove": isValidMove,
	"isSocratesTurn": isSocratesTurn
}