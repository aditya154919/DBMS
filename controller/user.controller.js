const User = require("../modules/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
const { verify } = require("../mail-template/verificationlink");

exports.signup = async (req, res) => {
  try {
    console.log("clg", req.body);

    const { firstName, lastName, password, email, accountType, confirmPassword } =
      req.body;


    if (!firstName || !lastName || !password || !email || !accountType || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please fill all details",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const existingUser = await User.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);


    const user = await User.createUser({
      firstName,
      lastName,
      email,
      hashedPassword,
      accountType,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    const userId = user.insertId;


    const token = jwt.sign(
      { id: userId },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );


    await User.updateUserToken(token, userId);

    const html = verify(token);

    await mailSender.sendMail({
      email: email,
      subject: "Verify Your Account",
      html: html,
    });

    return res.status(200).json({
      success: true,
      message: "User created successfully. Please verify your email.",
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Server error during signup",
    });
  }
};

exports.verify = async (req, res) => {
  try {
    console.log("TOKEN",req.params.token)
    const { token } = req.params;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Missing token",
      });
    }

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
        success: true,
        message: "Token verification failed",
      });
    }
    const user = await User.findUserById(decode.id);
    if(!user){
      return res.status(404).json({
        success:false,
        message:"User Not Found"
      })
    }

    
    await User.updateTokenAndIsVerified(null,true,decode.id)

    return res.status(200).json({
      success:true,
      message:"Email verification success"
    })

  } catch (error) {
    console.log("Error",error);
    return res.status(500).json({
      success:false,
      message:"Server error during verification"
    })
  }
};


exports.login = async (req, res) => {
  try {
    console.log("LOGIN FORM", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all details",
      });
    }

    const user = await User.findUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User does not exist",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Password",
      });
    }
    const isAccountVerified = await user.isAccountVerified;

    if(!isAccountVerified){
      return res.status(401).json({
        success:false,
        message:"Verify first"
      })
    }

    const accesstoken = jwt.sign(
      { id: user.id },
      process.env.SECRET_KEY,
      { expiresIn: "20m" }
    );

    const refreshtoken = jwt.sign(
      { id: user.id },
      process.env.SECRET_KEY,
      { expiresIn: "20d" }
    );

    await User.updateUserToken(refreshtoken,user.id);

    

    return res.status(200).json({
      success: true,
      message: "Login Success",
      accesstoken,
      refreshtoken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        accountType: user.accountType,
      },
    });

  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};