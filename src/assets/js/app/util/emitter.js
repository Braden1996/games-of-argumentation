// A lightweight event emitter.
class Emitter {
	constructor() {
		this._events = {};
	}

	// Attach a callback function to a string of space-separated events.
	on(events_str, callback) {
		let events = events_str.split(" ");
		for (let event of events) {
			if (this._events[event] === undefined) {
				this._events[event] = [];
			}

			this._events[event].push(callback);
		}
	}

	// Trigger the given event, parsing any other arguments into the callbacks.
	emit(event, ...theArgs) {
		if (this._events[event]) {
			for (let callback of this._events[event]) {
				callback.apply(null, theArgs);
			}
		}
	}
}

module.exports = Emitter;