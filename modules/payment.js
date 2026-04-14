const pool  = require("../config/Database");


exports.createPayment = async({user_id,amount,payment_method,payment_status,transaction_id})=>{
    const [row] = await pool.query(
        "insert into payments (user_id,amount,payment_method,payment_status,transaction_id) value (?,?,?,?,?)",
        [user_id,amount,payment_method,payment_status,transaction_id]
    )
    return row;
}

exports.createCoursePayment = async({paymentId,courseId})=>{
    const [rows] = await pool.query(
        "insert into payment_courses (payment_id,course_id) value (?,?)",
        [paymentId,courseId]
    );
    return rows[0];
}