var cytoscape = require("cytoscape");

$(document).ready(function() {
	var cy = cytoscape({
		container: $("#l-grapharea__container"),

		boxSelectionEnabled: false,
		autounselectify: true,

		elements: {
			nodes: [
				{ data: { id: "a" }, classes: "in" },
				{ data: { id: "b" }, classes: "minmax" },
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
					"content": "data(id)",
					"text-valign": "center",
					"text-halign": "center"
				})
			.selector("node.minmax")
				.css({
					"padding-top": "5px",
					"padding-right": "5px",
					"padding-bottom": "5px",
					"padding-left": "5px",
					"color": "white",
					"text-wrap": "wrap",
					"content": e => e.attr("id") + "\n(2)",
					"background-color": "#61bffc",
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
});