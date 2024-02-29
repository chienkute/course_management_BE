const router = require("express").Router();
const ctrls = require("../controllers/course");
const { verifyAccessToken, isAdmin } = require("../middleware/verifytoken");
const uploader = require("../config/cloudinary.config");
router.post(
  "/",
  [verifyAccessToken, isAdmin],
  uploader.single("image"),
  ctrls.createCourse
);
router.get("/", ctrls.getAllCouse);
router.get("/:cid", ctrls.getCourse);
router.patch("/:cid", [verifyAccessToken, isAdmin], ctrls.updateCourse);
// router.delete("/:bcid", [verifyAccessToken, isAdmin], ctrls.deleteCategory);
module.exports = router;
