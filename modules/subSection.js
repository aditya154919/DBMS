const pool = require("../config/Database");


exports.insertSubSection = async({title,timeDuration,description,videoUrl,sectionId})=>{
    const [row] = await pool.query(
        "insert into sub_sections (title,time_duration,description,video_url,section_id) value (?,?,?,?,?)",
        [title,timeDuration,description,videoUrl,sectionId]
    );
    return row[0];

    
}