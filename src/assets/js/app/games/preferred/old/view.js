let cyto_helpers = require("../../util/cytoscape-helpers.js");
let discuss = require("../discuss/main.js");
let rules = require("./rules.js");
let ifShowHide = require("../../util/ifshowhide.js");

let MOVES = rules.MOVES;
let ROUND_STATES = rules.ROUND_STATES;

let MOVE_STRINGS = {};
MOVE_STRINGS[MOVES["IN"]] = "in";
MOVE_STRINGS[MOVES["OUT"]] = "out";

function updateDom(cy) {
	ifShowHide("data-preferred", "ifplaying", cy.app_data.preferred["state"] !== ROUND_STATES["UNKNOWN"]);

	ifShowHide("data-preferred", "ifmoves<1", cy.app_data.preferred["move_stack"].length < 1);
	ifShowHide("data-preferred", "ifmoves==1", cy.app_data.preferred["move_stack"].length === 1);
	ifShowHide("data-preferred", "ifmoves>1", cy.app_data.preferred["move_stack"].length > 1);

	let is_socrates = $("[data-preferred='socrates']").hasClass("m-button--switch__li--active");

	ifShowHide("data-preferred", "ifsocrates", is_socrates);
	ifShowHide("data-preferred", "ifaiturn",
		cy.app_data.preferred["move_stack"].length >= 1 &&
		(is_socrates !== rules.isSocratesTurn(cy.app_data.preferred["move_stack"])) &&
		cy.app_data.preferred["state"] === ROUND_STATES["PLAYING"]
	);
}

function buildLogMoveMessage(the_move, node, is_socrates) {
	return (is_socrates ? "S) " : "M) ") +
		("<em>" + MOVE_STRINGS[the_move] + "</em>(") +
		("<em>" + node.id() + "</em>)");
}

function parseMoveString(cy, str) {
	str = str.replace("(", " ");
	str = str.replace(")", "");

	let tokens = str.split(" ");
	let move = MOVES[tokens.splice(0, 1)[0].toUpperCase()];
	let node_id = tokens.join(" ");
	let node = cy.nodes().filter((i, ele) => ele.id() === node_id).first();
	return [move, node];
}

// Called once a move has been completed.
function PostMove(moveObject) {
	// A shamefully 'hacky' way to prevent our alert prompts from blocking
	// Cytoscape's rendering engine from processing the next frame.
	// When this frame isn't yet processed, it may not be updated with our most
	// recent modification to our graph, e.g. node classes.
	window.setTimeout(() => {
		if (moveObject["node"] !== undefined) {
			let cy = cyto_helpers.getCy(moveObject["node"]);

			updateDom(cy);

			if (moveObject["valid"]) {
				let log_str = buildLogMoveMessage(moveObject["move"], moveObject["node"], moveObject["is_socrates"]);
				$("[data-preferred-movelist]").append("<li>" + log_str + "</li>");

				if (cy.app_data.preferred["state"] === ROUND_STATES["TERMINATE"]) {
					let end_msg = "The game has terminated for some unknown reason.";
					switch (cy.app_data.preferred["terminate_state"]) {
						case TERMINATE_STATES["SM_REPEAT"]:
							end_msg = "Socrates has won by pointing out a contradiction in Menexenus' position!";
							break;
						case TERMINATE_STATES["MS_REPEAT"]:
							end_msg = "Socrates has won as Menexenus has contradicted himself!";
							break;
						case TERMINATE_STATES["M_NOMOVE"]:
							end_msg = "Socrates has won as Menexenus was unable to answer Socrates' question!";
							break;
						case TERMINATE_STATES["S_NOMOVE"]:
							end_msg = "Menexenus has won as Socrates has no more remaining questions to ask!";
							break;
					}

					$("[data-grounded-movelist]").append("<li>" + end_msg + "</li>");
					alert(end_msg);
				}
			} else {
				if (cy.app_data.preferred["state"] === ROUND_STATES["PLAYING"]) {
					alert("That is an invalid move!");
				} else {
					alert("The game has already ended!");
				}
			}
		}
	}, 50);
}

function startGame(cy, startGameCallback) {
	startGameCallback(cy);

	// Disable the graph manipulation delete mode.
	let delete_button = $("[data-switch-graph-delete]");
	if (delete_button.hasClass("m-button--switch__li--active")) {
		delete_button.closest(".m-button--switch").click();
	}

	updateDom(cy);
}

function endGame(cy) {

	if (!$("[data-preferred='start']").hasClass("m-button--switch__li--active")) {
		$("[data-preferred='start']").closest(".m-button--switch").click();
	}

	updateDom(cy);
}

function parseCytoscapeInstance(cy, preferred_exports) {
	updateDom(cy); // Initial update

	cy.on("add remove", (evt) => {
		if (evt.cy.app_data.preferred["state"] !== ROUND_STATES["UNKNOWN"]) {
			endGame(evt.cy);
		} else {
			updateDom(evt.cy);
		}
	});

	cy.on("tap", "node", (evt) => {
		if (evt.cy.app_data.preferred["state"] !== ROUND_STATES["UNKNOWN"]) {
			let is_socrates = $("[data-preferred='socrates']").hasClass("m-button--switch__li--active");
			let moveObject = preferred_exports.autoMove(evt.cyTarget, is_socrates);
			PostMove(moveObject);
		}
	});

	$("[data-preferred-moveinput]").keyup((evt) => {
		if (evt.keyCode === 13){
			let [move, node] = parseMoveString(cy, $(evt.currentTarget).val());
			let is_socrates = $("[data-preferred='socrates']").hasClass("m-button--switch__li--active");
			let moveObject = preferred_exports.move(move, node, is_socrates);
			PostMove(moveObject);

			$(evt.currentTarget).val("");  // Clear the 'moveinput' box.
		}
	});

	$("[data-preferred='start']").on("m-button-switched", (evt, is_on) => {
		is_on ? endGame(cy) : startGame(cy, preferred_exports.startGameCallback);
	});

	$("[data-preferred-moveai]").click(function() {
		let is_socrates = $("[data-preferred='socrates']").hasClass("m-button--switch__li--active");
		let moveObject = preferred_exports.strategyMove(cy.app_data.preferred["node_stack"], !is_socrates);
		PostMove(moveObject);
	});

	$("[data-preferred-undo]").click(() => {
		if (cy.app_data.preferred["state"] !== ROUND_STATES["PLAYING"]) {
			$("[data-preferred-movelist] > li:last").remove();
		}

		let moveObject = preferred_exports.undoLastMove(cy.app_data.preferred["node_stack"]);
		$("[data-preferred-movelist] > li:last").remove();
		updateDom(cy);
	});

	$("[data-preferred='socrates']").on("m-button-switched", (evt, is_on) => updateDom(cy));

	$("[data-switch-graph-delete]").on("m-button-switched", (evt, is_on) => {
		if (is_on) {
			endGame(cy)
		};
	});

	return cy;
}

module.exports = {
	"parseCytoscapeInstance": parseCytoscapeInstance
}