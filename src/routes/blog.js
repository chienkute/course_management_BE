const ctrls = require("../controllers/blog");
const { verifyAccessToken, isAdmin } = require("../middleware/verifytoken");
const uploader = require("../config/cloudinary.config");
const router = require("express").Router();
router.post(
  "/",
  [verifyAccessToken, isAdmin],
  uploader.single("image"),
  ctrls.createBlog
);
router.get("/", ctrls.getBlogs);
router.get("/:bid", ctrls.getBlog);
router.put(
  "/:bid",
  [verifyAccessToken, isAdmin],
  uploader.single("image"),
  ctrls.updateBlog
);
router.delete("/:bid", [verifyAccessToken, isAdmin], ctrls.deleteBlog);
module.exports = router;
