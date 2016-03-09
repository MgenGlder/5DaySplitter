var mongoose = require("mongoose");

var archivedExerciseSchema = new mongoose.Schema ({
  date: {type: Date, required: true},
  exerciseName: {type: String, required: true}
});

var exerciseSchema = new mongoose.Schema({
  exerciseName: {type: String, required: true, unique: true},
  personalRecordWeight: {type: Number},
  personalRecordReps: {type: Number},
  timesDone: {type: Number, required: true}
});

var weekday = new mongoose.Schema({
  day: {type: String, required: true},
  exercise: [exerciseSchema]
});

var userSchema = new mongoose.Schema({
  username: {type: String, required: true, unique: true},
  name: {type: String, required: true},
  workoutWeek: [weekday],
  exerciseHistory: [archivedExerciseSchema]
});

mongoose.model("user", userSchema);
