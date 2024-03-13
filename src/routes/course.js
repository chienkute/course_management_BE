const router = require("express").Router();
const ctrls = require("../controllers/course");
const { verifyAccessToken, isAdmin } = require("../middleware/verifytoken");
const uploader = require("../config/cloudinary.config");
const uploadvideo = require("../config/uploadvideo.config");
router.post(
  "/",
  [verifyAccessToken, isAdmin],
  uploader.single("image"),
  ctrls.createCourse
);
router.get("/", ctrls.getAllCouse);
router.put("/chapter/:cid", [verifyAccessToken, isAdmin], ctrls.updateChapter);
router.put("/ratings", [verifyAccessToken], ctrls.ratings);
router.get("/:cid", ctrls.getCourse);
router.put("/:cid", [verifyAccessToken, isAdmin], ctrls.updateCourse);
// router.delete("/:bcid", [verifyAccessToken, isAdmin], ctrls.deleteCategory);
module.exports = router;
