let Emitter = require("../../util/emitter.js");

// The state of our termination, i.e. the cause of termination.
let TERMINATE_STATES = {
	"NONE": -1,  // Game has not terminated
	"UNKNOWN": 0,  // Game has terminated for an unknown reason.
};

// The moves that this game allows.
let MOVES = {};


// A fairly simple class to handle the execution of a move based argumentation
// game.
// Suggestions:
//	- Include event functionality as a mixin.
//	- Raise custom errors, e.g. on an invalid move.
//	- Convert to some ENUM library.
class Game {
	constructor(createCollection, arg_stack=[], move_stack=[]) {
		// To help us from creating any further unnecessary coupling with Cytoscape,
		// we need a function that can create a new collection.
		this._createCollection = createCollection;

		// This is set to true when 'this.delete()' is called.
		this._dying = false;

		// Attach our game's ENUMS to our class (for inheritance).
		this.TERMINATE_STATES = TERMINATE_STATES;
		this.MOVES = MOVES;

		// Store a history of all the moves which have been played.
		this._arg_stack = arg_stack;
		this._move_stack = move_stack;

		// Allow us to attach callback functions to be triggered upon certain
		// events.
		this._emitter = new Emitter();
	}

	// Redirect Emitter functionality into our private emitter.
	on(events_str, callback) {
		return this._emitter.on.apply(this._emitter, arguments);
	};
	emit(event, ...data) {
		return this._emitter.emit.apply(this._emitter, arguments);
	};

	get dying() { return this._dying; }

	// Return the current termination state of the game.
	get terminate_state() {
		return this.TERMINATE_STATES["NONE"];
	}

	// Return the amount of moves which have been played.
	get move_count() {
		return this._move_stack.length;
	}

	// Get the args which have been used to play a certain move.
	getArgsMoved(move) {
		return this._createCollection(
			this._arg_stack.filter((arg, i) => this.hasPlayed(arg, move))
		);
	}

	// Return true if the game has ended. Otherwise, return false.
	hasTerminated() {
		return this.terminate_state !== this.TERMINATE_STATES["NONE"];
	}

	// Return the amount an argument has been used to play the given move.
	hasPlayed(arg, move) {
		return this._arg_stack.reduce((count, a, i) => {
			return (arg === a && this._move_stack[i] === move) ? count + 1 : count;
		}, 0);
	}

	// Return true if the move is valid. Otherwise, return false.
	//	By default, this checks that 'the_move' is within 'this.MOVES'.
	isValidMove(arg, the_move) {
		// Equivalent to: Object.values(...)
		return Object.keys(this.MOVES)
			.reduce((y, z) => y.push(this.MOVES[z]) && y, [])
			.includes(the_move);
	}

	// Undo the most-recently played move.
	undoLastMove() {
		let last_arg = this._arg_stack.pop();
		let last_move = this._move_stack.pop();
		this.emit("undo", last_arg, last_move);
		return {"arg": last_arg, "move": last_move};
	}

	// Attempt to perform the given move on the given argument.
	// 	First, we consult the rules to check if the move is valid.
	//	We then check that the game is still playing. If so, the move can be
	//	played.
	move(arg, the_move) {
		if (this.isValidMove(arg, the_move)) {
				this._arg_stack.push(arg);
				this._move_stack.push(the_move);
				this.emit("move", arg, the_move);
				return true;
		} else {
			this.emit("invalidmove", arg, the_move);
			return false;
		}
	}

	// Called when we're done with this game instance and are about to delete it.
	delete() {
		this._dying = true;
		this.emit("delete");
	}

	// Return a copy of the current game.
	copy() {
		return new this.constructor(
			this._createCollection,
			this._arg_stack.slice(0),
			this._move_stack.slice(0)
		);
	}

	// Return the move, and the corresponding argument, at the given index.
	eq(i) {
		return {"move": this._move_stack[i], "arg": this._arg_stack[i]};
	}

	// Return the first move, and its corresponding argument.
	first(i) {
		return this.eq(0);
	}

	// Return the last move, and its corresponding argument.
	last(i) {
		return this.eq(this._move_stack.length-1);
	}
}

module.exports = {
	"TERMINATE_STATES": TERMINATE_STATES,
	"MOVES": MOVES,
	"Game": Game
};