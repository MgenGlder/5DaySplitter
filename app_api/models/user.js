var mongoose = require("mongoose");

var archivedExerciseSchema = new mongoose.Schema ({
  date: {type: Date, required: true},
  exerciseName: {type: String, required: true}
});

var exerciseSchema = new mongoose.Schema({
  name: {type: String, required: true},
  personalRecordWeight: {type: Number},
  personalRecordReps: {type: Number},
  timesDone: {type: Number, required: true},
  dateStarted : {type: Date, required: true}
});

var weekday = new mongoose.Schema({
  day: {type: String, required: true},
  exercises: [{type: mongoose.Schema.ObjectId, ref: "exercise"}]
});

var userSchema = new mongoose.Schema({
  username: {type: String, required: true, unique: true},
  name: {type: String, required: true},
  workoutWeek: [{type: mongoose.Schema.ObjectId, ref: "weekday"}],
  exerciseHistory: [archivedExerciseSchema]
});

mongoose.model("user", userSchema);
mongoose.model("exercise", exerciseSchema);
mongoose.model("weekday", weekday);
mongoose.model("archivedExercise", archivedExerciseSchema);
