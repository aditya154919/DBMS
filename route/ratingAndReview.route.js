const express = require("express");
const { authMiddleware, isStudent } = require("../middleware/Auth.middle");
const { createRatingAndReview, getRatingAndReview } = require("../controller/ratingAndReview.con");
const routes = express.Router();


routes.post("/createRatingAndReview",authMiddleware,isStudent,createRatingAndReview);
routes.post("/getAllRAR",getRatingAndReview);



module.exports = routes;