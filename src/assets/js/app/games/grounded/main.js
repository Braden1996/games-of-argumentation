let cyto_helpers = require("../../util/cytoscape-helpers.js");
let rules = require("./rules.js");
let view = require("./view.js");

// Save a little bit of screenspace...
let MOVES = rules.MOVES;
let getMoveClass = rules.getMoveClass;
let ROUND_STATES = rules.ROUND_STATES;

// We need our own min/max function as Cytoscape JS internally uses 'Infinity',
// which conflicts with our 'undec' nodes - as their 'min_max_numbering' is 'Infinity'.
function getMinMaxNode(nodes, max=false) {
	if (nodes.empty()) {
		return undefined;
	} else {
		let last_node = nodes[0];
		for (let i = 1; i < nodes.size(); i++ ) {
			var node = nodes[i];
			if ((max && node.data("min_max_numbering") > last_node.data("min_max_numbering")) ||
				(!max && node.data("min_max_numbering") < last_node.data("min_max_numbering"))) {
				last_node = node;
			}
		}
		return last_node
	}
}

// Use the min-max numbering to intelligently determine the next move.
function strategyMove(node_stack, is_proponent) {
	if (node_stack.length > 0) {
		let the_move = undefined;
		let node = undefined;

		if (is_proponent) {
			let htb_nodes = rules.findMoveNodes(MOVES["HTB"], node_stack);
			if (htb_nodes.nonempty()) {
				the_move = MOVES["HTB"];
				node = getMinMaxNode(htb_nodes);
			}
		} else {
			let last_node = node_stack.slice(-1)[0];

			// As we can only perform a CB move if no CONCEDE, or RETRACT,
			// move is possible; we check it last.
			let concede_nodes = rules.findMoveNodes(MOVES["CONCEDE"], node_stack);
			if (concede_nodes.nonempty()) {
				the_move = MOVES["CONCEDE"];
				node = getMinMaxNode(concede_nodes, true);
			} else {
				let retract_nodes = rules.findMoveNodes(MOVES["RETRACT"], node_stack);
				if (retract_nodes.nonempty()) {
					the_move = MOVES["RETRACT"];
					node = getMinMaxNode(retract_nodes, true);
				} else {
					let cb_nodes = rules.findMoveNodes(MOVES["CB"], node_stack);
					if (cb_nodes.nonempty()) {
						the_move = MOVES["CB"];

						node = getMinMaxNode(cb_nodes, true);

						// Check if any other possible move would end the game.
						for (let i = 1; i < cb_nodes.size(); i++ ) {
							var maybe_cb = cb_nodes[i];
							let attackers = maybe_cb.incomers().sources();
							let valid_attackers = attackers.filter((i, attacker) => rules.isValidMove(MOVES["HTB"], attacker));
							if (valid_attackers.empty()) {
								node = maybe_cb;
								break;
							}
						}
					}
				}
			}
		}

		let move_valid = move(the_move, node);
		return {"move": the_move, "node": node, "valid": move_valid, "is_proponent": is_proponent};
	}

	return undefined;
}

// Determine the move to make, given a particular node and a
// boolean indicating if the proposer of the move is the
// proponent.
function easyMove(node, is_proponent) {
	let the_move = undefined;
	if (is_proponent) {
		the_move = MOVES["HTB"];
	} else {
		if (rules.hasPlayed(node, MOVES["HTB"])) {
			the_move = MOVES["CONCEDE"];
		} else if (rules.hasPlayed(node, MOVES["CB"])) {
			the_move = MOVES["RETRACT"];
		} else if (!(rules.hasPlayed(node, MOVES["CONCEDE"]) || rules.hasPlayed(node, MOVES["RETRACT"]))) {
			the_move = MOVES["CB"];
		}
	}

	let move_valid = move(the_move, node);
	return {"move": the_move, "node": node, "valid": move_valid, "is_proponent": is_proponent};
}

// Attempt to make the given move on the given node.
function specificMove(the_move, node, is_proponent) {
	let move_valid = move(the_move, node);
	return {"move": the_move, "node": node, "valid": move_valid, "is_proponent": is_proponent};
}

