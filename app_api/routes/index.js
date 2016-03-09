var express = require("express");
var router = express.Router();
// var jwt = require("express-jwt");
// var auth = jwt({
//   secret: "teehee",
//   userProperty: "payload"
// });

var ctrlUser = require("../controllers/user.js");


router.get("/workouts", ctrlUser.createUser);

module.exports = router;
