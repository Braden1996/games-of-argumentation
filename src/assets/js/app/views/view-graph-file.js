// A rather poor implementation of copying the current graph into to the clipboard...
function parseCytoscapeInstance(cy) {
	$("[data-viewgraphfile]").click((evt) => {
		let eles = cy.elements().jsons();

		let out_eles = {};
		for (let ele of eles) {
			let out_ele = {"data": {"id": ele.data.id}};

			if (ele.group === "edges") {
				out_ele.data.source = ele.data.source;
				out_ele.data.target = ele.data.target
			} else if (ele.group === "nodes") {
				out_ele.position = ele.position;
			}

			if (!out_eles.hasOwnProperty(ele.group)) {
				out_eles[ele.group] = [];
			}

			out_eles[ele.group].push(out_ele);
		}

		window.prompt("Copy to clipboard: Ctrl+C, Enter", JSON.stringify(out_eles));
	});

	return cy;
}

module.exports = {
	"parseCytoscapeInstance": parseCytoscapeInstance
}