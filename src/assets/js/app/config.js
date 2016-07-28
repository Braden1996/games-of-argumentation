let cytoscape = require("cytoscape");

function getStylesheet() {
	return cytoscape.stylesheet()
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
		.selector("edge")
			.css({
				"target-arrow-shape": "triangle",
				"width": 4,
				"line-color": "#ddd",
				"target-arrow-color": "#ddd",
				"curve-style": "bezier"
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
		.selector("node.minmax")
			.css({
				"content": e => {
					let min_max = e.attr("min_max_numbering");
					min_max = min_max  === Infinity ? "\u221e" : min_max;
					return e.attr("id") + "\n(" + min_max + ")";
				}
			})
		.selector("node.discuss, node.highlight")
			.css({
				"border-width": "4px",
				"border-style": "solid",
				"border-opacity": 1
			})
		// Grounded Discussion Game
		.selector("node.htb")
			.css({
				"background-color": "lightgreen"
			})
		.selector("node.cb")
			.css({
				"background-color": "pink"
			})
		.selector("node.concede")
			.css({
				"background-color": "green"
			})
		.selector("node.retract")
			.css({
				"background-color": "red"
			})
		// Preferred Discussion Game
		.selector("node.preferred-in")
			.css({
				"background-color": "green"
			})
		.selector("node.preferred-out")
			.css({
				"background-color": "red"
			})
}

module.exports = {
	"cytoscape_container": "#l-grapharea__container",
	"cytoscapeStylesheet": getStylesheet()
}