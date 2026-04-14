const Section = require("../modules/section");
const SubSection = require("../modules/subSection");
const { uploadImageToCloudinary } = require("../utils/image.uploader");


exports.createSubSection = async (req, res) => {
  try {
    const { title, description, sectionId } = req.body;
    const video = req?.files?.vedio;

    console.log("Formdata", req.body);
    console.log("Video", video);

    if (!title || !description || !sectionId || !video) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }
    const id = sectionId;

    const section = await Section.findSectionById(sectionId);
    if (!section) {
      return res.status(400).json({
        success: false,
        message: "Section not found",
      });
    }

    const videoUploader = await uploadImageToCloudinary(
      video.tempFilePath,
      process.env.FOLDER_NAME,
    );

    const subSection = await SubSection.insertSubSection({
      title,
      timeDuration: videoUploader.duration,
      description,
      videoUrl: videoUploader.secure_url,
      sectionId,
    });

    const updatedSectios = await Section.updatedSectionsById(id);

    return res.status(200).json({
      success: true,
      message: "SubSection Created success",
      data: updatedSectios
    });
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({
      success: false,
      message: "Server error during creating subsection",
    });
  }
};
