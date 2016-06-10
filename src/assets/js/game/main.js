let cytoscape = require("cytoscape");
let labelling = require("./labelling.js");
let get_labelling = labelling["get_labelling"];

$(document).ready(function() {
	let cy = cytoscape({
		container: $("#l-grapharea__container"),

		boxSelectionEnabled: false,
		autounselectify: true,

		elements: {
			nodes: [
				{ data: { id: "a" } },
				{ data: { id: "b" } },
				{ data: { id: "c" } },
				{ data: { id: "d" } },
				{ data: { id: "e" } },
				{ data: { id: "f" } },
				{ data: { id: "g" } },
				{ data: { id: "h" } }
			],

			edges: [
				{ data: { id: "ab", source: "a", target: "b" } },
				{ data: { id: "bc", source: "b", target: "c" } },
				{ data: { id: "ce", source: "c", target: "e" } },
				{ data: { id: "de", source: "d", target: "e" } },
				{ data: { id: "ef", source: "e", target: "f" } },
				{ data: { id: "fe", source: "f", target: "e" } },
				{ data: { id: "gh", source: "g", target: "h" } },
				{ data: { id: "hb", source: "h", target: "b" } },
				{ data: { id: "hg", source: "h", target: "g" } }
			]
		},

		style: cytoscape.stylesheet()
			.selector("node")
				.css({
					"padding-top": "18px",
					"padding-right": "18px",
					"padding-bottom": "18px",
					"padding-left": "18px",
					"color": "white",
					"content": "data(id)",
					"text-wrap": "wrap",
					"text-valign": "center",
					"text-halign": "center"
				})
			.selector("node.in")
				.css({
					"content": e => e.attr("id") + "\n(in)",
					"background-color": "#37d077",
				})
			.selector("node.out")
				.css({
					"content": e => e.attr("id") + "\n(out)",
					"background-color": "#e74c3c",
				})
			.selector("node.undec")
				.css({
					"content": e => e.attr("id") + "\n(undec)",
					"background-color": "#95a5a6",
				})
			.selector("edge")
				.css({
					"target-arrow-shape": "triangle",
					"width": 4,
					"line-color": "#ddd",
					"target-arrow-color": "#ddd",
					"curve-style": "bezier"
				})
	});

	let lab = get_labelling(cy);
	console.log(lab);
	console.log("in:", lab["in"].id());
	console.log("out:", lab["out"].id());
	console.log("undec:", lab["undec"].id());
	lab["in"].addClass("in");
	lab["out"].addClass("out");
	lab["undec"].addClass("undec");
});