// Libraries
// (check package.json for library 'entry-point' information)
require("jquery");

var cytoscape = require("cytoscape");

$(document).ready(function() {
	var cy = cytoscape({
	  container: $("#l-site__grapharea__container"),

	  elements: [ // list of graph elements to start with
	    { // node a
	      data: { id: 'a' }
	    },
	    { // node b
	      data: { id: 'b' }
	    },
	    { // edge ab
	      data: { id: 'ab', source: 'a', target: 'b' }
	    },
	    { // edge bb
	      data: { id: 'bb', source: 'b', target: 'b' }
	    }
	  ],

	  style: [ // the stylesheet for the graph
	    {
	      selector: 'node',
	      style: {
	        'background-color': '#666',
	        'label': 'data(id)'
	      }
	    },

	    {
	      selector: 'edge',
	      style: {
	        'width': 3,
	        'line-color': 'red',
	        'target-arrow-color': '#ccc',
	        'target-arrow-shape': 'triangle'
	      }
	    }
	  ],

	  layout: {
	    name: 'grid',
	    rows: 1
	  }
	});
});