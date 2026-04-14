const pool = require("../config/Database");

exports.insertCourse = async ({
  courseName,
  courseDescription,
  whatYouWillLearn,
  status,
  price,
  instructorDetails,
  tag,
  thumbnail,
}) => {
  const [row] = await pool.query(
    "insert into courses (course_name,course_description,instructor_id,what_you_will_learn,price,thumbnail,tag_id,status) value (?,?,?,?,?,?,?,?)",
    [
      courseName,
      courseDescription,
      instructorDetails,
      whatYouWillLearn,
      price,
      thumbnail,
      tag,
      status,
    ],
  );
  return row;
};

exports.findCourseById = async (id) => {
  const [row] = await pool.query("select * from courses where id = ?", [id]);
  return row[0];
};

exports.findInstructorCourse = async (instructorId) => {
  const [row] = await pool.query(
    "select * from courses where instructor_id = ? order by created_at desc",
    [instructorId],
  );
  return row;
};

exports.getFullCourseDetails = async (courseId) => {
  try {
    // ✅ Course + Instructor + Tag
    const [course] = await pool.query(
      `
  SELECT c.*,
         u.id AS instructorId,
         CONCAT(u.firstName, ' ', u.lastName) AS instructorName,
         u.email,
         t.id AS tagId,
         t.name AS tagName
  FROM courses c
  LEFT JOIN users u ON c.instructor_id = u.id
  LEFT JOIN tags t ON c.tag_id = t.id
  WHERE c.id = ?
  `,
      [courseId],
    );

    if (!course.length) return null;

    // ✅ Sections
    const [sections] = await pool.query(
      `SELECT * FROM sections WHERE course_id = ?`,
      [courseId],
    );

    // ✅ Get all section IDs
    const sectionIds = sections.map((sec) => sec.id);

    // ✅ Subsections (FIXED 🔥)
    let subsections = [];

    if (sectionIds.length > 0) {
      const [rows] = await pool.query(
        `SELECT * FROM sub_sections WHERE section_id IN (?)`,
        [sectionIds],
      );
      subsections = rows;
    }

    // ✅ Ratings
    const [ratings] = await pool.query(
      `SELECT * FROM rating_and_review WHERE course_id = ?`,
      [courseId],
    );

    // ✅ Students
    const [students] = await pool.query(
      `SELECT * FROM course_student WHERE COURSEID = ?`,
      [courseId],
    );

    // ✅ Merge Sections + Subsections
    const courseContent = sections.map((section) => ({
      ...section,
      subsections: subsections.filter((sub) => sub.section_id === section.id),
    }));

    return {
      ...course[0],

      instructor: {
        id: course[0].instructorId,
        name: course[0].instructorName,
        email: course[0].email,
      },

      tag: {
        id: course[0].tagId,
        name: course[0].tagName,
      },

      courseContent,
      ratingAndReview: ratings,
      studentEnrolled: students,
    };
  } catch (error) {
    console.error("Error in getFullCourseDetails:", error);
    return null;
  }
};

exports.getEnrolledCourseById = async (userId) => {
  const [row] = await pool.query(
    `select c.*,
      sum(ss.time_duration) AS total_duration,
      count(distinct ss.id) AS total_subSection,
      count(distinct cp.subSection_id) As completedVideo
      

      from course_student as cs
      join courses c on c.id = cs.COURSEID
      left join sections s on s.course_id = c.id
      left join sub_sections ss on ss.section_id = s.id
      left join course_progress cp on  cp.subSection_id  = ss.id AND cp.user_id = cs.STUDENTID

      where cs.STUDENTID = ?
      group by c.id
    `,
    [userId],
  );
  return row;
};

exports.getSectionsWithSubsections = async (courseId) => {
  const [rows] = await pool.query(
    `SELECT 
        s.id AS section_id,
        s.section_name,

        ss.id AS subSection_id,
        ss.title,
        ss.time_duration,
        ss.video_url

     FROM sections s

     LEFT JOIN sub_sections ss 
       ON ss.section_id = s.id

     WHERE s.course_id = ?`,
    [courseId],
  );

  return rows;
};

exports.instructorDashboard = async (instructorId) => {
  const [row] = await pool.query(
    ` select 
      c.id AS _id,
      c.course_name AS courseName,
      c.course_description AS courseDescription,
      COUNT(cs.STUDENTID) AS totalStudentsEnrolled,
      COUNT(cs.STUDENTID) * c.price AS totalEarning
    from courses c
    left join course_student cs
    on c.id = cs.COURSEID
    where c.instructor_id = ?
    group by c.id 
   `,
    [instructorId],
  );
  return row;
};
