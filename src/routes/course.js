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
router.put("/chapter/:cid", [verifyAccessToken, isAdmin], ctrls.updateChapter);
router.put(
  "/removechapter/:cid",
  [verifyAccessToken, isAdmin],
  ctrls.removeChapter
);
router.put("/ratings", [verifyAccessToken], ctrls.ratings);
router.post("/videos/:cid", [verifyAccessToken], ctrls.countVideoCompelete);
router.get("/:cid", ctrls.getCourse);
router.put(
  "/:cid",
  [verifyAccessToken, isAdmin],
  uploader.single("image"),
  ctrls.updateCourse
);
router.delete("/:cid", [verifyAccessToken, isAdmin], ctrls.deleteCourse);
module.exports = router;
