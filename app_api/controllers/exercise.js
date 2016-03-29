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

var createWorkoutWeek = function (req, res) {

    var weekdays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    var ExercisesArrayPerDay = {};
    var exercisePromises;
    var exerciseCount;
    var startFresh;
    startFresh = true;
    for (day of weekdays) {
        console.log(day);
        var exerciseArray = req.body[day];
        console.log(exerciseArray);
        exerciseCount = 0;
        var exerciseDocArray = [];
        for (exercise of exerciseArray)
            //if the promise has not been initialized, then initialize it starting at the first exercise.
            //miguel's idea for reduce is an interesting idea for applying an array of functions to a promise
            if (startFresh){
                if(!exercisePromises){
                    exercisePromises = Exercise.find({name: exerciseArray[0]}).exec().then(function(doc) {
                        console.log("This is an exercise the count " + this.count);
                        console.log("this is the exercise array");
                        console.log(this.exerciseArray);
                        console.log("And the day is " + this.day);
                        this.exerciseDocArray.push(doc[0]);
                        console.log("Here1");
                        console.log(this.exerciseDocArray);
                        if ((this.count == (this.exerciseArray.length - 1)) || (this.count == 0 && this.exerciseArray.length == 0)){
                            console.log("IN HERE!!!");
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
                    console.log("This is an exercise the count " + this.count);
                    console.log("this is the exercise array");
                    console.log(this.exerciseArray);
                    console.log("And the day is " + this.day);
                    this.exerciseDocArray.push(doc[0]);
                    console.log("Here3");
                    console.log(this.exerciseDocArray);
                    console.log(this.count + " " + this.exerciseArray.length);
                    if ((this.count == (this.exerciseArray.length - 1)) || (this.count == 0 && this.exerciseArray.length == 0)){
                        console.log("IN HERE!!!");
                        this.ExercisesArrayPerDay[this.day] = deepcopy(this.exerciseDocArray);
                    }
                    return Exercise.find({name: this.exerciseArray[this.count]}).exec();
                }.bind({count: exerciseCount, exerciseArray: deepcopy(exerciseArray), day: day, exerciseDocArray: exerciseDocArray, ExercisesArrayPerDay: ExercisesArrayPerDay}));
                exerciseCount++;

                if(day === weekdays[6] && exerciseCount === exerciseArray.length){
                    // exercisePromise.then(function () {
                    //     var dayCount = 0;
                    //     for (day in weekdays){

                    //     }
                    // })
                    exercisePromises.then(function() {
                        //adds new weekday objects to the database
                        var weekdayDocumentArray = [];
                        var weekdayFinalProduct = [];
                        console.log("made it here at least");
                        for (dayz in ExercisesArrayPerDay){
                            var weekday = new Weekday({day: dayz});
                            console.log(this.ExercisesArrayPerDay[dayz])
                            weekday.exercises= this.ExercisesArrayPerDay[dayz];
                            weekdayDocumentArray.push(weekday);
                        }
                        var weekdayPromiseArray = weekdayDocumentArray.map(function(weekday){
                            //TODO need to tweek this line to work with the fact hat the 'weekday.save' happens after due to the fact that the promise needs to be returned. Try creating another map to push all the elements afterwardS??? 
                            //User.findOneAndUpdate({"username": req.params.username}, {$push: {"workoutWeek": weekday}}, {upsert: true}, function (err, numAff) { console.log("updated the user")});
                            return weekday.save();
                        })
                        Promise.all(weekdayPromiseArray).then(function(){console.log("itworked!")})
                        console.log(ExercisesArrayPerDay);
                        sendJsonResponse(res, 201, {message: "Weekday exercises saved.", objectCreated: ExercisesArrayPerDay});
                    }.bind({ExercisesArrayPerDay: ExercisesArrayPerDay}));
                }
            }
    }
    //const, let, var
    // exercisePromises.push(Exercise
    // .find({name: exercise})
    // .exec(function (err, foundExercise) {
    //   if (err) {
    //     sendJsonResponse(res, 400, err);
    //   }
    //   else {
    //     //dbUser.workoutWeek.$push({exercise: foundExercise});
    //     console.log("Found the exercise...");
    //     console.log(foundExercise[0])
    //     newWeekday.exercises.push(foundExercise[0]);
    //     //ITS A FUCKING ARRAY, USE THE FIND ONE METHOD FOR CHRIST SAKE.
    //   }
    // }.bind(this)));

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

    //   arrayOfPromises.push(Promise.all(exercisePromises).then(function(){
    //     arrayOfPromises.push(newWeekday.save());
    //     arrayOfPromises.push(User.findOneAndUpdate({"username": req.params.username}, {$push: {"workoutWeek": newWeekday}}, {upsert: true}, function (err, numAff) { console.log("updated the user");
    //     exercisePromises = [];
    //   console.log(numAff);}));
    // }.bind(this)));
    //
    //   //console.log(`${day} workout was inserted...`)
    // }
    // Promise.all(arrayOfPromises).then(
    //   User
    //     .find({username: req.params.username})
    //     .populate("workoutWeek")
    //     .exec(function (err, dbUser) {
    //       sendJsonResponse(res, 200, dbUser);
    //       console.log(day + " workout was inserted...");
    //     })
    // );

};
module.exports = {
    createExercise: createExercise,
    getExercise: getExercise,
    createWorkoutWeek: createWorkoutWeek
};
