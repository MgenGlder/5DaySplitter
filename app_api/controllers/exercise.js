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
  var arrayOfPromises = [];

  for (day of weekdays) {
    console.log(day);

    var exerciseArray = req.body[day];
    console.log(exerciseArray);
    var newWeekday = new Weekday({"day": day});
    var exercisePromises = [];
    for (exercise of exerciseArray) {

      console.log(exercise);
      exercisePromises.push(Exercise
      .find({name: exercise})
      .exec(function (err, foundExercise) {
        if (err) {
          sendJsonResponse(res, 400, err);
        }
        else {
          //dbUser.workoutWeek.$push({exercise: foundExercise});
          console.log("Found the exercise...");
          console.log(foundExercise[0])
          newWeekday.exercises.push(foundExercise[0]);
          //ITS A FUCKING ARRAY, USE THE FIND ONE METHOD FOR CHRIST SAKE.
        }
      }.bind(this)));

      // .then(function () {
      //   count++;
      //   if (count == exerciseArray.length) {
      //     console.log("in here...");
      //     //console.log(tempWorkouts);
      //     //User.update({"username": req.params.username}, {$push: {"workoutWeek":{$each: tempWorkouts}}}, {safe: true, upsert: true, new: true}, function (err, numAff) { console.log("updated the user" + err)});
      //     newWeekday.save(function (err, saved) {
      //       if (err) console.error(err);
      //       else console.log("Weekday saved");
      //     })
      //     User.update({"username": req.params.username}, {$push: {"workoutWeek": newWeekday}}, {safe: true, upsert: true}, function (err, numAff) { console.log("updated the user" + err)});
      //     count = 0;
      //   }
      // });
     //dbUser.workoutWeek.push({day: day, exercise: tempWorkouts});
     //LOOK INTO USING THE POPULATION API, REFERENCE THE SUBDOCUMENT INSTEAD OF CREATING IT AGAIN.
    }
    arrayOfPromises.push(Promise.all(exercisePromises).then(function(){
      arrayOfPromises.push(newWeekday.save());
      arrayOfPromises.push(User.findOneAndUpdate({"username": req.params.username}, {$push: {"workoutWeek": newWeekday}}, {upsert: true}, function (err, numAff) { console.log("updated the user");
      exercisePromises = [];
    console.log(numAff);}));
  }.bind(this)));

    //console.log(`${day} workout was inserted...`)
  }
  Promise.all(arrayOfPromises).then(
    User
      .find({username: req.params.username})
      .populate("workoutWeek")
      .exec(function (err, dbUser) {
        sendJsonResponse(res, 200, dbUser);
        console.log(day + " workout was inserted...");
      })
  );

 };
module.exports = {
  createExercise: createExercise,
  getExercise: getExercise,
  createWorkoutWeek: createWorkoutWeek
};
