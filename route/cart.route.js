const express = require("express");
const { authMiddleware, isStudent } = require("../middleware/Auth.middle");
const { addToCart } = require("../controller/cart.controller");
const routes = express.Router();


routes.post("/addToCart",authMiddleware,isStudent,addToCart);


module.exports = routes;