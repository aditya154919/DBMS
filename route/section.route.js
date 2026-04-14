const express = require("express");
const { authMiddleware, isInstructor } = require("../middleware/Auth.middle");
const { createSection, getSection } = require("../controller/section.controller");
const routes = express.Router();


routes.post("/createSection",authMiddleware,isInstructor,createSection);
routes.post("/getSection",getSection)

module.exports = routes;