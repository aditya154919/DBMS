const pool = require("../config/Database");

exports.findEnrollement = async({courseId,userId})=>{
    const [row] = await pool.query(
        "select * from course_student where COURSEID = ? AND STUDENTID = ?",
        [courseId,userId]
    );
    return row;
}

exports.enrolleStudent = async({courseId,userId})=>{
    const [row] = await pool.query(
        "insert ignore into course_student (COURSEID, STUDENTID) VALUES (?, ?)",
        [courseId,userId]
    )
    return row[0]
}