const Tag = require("../modules/tag");
const User = require("../modules/user");
const Course = require("../modules/course");
require("dotenv").config();
const { uploadImageToCloudinary } = require("../utils/image.uploader");
const pool = require("../config/Database");
const { convertSecondsToDuration } = require("../utils/converTime");
const CourseProgress  = require("../modules/courseProgress")


exports.createCourse = async (req, res) => {
  try {
    console.log("Body Request", req.body);
    console.log("Files", req.files);

    const userId = req.userId;

    let {
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      tag,
      status,
    } = req.body;

    const thumbnail = req.files?.thumbnail;

    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag ||
      !thumbnail
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!status) status = "Draft";

    const instructorDetails = await User.findUserById(userId);
    if (!instructorDetails) {
      return res.status(400).json({
        success: false,
        message: "Instructor not found",
      });
    }


    const tagDetails = await Tag.findTagById(tag);
    if (!tagDetails) {
      return res.status(400).json({
        success: false,
        message: "Tag not found",
      });
    }

    const thumbnailImage = await uploadImageToCloudinary(
      thumbnail.tempFilePath,
      process.env.FOLDER_NAME,
    );

    const course = await Course.insertCourse({
      courseName,
      courseDescription,
      whatYouWillLearn,
      status,
      price,
      instructorDetails: instructorDetails.id,
      tag: tagDetails.id,
      thumbnail: thumbnailImage.secure_url,
    });

    const courseId = course.insertId;

    const fullCourseDetails = await Course.getFullCourseDetails(courseId);
    console.log("course", fullCourseDetails);

    return res.status(200).json({
      success: true,
      message: "Course Created Successfully",
      data: fullCourseDetails,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during creating course",
    });
  }
};

exports.getFullCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body;

    console.log("REQ BODY", req.body);

    const [courseRows] = await pool.query(
      `SELECT 
        c.id,
        c.course_name,
        c.course_description,
        c.price,
        c.thumbnail,
        c.what_you_will_learn,
        c.status,
        c.created_at,

        u.id AS instructor_id,
        u.firstName,
        u.lastName,

        t.id AS tag_id,
        t.name AS tag_name,
        t.description AS tag_description

      FROM courses c
      JOIN users u ON c.instructor_id = u.id
      JOIN tags t ON c.tag_id = t.id
      WHERE c.id = ?`,
      [courseId],
    );

    if (courseRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const course = courseRows[0];

    const [reviews] = await pool.query(
      `SELECT id, rating, review 
       FROM rating_and_review 
       WHERE course_id = ?`,
      [courseId],
    );

    const [students] = await pool.query(
      `SELECT STUDENTID 
       FROM course_student 
       WHERE COURSEID = ?`,
      [courseId],
    );

    const studentEnrolled = students.map((s) => s.STUDENTID);

    const [sectionRows] = await pool.query(
      `SELECT 
        s.id AS section_id,
        s.section_name,

        ss.id AS sub_id,
        ss.title,
        ss.description,
        ss.video_url,
        ss.time_duration

      FROM sections s
      LEFT JOIN sub_sections ss ON s.id = ss.section_id
      WHERE s.course_id = ?`,
      [courseId],
    );

    const sectionMap = {};

    sectionRows.forEach((row) => {
      if (!sectionMap[row.section_id]) {
        sectionMap[row.section_id] = {
          _id: row.section_id,
          sectionName: row.section_name,
          subSection: [],
        };
      }

      if (row.sub_id) {
        sectionMap[row.section_id].subSection.push({
          _id: row.sub_id,
          title: row.title,
          description: row.description,
          videoUrl: row.video_url,
          timeDuration: row.time_duration,
        });
      }
    });

    const courseDetails = {
      _id: course.id,
      courseName: course.course_name,
      courseDescription: course.course_description,
      price: course.price,
      thumbnail: course.thumbnail,
      whatYouWillLearn: course.what_you_will_learn,
      status: course.status,
      createdAt: course.created_at,

      instructor: {
        _id: course.instructor_id,
        firstName: course.firstName,
        lastName: course.lastName,
      },

      tag: {
        _id: course.tag_id,
        name: course.tag_name,
        description: course.tag_description,
      },

      ratingAndReview: reviews,

      studentEnrolled: studentEnrolled,

      courseContent: Object.values(sectionMap),
    };

    return res.status(200).json({
      success: true,
      message: "CourseDetails fetched successfully",
      data: { courseDetails },
    });
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({
      success: false,
      message: "Server error during fetching course details",
    });
  }
};

exports.getInstructorCourse = async (req, res) => {
  try {
    const instructorId = req.userId;

    const instructor = await User.findUserById(instructorId);

    if (!instructor) {
      return res.status(401).json({
        success: false,
        message: "Instructor not found",
      });
    }

    const courseDetails = await Course.findInstructorCourse(instructorId);
    if (!courseDetails)
      ({
        success: false,
        message: "Instructor did not created course yet",
      });

    return res.status(200).json({
      success: true,
      message: "Fetchd success",
      data: courseDetails,
    });
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({
      success: false,
      message: "Server error while getting instructor courses",
    });
  }
};

