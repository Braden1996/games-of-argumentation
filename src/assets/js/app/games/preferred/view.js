let cyto_helpers = require("../../util/cytoscape-helpers.js");
let discuss = require("../discuss/main.js");
let rules = require("./rules.js");
let ifShowHide = require("../../util/ifshowhide.js");

let MOVES = rules.MOVES;
let ROUND_STATES = rules.ROUND_STATES;

let MOVE_STRINGS = {};
MOVE_STRINGS[MOVES["TEST"]] = "TEST";

function updateDom(cy) {
	ifShowHide("data-preferred", "ifplaying", cy.app_data.preferred["state"] !== ROUND_STATES["UNKNOWN"]);

	ifShowHide("data-preferred", "ifmoves<1", cy.app_data.preferred["move_stack"].length < 1);
	ifShowHide("data-preferred", "ifmoves==1", cy.app_data.preferred["move_stack"].length === 1);
	ifShowHide("data-preferred", "ifmoves>1", cy.app_data.preferred["move_stack"].length > 1);

	let is_socrates = $("[data-preferred='socrates']").hasClass("m-button--switch__li--active");

	ifShowHide("data-preferred", "ifsocrates", is_socrates);
	ifShowHide("data-preferred", "ifaiturn",
		cy.app_data.preferred["move_stack"].length >= 1 &&
		cy.app_data.preferred["state"] === ROUND_STATES["PLAYING"]
	);
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

function PostMove(moveObject) {
	console.log("Post Move:", moveObject);
}

function startGame(cy, startGameCallback) {
	startGameCallback(cy);

	// Disable delete mode
	let delete_button = $("[data-switch-graph-delete]");
	if (delete_button.hasClass("m-button--switch__li--active")) {
		delete_button.closest(".m-button--switch").click();
	}

	updateDom(cy);
}

function endGame(cy, endGameCallback) {
	endGameCallback(cy);

	if (!$("[data-preferred='start']").hasClass("m-button--switch__li--active")) {
		$("[data-preferred='start']").closest(".m-button--switch").click();
	}

	updateDom(cy);
}

function parseCytoscapeInstance(cy, preferred_exports) {
	updateDom(cy); // Inital update

	let graphUpdated = function(evt) {
		if (evt.cy.app_data.preferred["state"] !== ROUND_STATES["UNKNOWN"]) {
			endGame(evt.cy, preferred_exports.endGameCallback);
		} else {
			updateDom(evt.cy);
		}
	}

	cy.on("remove", graphUpdated);
	cy.on("add", graphUpdated);

	cy.on("tap", "node", (evt) => {
		if (evt.cy.app_data.preferred["state"] !== ROUND_STATES["UNKNOWN"]) {
			console.log("Node", evt.cyTarget.id(), "has been clicked!");
		}
	});

	$("[data-preferred-moveinput]").keyup(function(e) {
		if (e.keyCode === 13){
			let [move, node] = parseMoveString(cy, $(this).val());
			let is_socrates = $("[data-preferred='socrates']").hasClass("m-button--switch__li--active");
			let moveObject = preferred_exports.move(move, node, is_socrates);
			PostMove(moveObject);

			$(this).val("");
		}
	});

	$("[data-preferred='start']").on("m-button-switched", (evt, is_on) => {
		if (is_on) {
			endGame(cy, preferred_exports.endGameCallback);
		} else {
			startGame(cy, preferred_exports.startGameCallback);
		}
	});

	$("[data-grounded-undo]").click(function() {
		console.log("Undo move!");
	});

	$("[data-switch-graph-delete]").on("m-button-switched", (evt, is_on) => {
		if (is_on) {
			endGame(cy, preferred_exports.endGameCallback);
		}
	});

	return cy;
}

module.exports = {
	"parseCytoscapeInstance": parseCytoscapeInstance
}