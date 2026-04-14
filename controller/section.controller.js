const Course = require("../modules/course");
const Section = require("../modules/section");

exports.createSection = async (req, res) => {
  try {
    const { sectionName, courseId } = req.body;

    console.log("SECTION", req.body);


    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }

    const course = await Course.findCourseById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }


    const section = await Section.insertSection({
      sectionName,
      courseId,
    });

    const sectionId = section.insertId;

    console.log("Section created:", sectionId);


    const fullCourseDetails = await Course.getFullCourseDetails(courseId);


    return res.status(200).json({
      success: true,
      message: "Section created successfully",
      data: fullCourseDetails, 
    });

  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({
      success: false,
      message: "Server error during creating section",
    });
  }
};

exports.getSection = async(req,res) =>{
    try {
        const {id} = req.body;

        const section = await Section.findSectionById(id);
        console.log("section",section)

        if(!section){
            return res.status(400).json({
                success:false,
                message:"Section not found"
            })
        }

        return res.status(200).json({
            success:true,
            message:"Section fetched success",
            data:{
                section:section
            }
        })
    } catch (error) {
        console.log("Server error",error.message);
        return res.status(500).json({
            success:"Server eroor "
        })
    }
}