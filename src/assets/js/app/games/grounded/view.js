let cyto_helpers = require("../../util/cytoscape-helpers.js");
let ifShowHide = require("../../util/ifshowhide.js");

//let discuss = require("../discuss/main.js");
let grounded_game = require("./game.js");
let getStrategicMove = require("./strategy.js");

// Save some screen real-estate
let MOVES = grounded_game.MOVES;
let TERMINATE_STATES = grounded_game.TERMINATE_STATES;

// Convert our move ENUMS back into a string to be displayed.
let MOVE_STRINGS = {};
MOVE_STRINGS[MOVES["HTB"]] = "HTB";
MOVE_STRINGS[MOVES["CB"]] = "CB";
MOVE_STRINGS[MOVES["CONCEDE"]] = "CONCEDE";
MOVE_STRINGS[MOVES["RETRACT"]] = "RETRACT";

// Classes to provide visual feedback regarding an argument's move.
let MOVE_CLASSES = {};
MOVE_CLASSES[MOVES["HTB"]] = "htb";
MOVE_CLASSES[MOVES["CB"]] = "cb";
MOVE_CLASSES[MOVES["CONCEDE"]] = "concede";
MOVE_CLASSES[MOVES["RETRACT"]] = "retract";


// Called when something changes, so we can update the DOM appropriately.
function updateDom(game) {
	let game_alive = game !== undefined && !game.dying;

	ifShowHide("data-grounded", "ifplaying",
		game_alive
	);

	ifShowHide("data-grounded", "ifmoves<1",
		game_alive &&
		game.move_count < 1
	);
	ifShowHide("data-grounded", "ifmoves==1",
		game_alive &&
		game.move_count === 1
	);
	ifShowHide("data-grounded", "ifmoves>1",
		game_alive &&
		game.move_count > 1
	);

	ifShowHide("data-grounded", "ifproponent",
		game_alive &&
		is_proponent()
	);

	ifShowHide("data-grounded", "ifaiturn",
		game_alive &&
		is_proponent() !== game.isProponentsTurn() &&
		!game.hasTerminated()
	);
};

// Build a string to be logged given information of a recently made move.
function getLogMoveMessage(arg, the_move, is_proponent) {
	return (is_proponent ? "P) " : "O)") +
		("<em>" + MOVE_STRINGS[the_move] + "</em>(") +
		("<em>" + arg.id() + "</em>)");
};

// Return true if the player has chosen to play as the Proponent. Otherwise,
// return false.
function is_proponent() {
	return $("[data-grounded='proponent']")
		.hasClass("m-button--switch__li--active");
};

// Called once a new instance of the grounded discussion game has been started.
function parseGameInstance(game) {
	game.on("move undo delete", () => updateDom(game));

	game.on("move", (arg, the_move) => {
		if (the_move === MOVES["CONCEDE"]) {
			arg.removeClass(MOVE_CLASSES[MOVES["HTB"]]);
		} else if (the_move === MOVES["RETRACT"]) {
			arg.removeClass(MOVE_CLASSES[MOVES["CB"]]);
		}

		arg.addClass(MOVE_CLASSES[the_move]);

		let was_proponent = the_move === MOVES["HTB"];
		let log_str = getLogMoveMessage(arg, the_move, was_proponent);
		let log_html = "<li>" + log_str + "</li>";

		if (game.hasTerminated()) {
			let end_msg = "The game has terminated for some unknown reason.";
			switch (game.terminate_state) {
				case TERMINATE_STATES["INITIAL_CONCEDED"]:
					end_msg = "The Proponent has won as their initial argument has" +
						" been conceded!";
					break;
				case TERMINATE_STATES["HTB/CB_REPEAT"]:
					end_msg = "The OPPONENT has won as a HTB/CB repeat has occurred!";
					break;
				case TERMINATE_STATES["CB_EMPTY_ATTACKERS"]:
					end_msg = "The OPPONENT has won as their last CB argument has no" +
						" valid attackers!";
					break;
			};

			log_html += "<li data-grounded-deleteonundo>" + end_msg + "</li>";

			// SHAME: an awful 'hacky' way to prevent our alert prompts blocking
			// Cytoscape rendering the next frame. Doing this gives Cytoscape time to
			// apply the CSS classes for the played move.
			window.setTimeout(() => {
				alert(end_msg);
			}, 50);
		};

		$("[data-grounded-movelist]").append(log_html);
	});

	game.on("invalidmove", (arg, the_move) => {
		if (game.hasTerminated()) {
			alert("The game has already ended!");
		} else {
			alert("That is an invalid move!");
		};
	});

	game.on("undo", (undo_arg, undo_move) => {
		$("[data-grounded-deleteonundo]").remove();
		$("[data-grounded-movelist] > li:last").remove();

		if(undo_move === MOVES["CONCEDE"]) {
			undo_arg.addClass(MOVE_CLASSES[MOVES["HTB"]]);
		} else if(undo_move === MOVES["RETRACT"]) {
			undo_arg.addClass(MOVE_CLASSES[MOVES["CB"]]);
		}
		if (!game.hasPlayed(undo_arg, undo_move)) {
			undo_arg.removeClass(MOVE_CLASSES[undo_move]);
		}
	});

	game.on("delete", () => {
		if (!$("[data-grounded='start']")
			.hasClass("m-button--switch__li--active")) {
			$("[data-grounded='start']").closest(".m-button--switch").click();
		};

		$("[data-grounded-movelist]").empty();

		let arg = game.first()["arg"];
		if (arg !== undefined) {
			let cy = arg.cy();
			let class_str = Object.keys(MOVE_CLASSES)
				.reduce((s, key) => (s === "" ? s : s + " ") + MOVE_CLASSES[key], "");
			cy.nodes().removeClass(class_str);
		}
	});
};

