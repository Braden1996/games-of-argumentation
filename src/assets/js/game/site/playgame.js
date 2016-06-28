let cyto_helpers = require("../cytoscape-helpers.js");
let discuss = require("../logic/discuss.js");
let rules = require("../logic/rules.js");
let ifShowHide = require("../util/ifshowhide.js");

// Save a little bit of screenspace...
let MOVES = rules.MOVES;
let getMoveClass = rules.getMoveClass;
let ROUND_STATES = rules.ROUND_STATES;

let MOVE_STRINGS = {};
MOVE_STRINGS[MOVES["HTB"]]     = "HTB";
MOVE_STRINGS[MOVES["CB"]]      = "CB";
MOVE_STRINGS[MOVES["CONCEDE"]] = "CONCEDE";
MOVE_STRINGS[MOVES["RETRACT"]] = "RETRACT";

function updateDom(cy) {
	ifShowHide("data-playgame", "ifcanplay", cy.game_play_possible);
	ifShowHide("data-playgame", "ifplaying", cy.game_play_possible && cy.game_play_playing);
	ifShowHide("data-playgame", "ifpreparing", cy.game_play_possible && cy.game_play_playing && cy.game_play_preparing);
}

function buildLogMoveMessage(the_move, node, is_proponent) {
	return (is_proponent ? "P) " : "O)") +
		("<em>" + MOVE_STRINGS[the_move] + "</em> ") +
		("<em>" + node.id() + "</em> ");
}

function parseMoveString(cy, str) {
	let tokens = str.split(" ");
	let move = MOVES[tokens.splice(0, 1)[0].toUpperCase()];
	let node_id = tokens.join(" ");
	let node = cy.nodes().filter((i, ele) => ele.id() === node_id).first();
	return [move, node];
}

function startGame(cy, startGameCallback) {
	startGameCallback(cy);

	$("[data-playgame-movelist]").empty();
	discuss.clear_discuss(cy);
	updateDom(cy);
}

function endGame(cy, endGameCallback) {
	endGameCallback(cy);

	if (!$("[data-playgame='start']").hasClass("m-button--switch__li--active")) {
		$("[data-playgame='start']").closest(".m-button--switch").click();
	}

	$("[data-playgame-movelist]").empty();
	updateDom(cy);
}

function PostMove(moveObject) {
	if (moveObject["node"] !== undefined) {
		let cy = cyto_helpers.get_cy(moveObject["node"]);

		if (cy.game_play_preparing) {
			cy.game_play_preparing = false;
			updateDom(cy);
		}

		if (moveObject["valid"]) {
			let log_str = buildLogMoveMessage(moveObject["move"], moveObject["node"], moveObject["is_proponent"]);
			$("[data-playgame-movelist]").append("<li>" + log_str + "</li>");

			if (cy.game_play_state === ROUND_STATES["PROPONENT_WIN"]) {
				alert("The Proponent has won the game!");
			} else if (cy.game_play_state === ROUND_STATES["OPPONENT_WIN"]) {
				alert("The Opponent has won the game!");
			}
		} else {
			alert("That is an invalid move!");
		}
	}
}

function parse_cytoscape_instance(cy, playgame_exports) {
	cy.game_play_possible = false;

	updateDom(cy); // Inital update

	cy.on("graphSet", (evt) => {
		cy.game_play_possible = true;

		if (cy.game_play_playing) {
			endGame(cy, playgame_exports.endGameCallback);
		} else {
			updateDom(cy);
		}
	});

	cy.on("tap", "node", (evt) => {
		if (evt.cy.game_play_playing) {
			let is_proponent = $("[data-playgame='proponent']").hasClass("m-button--switch__li--active");
			let moveObject = playgame_exports.autoMove(evt.cyTarget, is_proponent);
			PostMove(moveObject);
		}
	});

	$("[data-playgame-moveinput]").keyup(function(e) {
		if (e.keyCode === 13){
			let [move, node] = parseMoveString(cy, $(this).val());
			let is_proponent = $("[data-playgame='proponent']").hasClass("m-button--switch__li--active");
			let moveObject = playgame_exports.move(move, node, is_proponent);
			PostMove(moveObject);
		}
	});

	$("[data-playgame='start']").on("m-button-switched", (evt, is_on) => {
		if (is_on) {
			endGame(cy, playgame_exports.endGameCallback);
		} else {
			startGame(cy, playgame_exports.startGameCallback);
		}
	});

	$("[data-playgame-moveai]").click(function() {
		let is_proponent = $("[data-playgame='proponent']").hasClass("m-button--switch__li--active");
		let moveObject = playgame_exports.strategyMove(cy.game_play_node_stack, !is_proponent);
		PostMove(moveObject);
	});

	return cy;
}

module.exports = {
	"parse_cytoscape_instance": parse_cytoscape_instance
}