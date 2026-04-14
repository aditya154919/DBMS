const pool = require("../config/Database");


exports.addToCart = async ({ userId, course }) => {
  const [cartResult] = await pool.query(
      "INSERT INTO cart(user_id) VALUES (?)",
      [userId]
    );

    
    const cartId = cartResult.insertId;

   
    const [itemResult] = await pool.query(
      "INSERT INTO cart_items(cart_id, course_id) VALUES (?, ?)",
      [cartId, course]
    );

   
    return {
      cartId: cartId,
      courseId: course,
    };
};