var mongoose = require("mongoose");
var Users = mongoose.model("user");

var sendJsonResponse = function (res, status, content){
  res.status(status);
  res.json(content);
};

function createUser(req, res) {
   sendJsonResponse(res, 200, {message: "Got to the creating place"});
}

module.exports = {createUser: createUser};
