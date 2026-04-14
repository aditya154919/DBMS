const courseProgress = require("../modules/courseProgress");
const Course = require("../modules/course");
const User = require("../modules/user")


exports.createCourseProgress = async(req,res) =>{
    try {
        const {courseId,subSectionId} = req.body;
        const userId = req.userId;

        const user = await User.findUserById(userId);
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found"
            })
        }

        const course = await Course.findCourseById(courseId);
        if(!course){
            return res.status(404).json({
                success:false,
                message:"Course not found"
            })
        }
        
        await courseProgress.createCourseProgress({
            
        })
       
    } catch (error) {
        
    }
}