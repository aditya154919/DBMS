const pool = require("../config/Database");

exports.createUser = async({firstName,lastName,accountType,hashedPassword,email,image})=>{
    const [res] = await pool.query(
        "insert into users (firstName,lastName,accountType,password,email,image) value (?, ?, ?, ?, ?,?)",
        [firstName,lastName,accountType,hashedPassword,email,image]
    )
    return res;
}

exports.findUserById = async(id)=>{
  const [res] = await pool.query(
    "SELECT * FROM users WHERE id = ?",
    [id]
  )
  return res[0]
}

exports.findUserByEmail = async(email) =>{
    const [res] = await pool.query(
        "select * from users where email = ?",
        [email]
    )
    return res[0];
}

exports.updateUserToken = async (token,id) => {
  const [res] = await pool.query(
    "UPDATE users SET token = ? WHERE id = ?",
    [token, id]
  );
  return res;
};

exports.updateTokenAndIsVerified = async(token,isAccountVerified,id) =>{
  const [rows] = await pool.query(
    "update users set token = ?,isAccountVerified = ? where id = ?",
    [token,isAccountVerified,id]
  );
  return rows;
}

exports.updateOtpDetails = async({email,otp,restPassExpire}) =>{
  const [row] = await pool.query(
    "update users SET resetPassOtp = ?,resetOtpExpire = ? where email = ?",
    [otp,restPassExpire,email]
  )
  return row;
}

exports.changePass = async({email,hashPass}) =>{
  const [row] = await pool.query(
    "update users set password = ? where email = ?",
    [hashPass,email]
  );
   return row;
}
