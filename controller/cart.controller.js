const Course = require("../modules/course");
const Cart = require("../modules/cart");

exports.addToCart = async (req, res) => {
  try {
    const userId = req.userId;

    const {courses} = req.body;

    let addedToCart = [];

    for (const courseId of courses) {
      const course = await Course.findCourseById(courseId);

      if (!course  || course.length === 0) {
        return res.this.status(400).json({
          success: false,
          message: "Course not found",
        });
      }

      const cart = await Cart.addToCart({ userId, course: courseId });

      addedToCart.push(cart);
    }

    return res.status(200).json({
      success: true,
      message: "Added to cart successfully",
      data: addedToCart,
    });
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
