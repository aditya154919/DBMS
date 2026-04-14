
const cloudinary = require("../config/cloudinary");

exports.uploadImageToCloudinary = async (
  tempFilePath,
  folder,
  height,
  quality
) => {
  const options = {
    folder,
    resource_type: "auto",
  };

  if (height) options.height = height;
  if (quality) options.quality = quality;

  return await cloudinary.uploader.upload(tempFilePath, options);
};
