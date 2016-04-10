var mongoose = require("mongoose");
var Users = mongoose.model("user");

var sendJsonResponse = function (res, status, content){
  res.status(status);
  res.json(content);
};

var getName = function (req, res) {
    Users
        .find({username: req.params.username})
        .exec((err, doc)=> {
            if (err) {
                sendJsonResponse(res, 400, {"message": "There was an error finding the user"});
                console.log(err);
            }
            else if(doc[0]) {
                sendJsonResponse(res, 200, {"name": doc[0].name});   
            }
        })
}
function createUser(req, res){
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
getUser: getUser,
getName: getName};
