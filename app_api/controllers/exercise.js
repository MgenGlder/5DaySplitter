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
  var tempWorkouts = [];
  var targetUser;
  var promise =

  User
  .find({
    username: req.params.username
  })
  .exec(function (err, dbUser){
      if (err) {
        sendJsonResponse(res, 400, err);
      }
      else {
          for (day of weekdays) {
            console.log(day);
            console.log(exerciseArray);
            var exerciseArray = req.body[day];
            for (exercise of exerciseArray) {
              console.log(exercise);
              Exercise
              .find({name: exercise})
              .exec(function (err, foundExercise) {
                if (err) {
                  sendJsonResponse(res, 400, err);
                }
                else {
                  //dbUser.workoutWeek.$push({exercise: foundExercise});
                  tempWorkouts.push(foundExercise);
                  console.log(tempWorkouts.length + " " + exerciseArray.length);
                  if (tempWorkouts.length === exerciseArray.length) {
                    console.log("final insert");
                    User.update({username: req.params.username}, {$push: {workoutWeek: tempWorkouts}});
                  }
                }
              });
             //dbUser.workoutWeek.push({day: day, exercise: tempWorkouts});
            }
            tempWorkouts.length = 0
            console.log(day + " workout was inserted...");
            //console.log(`${day} workout was inserted...`)
          }
      }
      sendJsonResponse(res, 200, dbUser);

  })

 };
module.exports = {
  createExercise: createExercise,
  getExercise: getExercise,
  createWorkoutWeek: createWorkoutWeek
};
