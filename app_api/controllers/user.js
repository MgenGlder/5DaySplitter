var mongoose = require("mongoose");
var Users = mongoose.model("user");

var sendJsonResponse = function (res, status, content){
  res.status(status);
  res.json(content);
};

function createUser(req, res) {
  console.log(req.body.username);
  Users.create({
    username: req.body.username,
    name: req.body.name,
  }, function (err, user) {
    if (err) {
      sendJsonResponse(res, 400, err);
    }
    else {
      sendJsonResponse(res, 200, user);
    }
  });
   //sendJsonResponse(res, 200, {message: "Got to the creating place"});
}

function getUser (req, res) {
  console.log(req.params.username)
  Users.find({
    username: req.params.username
  }).exec(function (err, user) {
    if (err) {
      sendJsonResponse(res, 404, err);
    }
    else {
      sendJsonResponse(res, 200, user);
    }
  });
}

module.exports = {createUser: createUser,
getUser: getUser};
