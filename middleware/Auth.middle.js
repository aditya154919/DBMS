const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../modules/user");
require("dotenv").config();

exports.authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid token",
      });
    }

    const token = authHeader.split(" ")[1];
    console.log("Token: ", token);

    let decode;
    try {
      decode = jwt.verify(token, process.env.SECRET_KEY);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(400).json({
          success: false,
          message: "Token expired",
        });
      }

      return res.status(400).json({
        success: false,
        message: "Authentication failed",
      });
    }

    const id = decode.id;
    const user = await User.findUserById(id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.userId = user.id;
    console.log("User:", req.userId);
    req.user = user;
    console.log("SN",req.user.email)

    next();
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({
      success: false,
      message: "Server error during Authentication",
    });
  }
};

exports.isStudent = async (req, res, next) => {
  try {
    const { email } = req.user;

    const user = await User.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User does not exit",
      });
    }

    if (user.accountType !== "Student") {
      return res.status(401).json({
        success: false,
        message: "Protected route for student only",
      });
    }

    next();
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({
      success: false,
      message: "Server error during Role Authentication ",
    });
  }
};

exports.isInstructor = async (req, res, next) => {
  try {
    const { email } = req.user;

    const user = await User.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User does not exit",
      });
    }

    if (user.accountType !== "Instructor") {
      return res.status(401).json({
        success: false,
        message: "Protected route for Instructor only",
      });
    }

    next();
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({
      success: false,
      message: "Server error during Role Authentication ",
    });
  }
};


exports.isAdmin = async (req, res, next) => {
  try {
    const { email } = req.user;

    const user = await User.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User does not exit",
      });
    }

    if (user.accountType !== "Admin") {
      return res.status(401).json({
        success: false,
        message: "Protected route for Admin only",
      });
    }

    next();
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({
      success: false,
      message: "Server error during Role Authentication ",
    });
  }
};

