var config = require("../");

module.exports = {
  source: config.projectStatic,
  destination: config.project + "/production-static/"
};
