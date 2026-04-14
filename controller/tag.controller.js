const Tag = require("../modules/tag");
const pool = require("../config/Database");
exports.createTag = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "please fill all details",
      });
    }

    const tag = await Tag.insertTag({
      name,
      description,
    });

    return res.status(200).json({
      success: true,
      message: "Tag created success",
      data: {
        id: tag.insertId,
        name,
        description,
      },
    });
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({
      success: false,
      message: "Server error durnig creatng tag",
    });
  }
};

exports.deleteTag = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "please enter id",
      });
    }

    const tag = await Tag.findTagById(id);

    await Tag.findAndDelete(id);

    return res.status(200).json({
      success: false,
      message: "Tag deleted success",
    });
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({
      success: false,
      message: "Server error during deleting tag",
    });
  }
};

exports.getTag = async (req, res) => {
  try {
    const AllTags = await Tag.getAllTags();

    return res.status(200).json({
      success: true,
      message: "Tag fetched success",
      data: AllTags,
    });
  } catch (error) {
    console.log("Server error", error.message);
    return res.status(500).json({
      success: false,
      message: "SERVER ERROR",
    });
  }
};



exports.tagPageDetails = async (req, res) => {
  try {
    const { tagId } = req.body;

  
    const tagDetails = await Tag.findTagById(tagId);

    if (!tagDetails) {
      return res.status(404).json({
        success: false,
        message: "Tag not found",
      });
    }


    const [rows] = await pool.query(
      `SELECT 
        c.id AS course_id,
        c.course_name,
        c.course_description,
        c.price,
        c.thumbnail,
        c.what_you_will_learn,
        c.status,

        u.id AS instructor_id,
        u.firstName,
        u.lastName,

        r.id AS review_id,
        r.rating,
        r.review

      FROM courses c
      JOIN users u ON c.instructor_id = u.id
      LEFT JOIN rating_and_review r ON c.id = r.course_id
      WHERE c.tag_id = ?`,
      [tagId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No courses found for this tag",
      });
    }


    const courseMap = {};

    rows.forEach((row) => {
      if (!courseMap[row.course_id]) {
        courseMap[row.course_id] = {
          _id: row.course_id,
          courseName: row.course_name,
          courseDescription: row.course_description,
          price: row.price,
          thumbnail: row.thumbnail,
          whatYouWillLearn: row.what_you_will_learn,
          status: row.status,

          instructor: {
            _id: row.instructor_id,
            firstName: row.firstName,
            lastName: row.lastName,
          },

          ratingAndReview: [],
        };
      }

      if (row.review_id) {
        courseMap[row.course_id].ratingAndReview.push({
          _id: row.review_id,
          rating: row.rating,
          review: row.review,
        });
      }
    });

    const selectedTagCourse = {
      _id: tagDetails.id,
      name: tagDetails.name,
      description: tagDetails.description,
      course: Object.values(courseMap),
    };

   
    const [tags] = await pool.query(
      "SELECT * FROM tags WHERE id != ?",
      [tagId]
    );

    if (tags.length === 0) {
      return res.status(200).json({
        success: true,
        data: { selectedTagCourse, differentCourses: null },
      });
    }

    const randomTag =
      tags[Math.floor(Math.random() * tags.length)];

  
    const [diffRows] = await pool.query(
      `SELECT 
        c.id AS course_id,
        c.course_name,
        c.course_description,
        c.price,
        c.thumbnail,
        c.what_you_will_learn,
        c.status,

        u.id AS instructor_id,
        u.firstName,
        u.lastName,

        r.id AS review_id,
        r.rating,
        r.review

      FROM courses c
      JOIN users u ON c.instructor_id = u.id
      LEFT JOIN rating_and_review r ON c.id = r.course_id
      WHERE c.tag_id = ?`,
      [randomTag.id]
    );

    const diffMap = {};

    diffRows.forEach((row) => {
      if (!diffMap[row.course_id]) {
        diffMap[row.course_id] = {
          _id: row.course_id,
          courseName: row.course_name,
          courseDescription: row.course_description,
          price: row.price,
          thumbnail: row.thumbnail,
          whatYouWillLearn: row.what_you_will_learn,
          status: row.status,

          instructor: {
            _id: row.instructor_id,
            firstName: row.firstName,
            lastName: row.lastName,
          },

          ratingAndReview: [],
        };
      }

      if (row.review_id) {
        diffMap[row.course_id].ratingAndReview.push({
          _id: row.review_id,
          rating: row.rating,
          review: row.review,
        });
      }
    });

    const differentCourses = {
      _id: randomTag.id,
      name: randomTag.name,
      description: randomTag.description,
      course: Object.values(diffMap),
    };

    
    return res.status(200).json({
      success: true,
      data: {
        selectedTagCourse,
        differentCourses,
      },
    });

  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({
      success: false,
      message: "Server error during getting tag based courses",
    });
  }
};