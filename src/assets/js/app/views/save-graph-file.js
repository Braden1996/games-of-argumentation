let fileSaver = require("file-saver");

function parseCytoscapeInstance(cy) {
	let textFile = null;

	$("[data-save-graph-file]").click((evt) => {
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

		let text = JSON.stringify(out_eles);
		let textBlob = new Blob([text], {type: "text/plain"});
		fileSaver.saveAs(textBlob, "graph.json");
	});

	return cy;
}

module.exports = {
	"parseCytoscapeInstance": parseCytoscapeInstance
}