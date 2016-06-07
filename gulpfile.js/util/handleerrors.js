module.exports = {
	swallowError: swallowError
}

function swallowError (error) {
  console.log(error.toString());
  this.emit("end");
}