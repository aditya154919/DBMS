const express = require("express");
const { authMiddleware, isAdmin } = require("../middleware/Auth.middle");
const { createTag, deleteTag, getTag, tagPageDetails } = require("../controller/tag.controller");
const routes = express.Router();

routes.post("/createTag",authMiddleware,isAdmin,createTag);
routes.delete("/deleteTag",authMiddleware,isAdmin,deleteTag);
routes.post("/getAllTag",getTag)
routes.post("/tagPageDetails",tagPageDetails)

module.exports = routes;