const pool = require("../config/Database");

exports.insertSection = async ({ sectionName, courseId }) => {
  const [row] = await pool.query(
    "insert into sections (section_name,course_id) value (?,?)",
    [sectionName, courseId],
  );
  return row;
};

exports.findSectionById = async (id) => {
  const [rows] = await pool.query("select * from sections where id = ?", [id]);
  return rows[0];
};

exports.updatedSectionsById = async (id) => {
  const [rows] = await pool.query(
    `SELECT s.id as section_id, s.section_name,
            ss.id as sub_id, ss.title, ss.video_url, ss.time_duration
     FROM sections s
     LEFT JOIN sub_sections ss
     ON s.id = ss.section_id
     WHERE s.id = ?`,
    [id]
  );

  if (rows.length === 0) return null;

  const section = {
    id: rows[0].section_id,
    section_name: rows[0].section_name,
    subSections: []
  };

  rows.forEach(row => {
    if (row.sub_id) {
      section.subSections.push({
        id: row.sub_id,
        title: row.title,
        videoUrl: row.video_url,
        timeDuration: row.time_duration
      });
    }
  });

  return section;
};