function autoMove(node, is_proponent) {
	let cy = cyto_helpers.getCy(node);
	let node_stack = cy.app_data.grounded["node_stack"];

	// Check if new game.
	if (node_stack.length === 0) {
		return easyMove(node, true);
	} else {
		if (rules.isProponentsTurn(node_stack) === is_proponent) {
			return easyMove(node, is_proponent);
		} else {
			return strategyMove(node_stack, !is_proponent);
		}
	}
}

// Perform the given move on the given node.
// This function does not check if the move is valid.
function makeMove(the_move, node) {
	let cy = cyto_helpers.getCy(node);
	let move_stack = cy.app_data.grounded["move_stack"];
	let node_stack = cy.app_data.grounded["node_stack"];

	move_stack.push(the_move);
	node_stack.push(node);
	cy.app_data.grounded["move_stack"] = move_stack;
	cy.app_data.grounded["node_stack"] = node_stack;

	if(the_move === MOVES["CONCEDE"]) {
		node.removeClass(getMoveClass("HTB"));
	} else if(the_move === MOVES["RETRACT"]) {
		node.removeClass(getMoveClass("CB"));
	}

	node.addClass(rules.MOVE_CLASSES[the_move]);
}

function undoLastMove(node_stack) {
	let cy = cyto_helpers.getCy(node_stack);
	let move_stack = cy.app_data.grounded["move_stack"];

	// As all other states are terminating states, 'PLAYING' will
	// ALWAYS be the previous state.
	if (cy.app_data.grounded["state"] !== ROUND_STATES["PLAYING"]) {
		cy.app_data.grounded["state"] = ROUND_STATES["PLAYING"];
	}

	let last_move = move_stack.pop();
	let last_node = node_stack.pop();
	cy.app_data.grounded["move_stack"] = move_stack;
	cy.app_data.grounded["node_stack"] = node_stack;

	if(last_move === MOVES["CONCEDE"]) {
		last_node.addClass(getMoveClass("HTB"));

	} else if(last_move === MOVES["RETRACT"]) {
		last_node.addClass(getMoveClass("CB"));
	}

	if (!rules.hasPlayed(last_node, last_move)) {
		last_node.removeClass(rules.MOVE_CLASSES[last_move]);
	}
}

// Check if the given move is valid. If so, perform the move
// and update the round state.
function move(the_move, node) {
	if (rules.isValidMove(the_move, node)) {
		let cy = cyto_helpers.getCy(node);
		if (cy.app_data.grounded["state"] === ROUND_STATES["PLAYING"]) {
			makeMove(the_move, node);

			let node_stack = cy.app_data.grounded["node_stack"];
			cy.app_data.grounded["state"] = rules.getRoundState(node_stack);

			return true;
		} else {
			return false;
		}
	} else {
		return false;
	}
}

// Initiate the game's start variables.
function startGame(cy) {
	cy.app_data.grounded["move_stack"] = [];
	cy.app_data.grounded["node_stack"] = [];

	cy.app_data.grounded["state"] = ROUND_STATES["PLAYING"];
}

// Reset the game's start variables.
function endGame(cy) {
	cy.app_data.grounded["state"] = ROUND_STATES["UNKNOWN"];

	Object.keys(rules.MOVE_CLASSES).forEach((key) => cy.nodes().removeClass(rules.MOVE_CLASSES[key]));
}

function parseCytoscapeInstance(cy) {
	cy.app_data.grounded = {};

	// To prevent other 'modules' from having to 'require("./rules.js")'.
	cy.app_data.grounded["UNKNOWN_STATE"] = ROUND_STATES["UNKNOWN"];

	startGame(cy);
	endGame(cy);

	let playgame_exports = {
		"move": specificMove,
		"autoMove": autoMove,
		"strategyMove": strategyMove,
		"undoLastMove": undoLastMove,
		"startGameCallback": startGame,
		"endGameCallback": endGame
	}

	cy = view.parseCytoscapeInstance(cy, playgame_exports);

	return cy;
}

module.exports = {
	"parseCytoscapeInstance": parseCytoscapeInstance
}