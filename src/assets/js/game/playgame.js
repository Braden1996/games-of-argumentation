let cyto_helpers = require("./cytoscape-helpers.js");
let rules = require("./logic/rules.js");
let playgame_site = require("./site/playgame.js");

// Save a little bit of screenspace...
let MOVES = rules.MOVES;
let getMoveClass = rules.getMoveClass;
let ROUND_STATES = rules.ROUND_STATES;

// We need our own 'min' function as Cytoscape JS internally uses 'Infinity',
// which doesn't work as our 'undec' nodes have a 'min_max_numbering' of 'Infinity'.
function getMinNode(nodes) {
	if (nodes.length === 0) {
		return undefined;
	} else {
		let last_node = nodes[0];
		for(let i = 1; i < nodes.length; i++ ){
			var node = nodes[i];
			if (node.data("min_max_numbering") < last_node.data("min_max_numbering")) {
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
				node = getMinNode(htb_nodes);
			}
		} else {
			let last_node = node_stack.slice(-1)[0];

			// As we can only perform a CB move if no CONCEDE, or RETRACT,
			// move is possible; we check it last.
			let concede_nodes = rules.findMoveNodes(MOVES["CONCEDE"], node_stack);
			if (concede_nodes.nonempty()) {
				the_move = MOVES["CONCEDE"];
				node = getMinNode(concede_nodes);
			} else {
				let retract_nodes = rules.findMoveNodes(MOVES["RETRACT"], node_stack);
				if (retract_nodes.nonempty()) {
					the_move = MOVES["RETRACT"];
					node = getMinNode(retract_nodes);
				} else {
					let cb_nodes = rules.findMoveNodes(MOVES["CB"], node_stack);
					if (cb_nodes.nonempty()) {
						the_move = MOVES["CB"];
						node = getMinNode(cb_nodes);
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
function specifcMove(the_move, node, is_proponent) {
	let move_valid = move(the_move, node);
	return {"move": the_move, "node": node, "valid": move_valid, "is_proponent": is_proponent};
}

function autoMove(node, is_proponent) {
	let cy =  cyto_helpers.get_cy(node);
	let node_stack = cy.game_play_node_stack;

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
	let cy =  cyto_helpers.get_cy(node);
	let node_stack = cy.game_play_node_stack;
	let move_stack = cy.game_play_move_stack;

	if(the_move === MOVES["HTB"]) {
		node.addClass(getMoveClass("HTB"));

	} else if(the_move === MOVES["CB"]) {
		node.addClass(getMoveClass("CB"));

	} else if(the_move === MOVES["CONCEDE"]) {
		node.removeClass(getMoveClass("HTB"));
		node.addClass(getMoveClass("CONCEDE"));

	} else if(the_move === MOVES["RETRACT"]) {
		node.removeClass(getMoveClass("CB"));
		node.addClass(getMoveClass("RETRACT"));
	}

	move_stack.push(the_move);
	node_stack.push(node);
	cy.game_play_move_stack = move_stack;
	cy.game_play_node_stack = node_stack;
}

// Check if the given move is valid. If so, perform the move
// and update the round state.
function move(the_move, node) {
	if (rules.isValidMove(the_move, node)) {
		let cy = cyto_helpers.get_cy(node);
		if (cy.game_play_state === ROUND_STATES["PLAYING"]) {
			makeMove(the_move, node);

			let node_stack = cy.game_play_node_stack;
			cy.game_play_state = rules.getRoundState(node_stack);

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
	cy.game_play_playing = true;

	cy.game_play_move_stack = [];
	cy.game_play_node_stack = [];

	cy.game_play_state = ROUND_STATES["PLAYING"];  // Current round state
}

// Reset the game's start variables.
function endGame(cy) {
	cy.game_play_playing = false;

	cy.game_play_state = -1;

	Object.keys(rules.MOVE_CLASSES).forEach((key) => {
		cy.nodes().removeClass(rules.MOVE_CLASSES[key]);
	});
}

function parse_cytoscape_instance(cy) {
	startGame(cy);
	endGame(cy);

	let playgame_exports = {
		"move": specifcMove,
		"autoMove": autoMove,
		"strategyMove": strategyMove,
		"startGameCallback": startGame,
		"endGameCallback": endGame
	}

	cy = playgame_site.parse_cytoscape_instance(cy, playgame_exports);

	return cy;
}

module.exports = {
	"parse_cytoscape_instance": parse_cytoscape_instance
}