function parseCytoscapeInstance(cy) {
	let game;

	updateDom(game); // Initial update

	// Updates to the graph will probably corrupt our game.
	cy.on("add remove", (evt) => {
		if (game === undefined) { return };

		if (game.hasTerminated()) {
			updateDom(game);
		} else {
			game.delete();
			game = undefined;
		};
	});

	// It is often convenient for the user to be able to play an argument simply
	// by clicking on the node for the argument they wish to play. If it isn't the
	// user's turn, we just take the AI's strategic turn.
	cy.on("tap", "node", (evt) => {
		if (game === undefined || game.hasTerminated()) { return };

		let arg, the_move;
		if (game.move_count === 0 || game.isProponentsTurn() === is_proponent()) {
			arg = evt.cyTarget;
			if (game.move_count === 0 || is_proponent()) {
				the_move = MOVES["HTB"];
			} else {
				if (game.hasPlayed(arg, MOVES["HTB"])) {
					the_move = MOVES["CONCEDE"];
				} else if (game.hasPlayed(arg, MOVES["CB"]) &&
					game.isValidMove(arg, MOVES["RETRACT"])) {  // For CB-REPEAT
					the_move = MOVES["RETRACT"];
				} else {
					the_move = MOVES["CB"];
				}
			}
		} else {
			let move_obj = getStrategicMove(game, !is_proponent());
			arg = move_obj["arg"];
			the_move = move_obj["move"];
		}

		game.move(arg, the_move);
	});

	// Allow the user to enter moves via a text input box. Their input is
	// processed once they hit enter (key code: 13). We also convert a string
	// move-command into a move ENUM and an argument.
	$("[data-grounded-moveinput]").keyup((evt) => {
		if (game === undefined) { return };

		if (evt.keyCode === 13) {
			let str = $(evt.currentTarget).val();

			// Replace unnecessary parentheses.
			str = str.replace("(", " ");
			str = str.replace(")", "");

			let tokens = str.split(" ");
			let move = MOVES[tokens.splice(0, 1)[0].toUpperCase()];
			let arg_id = tokens.join(" ");
			let arg = cy.nodes().filter((i, arg) => arg.id() === arg_id).first();

			game.move(arg, move);

			$(evt.currentTarget).val("");
		}
	});

	$("[data-grounded='start']").on("m-button-switched", (evt, is_on) => {
		if (is_on) {
			game.delete();
			game = undefined;
		} else {
			$("[data-grounded-movelist]").empty();

			// Disable delete mode
			let delete_button = $("[data-switch-graph-delete]");
			if (delete_button.hasClass("m-button--switch__li--active")) {
				delete_button.closest(".m-button--switch").click();
			}

			game = new grounded_game.Game(function(args) {
				return cy.collection(args);
			});

			parseGameInstance(game);
		};

		updateDom(game);
	});

	$("[data-grounded-moveai]").click(() => {
		if (game === undefined) { return };
		let move_obj = getStrategicMove(game, !is_proponent());
		game.move(move_obj["arg"], move_obj["move"]);
	});

	$("[data-grounded-undo]").click(() => {
		if (game === undefined) { return };
		game.undoLastMove();
	});

	$("[data-grounded='proponent']").on("m-button-switched", (evt, is_on) => {
		updateDom(game);
	});

	$("[data-switch-graph-delete]").on("m-button-switched", (evt, is_on) => {
		if (game === undefined) { return };

		if (is_on) {
			game.delete();
			game = undefined;
		};
	});

	return cy;
}

module.exports = {
	"parseCytoscapeInstance": parseCytoscapeInstance
}