const express = require("express");
const { signup, login, verify } = require("../controller/user.controller");
const { resetPassOTP, verifyOTP, changePass } = require("../controller/resetPass");
const routes = express.Router();


routes.post("/signup",signup);
routes.post("/verify/:token",verify);
routes.post("/login",login);
routes.post("/resetOtp",resetPassOTP);
routes.post("/verifyOtp",verifyOTP)
routes.post("/changePass",changePass)

module.exports = routes;