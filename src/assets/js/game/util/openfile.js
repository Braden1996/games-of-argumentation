function openFile(input, callback) {
	if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
		alert("The File APIs are not fully supported in this browser.");
		return;
	} else {
		if (!input) {
		  alert("Can't find file-input element!");
		} else if (!input.files) {
		  alert("Browser doesn't seem to support 'files' property of file input");
		} else if (!input.files[0]) {
		  alert("Unable to find file");               
		} else {
			let file = input.files[0];
			let reader = new FileReader();
			reader.addEventListener("load", function(evt) {
				callback(reader, evt);
			}, false);

			if (file) {
				reader.readAsText(file);
			}
		}
	}
}

module.exports = openFile;