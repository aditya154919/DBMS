const pool = require("../config/Database");


exports.findRatingAndReview = async({userId,courseId})=>{
    const [row] = await pool.query(
        "select * from rating_and_review WHERE user_id = ? AND course_id = ?",
        [userId,courseId]
    );
    return row
}

exports.insertRatingAndReview = async({userId,courseId,rating,review})=>{
    const [result] = await pool.query(
      `INSERT INTO rating_and_review 
      (user_id, course_id, rating, review)
      VALUES (?, ?, ?, ?)`,
      [userId, courseId, rating, review]
    );
}

exports.getAllRAR = async()=>{
    const [row] = await pool.query(
        `select u.*,RAR.*,c.*
         from users u
         inner join  rating_and_review  RAR
         on u.id = RAR.user_id
         inner join courses c
         on RAR.course_id = c.id
        `
    )

    return row;
}