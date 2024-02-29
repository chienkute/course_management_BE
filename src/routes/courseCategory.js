const router = require("express").Router();
const ctrls = require("../controllers/courseCategory");
const { verifyAccessToken, isAdmin } = require("../middleware/verifytoken");
const uploader = require("../config/cloudinary.config");

router.post(
  "/",
  [verifyAccessToken, isAdmin],
  uploader.single("image"),
  ctrls.createCategory
);
router.get("/", ctrls.getCategories);
router.put("/:bcid", [verifyAccessToken, isAdmin], ctrls.updateCategory);
router.delete("/:bcid", [verifyAccessToken, isAdmin], ctrls.deleteCategory);
module.exports = router;
