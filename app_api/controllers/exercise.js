var mongoose = require("mongoose");
var Exercise = mongoose.model("exercise");
var Weekday = mongoose.model("weekday");
var User = mongoose.model("user");
var ArchiveExercise = mongoose.model("archivedExercise");
var deepcopy = require("deepcopy");
var sendJsonResponse = function (res, status, content) {
    res.status(status);
    res.json(content);
};

var createExercise = function (req, res) {
    //Initializing a new exercise with today's date
    Exercise.create({
        name: req.params.name,
        timesDone: 0,
        dateStarted: Date.now()
    }, function (err, exercise) {
        if (err) {
            sendJsonResponse(res, 400, err);
            console.error("There was an error");
            console.error(err);
        }
        else {
            console.log("Exercise created successfully");
            sendJsonResponse(res, 201, {"message": "Exercise created successfully"});
        }
    });
};

var getExercise = function (req, res) {
    //Retrieve the exercise if it exists 
    Exercise
        .find({ name: req.params.name })
        .exec(function (err, exercise) {
            if (err) {
                console.error("There was an error");
                console.error(err);
                sendJsonResponse(res, 400, {"message": "There was a problem retrieving the message"});
            }
            else {
                console.log("Exercise was found");
                sendJsonResponse(res, 200, exercise);
            }
        });
};

var addArchivedExercise = function (req, res) {
    //create new ArchivedExercise object. 
    var archive = new ArchiveExercise({exerciseName: req.body.exerciseName, date: Date.now()})
    //save the current date/time and the name of the exercise  that was given. vvv
    archive.save((err) => {
        //when done with save, find the user by username in url and save the archived exercise to the user. 
        if (err) sendJsonResponse(res, 400, {"message": "There was an error saving the exercise to the database"})
        else {
            User.find({username: req.params.name}).exec(function (err, userDoc){
                //since the find can return more than one match via array, select the first
                //username is a unique index so there should only be one match
                if (err) sendJsonResponse(res, 400, err);
                else if (userDoc[0]) {
                    userDoc[0].exerciseHistory.push(archive);
                    userDoc[0].save((err)=>{
                        if(err){ 
                            sendJsonResponse(res, 400, {"message": "Error saving to user"}); 
                            console.error("There was an error");
                            console.error(err);
                        }
                        else { 
                            sendJsonResponse(res, 201, {"message": "Archived exercise added to the user"})
                        }
                    });
                }
                else sendJsonResponse(res, 400, {"message": "Username was not found in the database"});
            }.bind({archive: archive}))
        }
    })
}

var editExercise = function (req, res) {
    //edit an exercise thats already in the database. Looks for name of old exercise, new name, and new timesDone
    Exercise
        .find({name: req.params.name })
        .exec(function (err, exercise) {
            if(err){
                sendJsonResponse(res, 400, {"message": "There was an error retrieving exercise from the database"})
                console.log(err);
            }
            if(exercise[0]){
                exercise[0].name = req.body.name;
                exercise[0].timesDone = req.body.timesDone;
                exercise[0].save().then((doc) => {sendJsonResponse(res, 200, {'message': 'Exercise updated', "updatedDoc": doc}); console.log("Exercise updated")})
            }
            else {
                sendJsonResponse(res, 400, {"message": "Exercise could not be found in the database"})
            }
            
        })
}

//Works, exercises are retrieved from the database asynchronously and returned through promises that are ordered.

var getWorkoutWeek = function(req, res) {
    User.find({username: req.params.username}).populate({path: 'workoutWeek', populate: {path: "exercises", model: Exercise}}).exec(function(err, doc) { //if using a different model than the base model in the nested populate call, must specifiy "model" attribute.
        if (err) sendJsonResponse(res, 200, err);
        else if (doc[0]){
            
            sendJsonResponse(res, 200, doc[0].workoutWeek);
        }
        else {
            sendJsonResponse(res, 400, {"message": "user could not be found"})
        }
    })
}

//Username MUST exist
//Exercise MUST exist
var createWorkoutWeek = function (req, res) {
    
    var errors = [];
    var weekdays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    var ExercisesArrayPerDay = {};
    var exercisePromises;
    var exerciseCount;
    var startFresh;
    startFresh = true;
    for (day of weekdays) {
        var exerciseArray = req.body[day];
        if (!exerciseArray) {
            sendJsonResponse(res, 400, {"message": "Not all weekdays are present in request"});
            return;
        }
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
                }.bind({count: exerciseCount, exerciseArray: deepcopy(exerciseArray), day: day, exerciseDocArray: exerciseDocArray, ExercisesArrayPerDay: ExercisesArrayPerDay}))
                .catch(function(e){
                    console.log("Errored out here3 because... " + e)
                });
                exerciseCount++;

                if(day === weekdays[6] && exerciseCount === exerciseArray.length){
                    exercisePromises.then(function() {
                        var weekdayDocumentArray = [];
                        for (dayz in ExercisesArrayPerDay){
                            var weekday = new Weekday({day: dayz});
                            weekday.exercises= this.ExercisesArrayPerDay[dayz];
                            weekdayDocumentArray.push(weekday);
                        }
                        //^can use javascript reduce to do this in a simpler way.
                        var weekdayPromiseArray = weekdayDocumentArray.map(function(weekday){
                                return weekday.save(function(err) {
                                    if(err){ 
                                        console.error("There was an error");
                                        
                                        sendJsonResponse(res, 400, {"message": "Could not save the weekday value to database"});
                                    }
                                })
                            }.bind({weekday: weekday}));
                        Promise.all(weekdayPromiseArray).then(function(values){
                            //took out new = true, upsert = true; was creating a new user if the username didn't exist... not good. 
                            User.update({"username": req.params.username}, { "workoutWeek":values}, {}, function (err, numAff) { 
                                if(err) { 
                                    sendJsonResponse(res, 400, {"message": "There was an error saving the message"});
                                }
                                else if(numAff.nModified === 1){
                                    sendJsonResponse(res, 201, {"message": "Weekday exercises saved.", objectCreated: ExercisesArrayPerDay});
                                }
                                else {
                                    sendJsonResponse(res, 404, {"message": "No user was found"});
                                }
                            });
                        }.bind({weekdayPromiseArray: weekdayPromiseArray}))
                        .catch(e=>{console.log("errored out here2 because " + e)});
                        
                    }.bind({ExercisesArrayPerDay: ExercisesArrayPerDay}))
                    .catch(e=>{console.log("something went wrong8 "); console.log(e)});
                    
                }
            }
        }
   }
    //     //User.update({"username": req.params.username}, {$push: {"workoutWeek":{$each: tempWorkouts}}}, {safe: true, upsert: true, new: true}, function (err, numAff) { console.log("updated the user" + err)});
module.exports = {
    addArchivedExercise: addArchivedExercise,
    editExercise: editExercise,
    getWorkoutWeek: getWorkoutWeek,
    createExercise: createExercise,
    getExercise: getExercise,
    createWorkoutWeek: createWorkoutWeek
};
