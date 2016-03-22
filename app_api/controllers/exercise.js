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

  var targetUser;
  var count = 0;
  var countOuter = 0;

  for (day of weekdays) {
    console.log(day);
    console.log(exerciseArray);
    var tempWorkouts = [];
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
          console.log(foundExercise.name);
          tempWorkouts.push(foundExercise.toObject);
          console.log(tempWorkouts.length + " " + exerciseArray.length);
        }
      }).then(function () {
        count++;
        if (count == exerciseArray.length) {
          console.log("in here...");
          //console.log(tempWorkouts);
          var newWeekday = new Weekday({"day": day, "exercise": tempWorkouts});
          //User.update({"username": req.params.username}, {$push: {"workoutWeek":{$each: tempWorkouts}}}, {safe: true, upsert: true, new: true}, function (err, numAff) { console.log("updated the user" + err)});
          newWeekday.save(function (err, saved) {
            if (err) console.error(err);
            else console.log("Weekday saved");
          })
          User.update({"username": req.params.username}, {$push: {"workoutWeek": newWeekday}}, {safe: true, upsert: true}, function (err, numAff) { console.log("updated the user" + err)});
          count = 0;
        }
      });
     //dbUser.workoutWeek.push({day: day, exercise: tempWorkouts});
     //LOOK INTO USING THE POPULATION API, REFERENCE THE SUBDOCUMENT INSTEAD OF CREATING IT AGAIN.
    }

    //console.log(`${day} workout was inserted...`)
  }
  User
  .find({username: req.params.username})
  .exec(function (err, dbUser) {
    sendJsonResponse(res, 200, dbUser);
  })
  console.log(day + " workout was inserted...");
 };
module.exports = {
  createExercise: createExercise,
  getExercise: getExercise,
  createWorkoutWeek: createWorkoutWeek
};
