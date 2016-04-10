var express = require("express");
var router = express.Router();
// var jwt = require("express-jwt");
// var auth = jwt({
//   secret: "teehee",
//   userProperty: "payload"
// });

var ctrlUser = require("../controllers/user.js");
var ctrlExercise = require("../controllers/exercise.js");


router.post("/user", ctrlUser.createUser);
router.get("/user/:username", ctrlUser.getUser);
router.post("/exercise/:name", ctrlExercise.createExercise);
router.get("/exercise/:name", ctrlExercise.getExercise);
router.post("/exercise/:name/edit", ctrlExercise.editExercise);
router.post("/exercise/:name/archive", ctrlExercise.addArchivedExercise);
router.post("/exercise/week/:username", ctrlExercise.createWorkoutWeek);
router.get("/workoutweek/:username", ctrlExercise.getWorkoutWeek);


module.exports = router;
