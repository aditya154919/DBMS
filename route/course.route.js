const express = require("express");
const { authMiddleware, isInstructor, isStudent } = require("../middleware/Auth.middle");
const { createCourse, getFullCourseDetails, getInstructorCourse, editCourse, getEnrolledCourses, instructorDashboard, getFullEnrolledCourseDetails,  } = require("../controller/course.constrooler");
const routes = express.Router();


routes.post("/createCourse",authMiddleware,isInstructor,createCourse);
routes.post("/getFullCourseDetails",getFullCourseDetails);
routes.get("/getInstructorCourse",authMiddleware,isInstructor,getInstructorCourse);
routes.post("/editCourseDetails",authMiddleware,isInstructor,editCourse)
routes.post("/getEnrolledCourse",authMiddleware,isStudent,getEnrolledCourses)
routes.post("/instructorDashboard",authMiddleware,isInstructor,instructorDashboard);
routes.post("/getFullDetailsOfEnrolledCourse",authMiddleware,isStudent,getFullEnrolledCourseDetails)



module.exports = routes;