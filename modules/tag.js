const pool = require("../config/Database");

exports.insertTag = async({name,description})=>{
    const [res] = await pool.query(
        "insert into tags (name, description) value (?,?)",
        [name,description]
    )
    return res;
}

exports.findTagById = async(id) =>{
    const [row] = await pool.query(
        "select * from tags where id = ?",
        [id]
    );
    return row[0];
}

exports.getAllTags = async() =>{
    const [col] = await pool.query(
        "select * from tags"
    )
    return col;
}

exports.findAndDelete = async(id) =>{
    const [result] = await pool.query(
    "DELETE FROM tags WHERE id = ?",
    [id]
  );

  return result;
}