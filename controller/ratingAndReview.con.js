const CourseStudent = require("../modules/course_Student");
const RatingAndReview = require("../modules/ratingAndReview");
const Course = require("../modules/course")

exports.createRatingAndReview = async (req, res) => {
  try {
    const userId = req.userId;
    const { courseId, rating, review } = req.body;

    const course = await Course.findCourseById(courseId);

    if(!course){
        return res.status(400).json({
            success:false,
            message:"Course Not Found"
        })
    }

    const enrolledStudent = await CourseStudent.findEnrollement({
      courseId,
      userId,
    });

    if (enrolledStudent.length === 0) {
      return res.status(403).json({
        success: false,
        message: "User is not enrolled in this course",
      });
    }

    const alreadyReview = await RatingAndReview.findRatingAndReview({
      userId,
      courseId,
    });

    if (alreadyReview.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Already reviewed",
      });
    }

    const rating_and_review = await RatingAndReview.insertRatingAndReview({
      userId,
      courseId,
      rating,
      review,
    });

    return res.status(200).json({
      success: true,
      message: "Rating and review created successfully",
      data: {
        rating_and_review: rating_and_review,
      },
    });
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({
      success: false,
      message: "Server error during creating review",
    });
  }
};

exports.getRatingAndReview = async(req,res)=>{
  try {
    
    const ratingAndReview = await RatingAndReview.getAllRAR();
    console.log("RAR",ratingAndReview)

    if(ratingAndReview.length < 0){
      return res.status(404).json({
        success:false,
        message:"No rating is found"
      })
    }

    return res.status(200).json({
      success:true,
      message:"RAR found success",
      data:ratingAndReview
    })
  } catch (error) {
    console.log("Server error",error);
    return res.status(500).json({
      success:false,
      message:"Server error"
    })
  }
}
