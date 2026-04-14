const express = require("express");
const { authMiddleware, isInstructor } = require("../middleware/Auth.middle");
const { createSubSection } = require("../controller/subsection.controller");
const routes = express.Router();


routes.post("/createSubSection",authMiddleware,isInstructor,createSubSection);


module.exports = routes;