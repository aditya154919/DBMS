// const { use } = require("react");
const pool = require("../config/Database");

exports.createCourseProgress = async({courseId,userId}) =>{
    const [row] = await pool.query(
        "insert into course_progress (user_id,course_id) value (?,?)",
        [userId,courseId]
    )
    return row[0]
}

exports.findCourseProgress = async({courseId,userId})=>{
    const [row] = await pool.query(
        "select * from course_progress where user_id = ? AND course_id = ?",
        [userId,courseId]
    )
    return row;
}

exports.updateCourseProgress = async()