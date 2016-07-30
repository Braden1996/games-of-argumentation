// A lightweight element visibility controller.

let showing = {};

// The operations for our expression.
let operations = {
	"|": {"precedence": 5, "left": true, "function": (a, b) => a || b},
	"&": {"precedence": 6, "left": true, "function": (a, b) => a && b},
	"=": {"precedence": 10, "left": true, "function": (a, b) => a === b},
	">": {"precedence": 11, "left": true, "function": (a, b) => a > b},
	"<": {"precedence": 11, "left": true, "function": (a, b) => a < b},
	"-": {"precedence": 13, "left": true, "function": (a, b) => a - b},
	"+": {"precedence": 13, "left": true, "function": (a, b) => a + b},
	"*": {"precedence": 14, "left": true, "function": (a, b) => a * b},
	"!": {"precedence": 15, "left": false, "function": (a) => !a}
};

let invalid_str = "is an invalid ifshowhide expression";

module.exports = function(attribute, value) {
	showing[attribute] = value;

	let eles = document.querySelectorAll("[data-ifshowhide]");
	for (let ele of eles) {
		let condition = ele.dataset["ifshowhide"];

		// Break down the condition into tokens of attributes and operations
		let escaped_operations = ("(" + ")" + Object.keys(operations).join(""))
			.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
		let operation_regex = new RegExp("([" + escaped_operations + "])");
		let tokens = condition.split(operation_regex)
			.map(v => {
				v = v.trim();
				if (v === "") {
					return v;  // We filter this out next
				} else if (v.toLowerCase() === "true") {
					return true;
				} else if (v.toLowerCase() === "false") {
					return false;
				} else if (!isNaN(Number(v))) {
					return Number(v);
				} else {
					return v;  // We map this to 'showing[v]' later
				};
			})
			.filter(v => v !== "");

		// Check if this affects this element.
		if (tokens.indexOf(attribute) === -1) {
			continue;
		} else {
			tokens = tokens.map((v) => {
				if (typeof v === typeof "" && v !== ")" && v !== "(" &&
					operations[v] === undefined) {
						return showing[v];
				} else {
					return v;
				}
			});

			// Parse our expression tokens into Reverse Polish Notation
			// using the shunting-yard algorithm.
			let rpn_tokens = [];
			let op_stack = [];
			for (let token of tokens) {
				if (token === "(") {
					op_stack.push(token);
				} else if (token === ")") {
					while (op_stack.length === 0 || op_stack[op_stack.length-1] !== "(") {
						if (op_stack.length === 0) {
							console.log("'" + condition + "' " + invalid_str);
							return;
						} else {
							rpn_tokens.push(op_stack.pop());
						};
					};
					op_stack.pop();
				} else {
					let op1 = operations[token];
					if (op1 === undefined) {
						rpn_tokens.push(token);
					} else {
						let op2 = operations[op_stack[op_stack.length-1]];
						while (op_stack.length !== 0 && op2 !== undefined && (
							(op1.left && op1.precedence <= op2.precedence) ||
							(!op1.left && op1.precedence < op2.precedence))) {
								rpn_tokens.push(op_stack.pop());
								op2 = operations[op_stack[op_stack.length-1]];
						};
						op_stack.push(token);
					};
				};
			};

			while (op_stack.length !== 0) {
				let op = op_stack.pop();
				if (op === "(") {
					console.log("'" + condition + "' " + invalid_str);
					return;
				} else {
					rpn_tokens.push(op);
				};
			};

			// Evaluate our Reverse Polish Notation expression.
			let rpn_stack = [];
			for (let token of rpn_tokens) {
				let op1 = operations[token];
				if (op1 === undefined) {
					rpn_stack.push(token);
				} else {
					let op_n = op1.function.length;
					if (rpn_stack.length < op_n) {
						console.log("'" + condition + "' " + invalid_str);
						return;
					} else {
						let op_args = rpn_stack.splice(rpn_stack.length - op_n, op_n);
						let x = op1.function.apply(null, op_args);
						rpn_stack.push(x);
					};
				};
			};

			// Check if evaluation was successful.
			if (rpn_stack.length !== 1) {
				console.log("'" + condition + "' " + invalid_str);
				return;
			};

			// Apply the visibility
			ele.style.display = rpn_stack[0] ? "" : "none";

			ele.dataset.ifshowhideChecked = "";
		};

		// By default, disable elements we haven't yet checked.
		if (ele.dataset.ifshowhideChecked === undefined) {
			ele.style.display = "none";
		};
	};
};