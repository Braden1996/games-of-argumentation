let cyto_helpers = require("../../util/cytoscape-helpers.js");
let ifShowHide = require("../../util/ifshowhide.js");

let preferred_game = require("./game.js");
let getStrategicMove = require("./strategy.js");

// Save some screen real-estate
let MOVES = preferred_game.MOVES;
let TERMINATE_STATES = preferred_game.TERMINATE_STATES;

// Convert our move ENUMS back into a string to be displayed.
let MOVE_STRINGS = {};
MOVE_STRINGS[MOVES["IN"]] = "IN";
MOVE_STRINGS[MOVES["OUT"]] = "OUT";

// Classes to provide visual feedback regarding an argument's move.
let MOVE_CLASSES = {};
MOVE_CLASSES[MOVES["IN"]] = "preferred-in";
MOVE_CLASSES[MOVES["OUT"]] = "preferred-out";


// Called when something changes, so we can update the DOM appropriately.
function updateDom(game) {
	let game_alive = game !== undefined && !game.dying;

	ifShowHide("preferred_playing", game_alive);
	ifShowHide("preferred_moves", game_alive ? game.move_count: undefined);
	ifShowHide("preferred_socrates", game_alive && is_socrates());
	ifShowHide("preferred_aiturn",
		game_alive &&
		is_socrates() !== game.isSocratesTurn() &&
		!game.hasTerminated()
	);
};

// Build a string to be logged given information of a recently made move.
function getLogMoveMessage(arg, the_move, is_socrates) {
	return (is_socrates ? "S) " : "M)") +
		("<em>" + MOVE_STRINGS[the_move] + "</em>(") +
		("<em>" + arg.id() + "</em>)");
};

// Return true if the player has chosen to play as the Socrates. Otherwise,
// return false.
function is_socrates() {
	return $("[data-preferred='socrates']")
		.hasClass("m-button--switch__li--active");
};

// Called once a new instance of the preferred discussion game has been started.
function parseGameInstance(game) {
	game.on("move undo delete", () => updateDom(game));

	game.on("move", (arg, the_move) => {
		arg.addClass(MOVE_CLASSES[the_move]);

		let was_scorates = the_move === MOVES["OUT"];
		let log_html = "<li>" + getLogMoveMessage(arg, the_move, was_scorates) + "</li>";

		if (game.hasTerminated()) {
			let end_msg = "The game has terminated for some unknown reason.";
			switch (game.terminate_state) {
				case TERMINATE_STATES["SM_REPEAT"]:
					end_msg = "Socrates has won by pointing out a contradiction in" +
						" Menexenus' position!";
					break;
				case TERMINATE_STATES["MS_REPEAT"]:
					end_msg = "Socrates has won as Menexenus has contradicted himself!";
					break;
				case TERMINATE_STATES["M_NOMOVE"]:
					end_msg = "Socrates has won as Menexenus was unable to answer" +
						" Socrates' question!";
					break;
				case TERMINATE_STATES["S_NOMOVE"]:
					end_msg = "Menexenus has won as Socrates has no more remaining" +
						" questions to ask!";
					break;
			};

			log_html += "<li data-preferred-deleteonundo>" + end_msg + "</li>";

			// SHAME: an awful 'hacky' way to prevent our alert prompts blocking
			// Cytoscape rendering the next frame. Doing this gives Cytoscape time to
			// apply the CSS classes for the played move.
			window.setTimeout(() => {
				alert(end_msg);
			}, 50);
		};

		$("[data-preferred-movelist]").append(log_html);
	});

	game.on("invalidmove", (arg, the_move) => {
		if (game.hasTerminated()) {
			alert("The game has already ended!");
		} else {
			alert("That is an invalid move!");
		};
	});

	game.on("undo", (undo_arg, undo_move) => {
		$("[data-preferred-deleteonundo]").remove();
		$("[data-preferred-movelist] > li:last").remove();

		if (!game.hasPlayed(undo_arg, undo_move)) {
			undo_arg.removeClass(MOVE_CLASSES[undo_move]);
		}
	});

	game.on("delete", () => {
		if (!$("[data-preferred='start']")
			.hasClass("m-button--switch__li--active")) {
			$("[data-preferred='start']").closest(".m-button--switch").click();
		};

		$("[data-preferred-movelist]").empty();

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
		if (game === undefined) {
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
		if (game.move_count === 0 || game.isSocratesTurn() === is_socrates()) {
			arg = evt.cyTarget;
			the_move = game.move_count > 0 && is_socrates() ? MOVES["OUT"] : MOVES["IN"];
		} else {
			let move_obj = getStrategicMove(game, !is_socrates());
			arg = move_obj["arg"];
			the_move = move_obj["move"];
		}

		game.move(arg, the_move);
	});

	// Allow the user to enter moves via a text input box. Their input is
	// processed once they hit enter (key code: 13). We also convert a string
	// move-command into a move ENUM and an argument.
	$("[data-preferred-moveinput]").keyup((evt) => {
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

	$("[data-preferred='start']").on("m-button-switched", (evt, is_on) => {
		if (is_on) {
			game.delete();
			game = undefined;
		} else {
			$("[data-preferred-movelist]").empty();

			// Disable delete mode
			let delete_button = $("[data-switch-graph-delete]");
			if (delete_button.hasClass("m-button--switch__li--active")) {
				delete_button.closest(".m-button--switch").click();
			}

			game = new preferred_game.Game(cy);

			parseGameInstance(game);

			updateDom(game);
		};
	});

	$("[data-preferred-moveai]").click(() => {
		if (game === undefined) { return };
		let move_obj = getStrategicMove(game, !is_socrates());
		game.move(move_obj["arg"], move_obj["move"]);
	});

	$("[data-preferred-undo]").click(() => {
		if (game === undefined) { return };
		game.undoLastMove();
	});

	$("[data-preferred='socrates']").on("m-button-switched", (evt, is_on) => {
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