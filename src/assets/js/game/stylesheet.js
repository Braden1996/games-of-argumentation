let cytoscape = require("cytoscape");

function build_stylesheet() {
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
					min_max = min_max  === undefined ? "\u221e" : min_max;
					return e.attr("id") + "\n(" + min_max + ")";
				}
			})
		.selector("node.discuss, node.highlight")
			.css({
				"border-width": "4px",
				"border-style": "solid",
				"border-opacity": 1
			})
		.selector("node.discuss")
			.css({
				"border-color": "#3498db"
			})
		.selector("node.highlight")
			.css({
				"border-color": "#8e44ad"
			})
		.selector("edge.highlight")
			.css({
				"line-color": "#8e44ad",
				"target-arrow-color": "#8e44ad"
			})
}

module.exports = {
	"build_stylesheet": build_stylesheet
}