var mongoose = require("mongoose");
var Exercise = mongoose.model("exercise");
var Weekday = mongoose.model("weekday");
var User = mongoose.model("user");
var deepcopy = require("deepcopy");
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
        .find({ name: req.params.name })
        .exec(function (err, exercise) {
            if (err) {
                sendJsonResponse(res, 400, err);
            }
            else {
                sendJsonResponse(res, 200, exercise);
            }
        });
};

//Works, exercises are retrieved from the database asynchronously and returned through promises that are ordered.

var getWeek = function(req, res) {
    User.find({username: req.params.username}).populate('workoutWeek').exec(function(err, doc) {
        if (err) sendJsonResponse(res, 200, err);
        else {
            
            sendJsonResponse(res, 200, doc[0].workoutWeek);
        }
    })
}

//Username MUST exist
//Exercise MUST exist
var createWorkoutWeek = function (req, res) {
    
    var weekdays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    var ExercisesArrayPerDay = {};
    var exercisePromises;
    var exerciseCount;
    var startFresh;
    startFresh = true;
    for (day of weekdays) {
        var exerciseArray = req.body[day];
        exerciseCount = 0;
        var exerciseDocArray = [];
        for (exercise of exerciseArray)
            //if the promise has not been initialized, then initialize it starting at the first exercise.
            //miguel's idea for reduce is an interesting idea for applying an array of functions to a promise
            if (startFresh){
                if(!exercisePromises){
                    exercisePromises = Exercise.find({name: exerciseArray[0]}).exec().then(function(doc) {
                        this.exerciseDocArray.push(doc[0]);
                        if ((this.count == (this.exerciseArray.length - 1)) || (this.count == 0 && this.exerciseArray.length == 0)){
                            this.ExercisesArrayPerDay[this.day] = deepcopy(this.exerciseDocArray);
                        }
                        return Exercise.find({name: this.exerciseArray[this.count]}).exec();
                    }.bind({count: exerciseCount, exerciseArray: deepcopy(exerciseArray), day: day, exerciseDocArray: deepcopy(exerciseDocArray), ExercisesArrayPerDay: ExercisesArrayPerDay}));
                    exerciseCount ++;
                    startFresh = false;
                }
            }
            else {
                exercisePromises.then(function (doc) {
                    this.exerciseDocArray.push(doc[0]);
                    if ((this.count == (this.exerciseArray.length - 1)) || (this.count == 0 && this.exerciseArray.length == 0)){
                        this.ExercisesArrayPerDay[this.day] = deepcopy(this.exerciseDocArray);
                    }
                    return Exercise.find({name: this.exerciseArray[this.count]}).exec();
                }.bind({count: exerciseCount, exerciseArray: deepcopy(exerciseArray), day: day, exerciseDocArray: exerciseDocArray, ExercisesArrayPerDay: ExercisesArrayPerDay})).catch(function(e){console.log("Errored out here3 because... " + e)});
                exerciseCount++;

                if(day === weekdays[6] && exerciseCount === exerciseArray.length){
                    exercisePromises.then(function() {
                        var weekdayDocumentArray = [];
                        var weekdayFinalProduct = [];
                        for (dayz in ExercisesArrayPerDay){
                            var weekday = new Weekday({day: dayz});
                            weekday.exercises= this.ExercisesArrayPerDay[dayz];
                            weekdayDocumentArray.push(weekday);
                        }
                        //^can use javascript reduce to do this in a simpler way.
                        var weekdayPromiseArray = weekdayDocumentArray.map(function(weekday){
                                return weekday.save(function(err) {
                                    if(err) console.log("There was an error here... " + err);
                                })
                            }.bind({weekday: weekday}));
                        Promise.all(weekdayPromiseArray).then(function(values){
                            User.update({"username": req.params.username}, { "workoutWeek":values}, { upsert: true, new: true}, function (err, numAff) { console.log("updated the user" + err)});
                        }.bind({weekdayPromiseArray: weekdayPromiseArray}))
                        .catch(e=>{console.log("errored out here2 because " + e)});
                        sendJsonResponse(res, 201, {message: "Weekday exercises saved.", objectCreated: ExercisesArrayPerDay});
                    }.bind({ExercisesArrayPerDay: ExercisesArrayPerDay}))
                    .catch(e=>{console.log("something went wrong8 "); console.log(e)});
                    
                }
            }
        }
   }
    //     //User.update({"username": req.params.username}, {$push: {"workoutWeek":{$each: tempWorkouts}}}, {safe: true, upsert: true, new: true}, function (err, numAff) { console.log("updated the user" + err)});
    // Promise.all(arrayOfPromises).then(
    //   User
    //     .find({username: req.params.username})
    //     .populate("workoutWeek")
    //     .exec(function (err, dbUser) {
    //       sendJsonResponse(res, 200, dbUser);
    //       console.log(day + " workout was inserted...");
    //     })
    // );
module.exports = {
    getWeek: getWeek,
    createExercise: createExercise,
    getExercise: getExercise,
    createWorkoutWeek: createWorkoutWeek
};
