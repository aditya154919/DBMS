// const { use } = require("react");
const { instance } = require("../config/razorpay");
const Course = require("../modules/course");
const enrollement = require("../modules/course_Student");
const crypto = require("crypto");
const courseProgress = require("../modules/courseProgress");
const User = require("../modules/user");
const mailSender = require("../utils/mailSender");
const Payment = require("../modules/payment")
const {courseEnrollmentEmail} = require("../mail-template/courseEnrollementEmial")
require("dotenv").config();

// exports.createOrder = async (req, res) => {
//   try {
//     const courses = req.body.map((item) => item.courseId);
//     const userId = req.userId;

//     if (!courses || courses.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Courses required",
//       });
//     }

//     let totalAmount = 0;

//     for (const courseId of courses) {
//       const course = await Course.findCourseById(courseId);

//       if (course.length === 0) {
//         return res.status(404).json({
//           success: false,
//           message: "Course not found",
//         });
//       }

//       const alreadyEnrolled = await enrollement.findEnrollement({
//         courseId,
//         userId,
//       });

//       if (alreadyEnrolled.length > 0) {
//         return res.status(400).json({
//           success: false,
//           message: "Already Enrolled",
//         });
//       }

//       totalAmount = course.price;
//     }

//     const options = {
//       amount: totalAmount * 100, // paise
//       currency: "INR",
//       receipt: `receipt_${Date.now()}`,
//     };

//     const paymentresponse = await instance.orders.create(options);


//     return res.status(200).json({
//       success: true,
//       message: "Order created success",
//       data: paymentresponse,
//     });
//   } catch (error) {
//     console.error("capturePayment error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error while capturing payment",
//     });
//   }
// };


exports.createOrder = async (req, res) => {
  try {
    console.log("hello",req.body)
    const courses = req.body.map((item) => item.courseId);
    const userId = req.userId;
    

    if (!courses || courses.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Courses required",
      });
    }

    let totalAmount = 0;

    for (const courseId of courses) {
      const course = await Course.findCourseById(courseId);

      if (!course || course.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      const courseData = course; 

      const alreadyEnrolled = await enrollement.findEnrollement({
        courseId,
        userId,
      });

      if (alreadyEnrolled.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Already Enrolled",
        });
      }

      totalAmount += courseData.price; 
    }

    console.log("TOTAL AMOUNT:", totalAmount); 

    const options = {
      amount: totalAmount * 100, // paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const paymentresponse = await instance.orders.create(options);

    console.log("RAZORPAY ORDER:", paymentresponse); 

    return res.status(200).json({
      success: true,
      message: "Order created success",
      data: paymentresponse,
    });

  } catch (error) {
    console.error("capturePayment error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while capturing payment",
    });
  }
};
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courses,
      amount
    } = req.body;

    const userId = req.userId;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !courses ||
      !userId
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
      .update(body.toString())
      .digest("hex");

    if (razorpay_signature === expectedSignature) {

      const payment = await instance.payments.fetch(razorpay_payment_id);

     const paymentResult =    await Payment.createPayment({
        user_id: userId,
        amount: payment.amount / 100,
        payment_method: payment.method,
        payment_status: payment.status,
        transaction_id: razorpay_payment_id,
      });

      const paymentId = paymentResult.insertId;

      for(const item of courses){
        const courseId = typeof item === "string" ? item : item.courseId;
        
        await Payment.createCoursePayment({
            paymentId:paymentId,
            courseId:courseId
        })
      }
      await enrolledSutdents(courses, userId, res);

      return res.status(200).json({
        success: true,
        message: "Payment verified & enrollment successful",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Payment verification failed",
    });

  } catch (error) {
    console.log("Error in verifyPayment:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const enrolledSutdents = async (courses, userId, res) => {
  try {
    for (const item of courses) {
      const courseId = typeof item === "string" ? item : item.courseId;

      const enroll = await enrollement.enrolleStudent({ courseId, userId });

      await courseProgress.createCourseProgress({ courseId, userId });

      const user = await User.findUserById(userId);

      const course = await Course.findCourseById(courseId);

      await mailSender.sendMail({
        email: user.email,
        subject: "Successfully Enrolled",
        html: courseEnrollmentEmail(course.course_name, user.firstName),
      });
    }

    return true;
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Enrollment failed",
    });
  }
};