exports.editCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    const [courseRows] = await pool.query(
      "SELECT * FROM courses WHERE id = ?",
      [courseId],
    );

    if (courseRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    let thumbnailUrl;


    if (req.files?.thumbnail) {
      const thumbnail = req.files.thumbnail;

      const uploadedImage = await uploadImageToCloudinary(
        thumbnail.tempFilePath,
        process.env.FOLDER_NAME,
      );

      thumbnailUrl = uploadedImage.secure_url;
    }

    const allowedUpdates = [
      "courseName",
      "courseDescription",
      "price",
      "whatYouWillLearn",
      "tag_id",
      "status",
    ];

    let updateFields = [];
    let values = [];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        values.push(req.body[field]);
      }
    });

    // add thumbnail if updated
    if (thumbnailUrl) {
      updateFields.push("thumbnail = ?");
      values.push(thumbnailUrl);
    }

    if (updateFields.length > 0) {
      values.push(courseId);

      await pool.query(
        `UPDATE courses SET ${updateFields.join(", ")} WHERE id = ?`,
        values,
      );
    }

    const [rows] = await pool.query(
      `SELECT 
          c.*,
          s.id AS section_id,
          s.section_name,
          ss.id AS sub_id,
          ss.title AS sub_title
       FROM courses c
       LEFT JOIN sections s ON c.id = s.course_id
       LEFT JOIN sub_sections ss ON s.id = ss.section_id
       WHERE c.id = ?`,
      [courseId],
    );

    const course = {
      ...courseRows[0],
      courseContent: [],
    };

    const sectionMap = {};

    rows.forEach((row) => {
      if (!row.section_id) return;

      if (!sectionMap[row.section_id]) {
        sectionMap[row.section_id] = {
          id: row.section_id,
          section_name: row.section_name,
          subSection: [],
        };
        course.courseContent.push(sectionMap[row.section_id]);
      }

      if (row.sub_id) {
        sectionMap[row.section_id].subSection.push({
          id: row.sub_id,
          title: row.sub_title,
        });
      }
    });

    return res.status(200).json({
      success: true,
      message: "Course Updated Successfully",
      data: course,
    });
  } catch (error) {
    console.error("EDIT COURSE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during course update",
    });
  }
};

exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.userId;

    const courses = await Course.getEnrolledCourseById(userId);

    const finalCourses = [];

    for (const course of courses) {
      const sectionData = await Course.getSectionsWithSubsections(course.id);

      const sectionMap = {};
      const sections = [];

      sectionData.forEach((row) => {
        if (!row.section_id) return;

        // create section
        if (!sectionMap[row.section_id]) {
          sectionMap[row.section_id] = {
            id: row.section_id,
            section_name: row.section_name,
            subSections: [],
          };

          sections.push(sectionMap[row.section_id]);
        }

        // add subsection
        if (row.subSection_id) {
          sectionMap[row.section_id].subSections.push({
            id: row.subSection_id,
            title: row.title,
            time_duration: row.time_duration,
            videoUrl: row.video_url,
          });
        }
      });


      let progressPercentage = 0;

      if (course.total_subSection === 0) {
        progressPercentage = 100;
      } else {
        progressPercentage = Math.round(
          (course.completedVideo / course.total_subSection) * 100,
        );
      }

       // object
      finalCourses.push({
        ...course,
        totalTime: convertSecondsToDuration(course.total_duration),
        progressPercentage,
        sections,
      });
    }

    return res.status(200).json({
      success: true,
      data: finalCourses,
    });
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.instructorDashboard = async (req, res) => {
  try {
    const instructorId = req.userId;

    const courses = await Course.instructorDashboard(instructorId);

    const course = courses.map((item) => {
      return {
        _id: item.insertId,
        courseName: item.courseName,
        courseDescription: item.courseDescription,
        totalStudentsEnrolled: item.totalStudentsEnrolled,
        totalEarning: parseInt(item.totalEarning),
      };
    });

    console.log("Course", course);
    return res.status(200).json({
      success: true,
      message: "Success",
      data: course,
    });
  } catch (error) {
    console.log("Server error", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getFullEnrolledCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.userId;


    const [course] = await pool.query(`
      SELECT c.*, u.id as instructor_id
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      WHERE c.id = ?
    `, [courseId]);

    if (course.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Course not found",
      });
    }

    const [ratings] = await pool.query(`
      SELECT *
      FROM rating_and_review
      WHERE course_id = ?
    `, [courseId]);


    const [rows] = await pool.query(`
      SELECT 
        s.id AS section_id, s.section_name AS sectionName,
        ss.id AS sub_section_id, ss.title AS subSectionName,
        ss.title,
        ss.time_duration,
        ss.video_url
      FROM sections s
      LEFT JOIN sub_sections ss ON ss.section_id = s.id
      WHERE s.course_id = ? 
    `, [courseId]);

    
    const sectionMap = {};

    rows.forEach(row => {
      if (!sectionMap[row.section_id]) {
        sectionMap[row.section_id] = {
          _id: row.section_id,
          sectionName:row.sectionName,
          subSection: []
        };
      }

      if (row.sub_section_id) {
        sectionMap[row.section_id].subSection.push({
          _id: row.sub_section_id,
          title: row.title,
          timeDuration: row.time_duration,
          url:row.video_url
        });
      }
    });

    const courseContent = Object.values(sectionMap);


    const [[duration]] = await pool.query(`
      SELECT SUM(CAST(ss.time_duration AS UNSIGNED)) AS total_duration
      FROM sections s
      JOIN sub_sections ss ON ss.section_id = s.id
      WHERE s.course_id = ?
    `, [courseId]);


    const [completed] = await pool.query(`
      SELECT subSection_id
      FROM course_progress
      WHERE course_id = ? AND user_id = ? AND subSection_id is NOT NUll
    `, [courseId, userId]);

    const completedVideos = completed.map(c => c.subSection_id);

    return res.status(200).json({
      success: true,
      data: {
        courseDetails: {
          ...course[0],
          instructor: {
            _id: course[0].instructor_id,
            name: course[0].name
          },
          courseContent,
          ratingAndReview: ratings
        },
        totalDuration: duration.total_duration,
        completedVideos
      }
    });

  } catch (error) {
    console.log("Server error",error)
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
