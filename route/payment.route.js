const express = require("express");
const { authMiddleware, isStudent } = require("../middleware/Auth.middle");
const { createPayment } = require("../modules/payment");
const { verifyPayment, createOrder } = require("../controller/payment.controller");
const routes = express.Router();


routes.post("/capturePayment",authMiddleware,isStudent,createOrder);
routes.post("/verifyPayment",authMiddleware,isStudent,verifyPayment);


module.exports = routes;