var mongoose = require("mongoose");
var Exercise = mongoose.model("exercise");
var Weekday = mongoose.model("weekday");
var User = mongoose.model("user");

var sendJsonResponse = function (res, status, content) {
  res.status(status);
  res.json(content);
};

var createExercise = function (req, res) {
  Exercise.create({
    name: req.params.name,
    timesDone: 0,
    dateStarted: Date.now()

  }, function (err, exercise) {
    if (err) {
      sendJsonResponse(res, 400, err);
    }
    else {
      sendJsonResponse(res, 200, exercise);
    }
  });
};

var getExercise = function (req, res) {
  Exercise
  .find({name: req.params.name})
  .exec(function (err, exercise){
    if (err) {
      sendJsonResponse(res, 400, err);
    }
    else {
      sendJsonResponse(res, 200, exercise);
    }
  });
};

var createWorkoutWeek = function (req, res) {
  var weekdays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  var setWorkdays = [];
  var count = 0;
  User
  .find({
    username: req.params.username
  })
  .exec(function (err, dbUser){
      if (err) {
        sendJsonResponse(res, 400, err);
      }
      else {
        dbUser.workoutWeek.push(ex)
      }
  })
  for (day of weekdays) {
    req.body[day];
    console.log(`${day} workout was inserted...`)
    count++;
  }
};
module.exports = {
  createExercise: createExercise,
  getExercise: getExercise
};
