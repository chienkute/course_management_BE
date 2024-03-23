const router = require("express").Router();
const ctrls = require("../controllers/user");
const ctrl = require("../controllers/userCourse");
const { verifyAccessToken, isAdmin } = require("../middleware/verifytoken");
const uploader = require("../config/cloudinary.config");

router.post("/register", ctrls.register);
router.post("/login", ctrls.login);
router.post("/changepassword", [verifyAccessToken], ctrls.updatePassword);
router.get("/current", verifyAccessToken, ctrls.getUser);
router.get("/course/:cid", verifyAccessToken, ctrl.getCourseUser);
router.get("/cart/:cid", verifyAccessToken, ctrl.getCourseCart);
router.get("/", [verifyAccessToken, isAdmin], ctrls.getUsers);
router.delete("/:uid", [verifyAccessToken, isAdmin], ctrls.deleteUser);
router.put(
  "/update",
  [verifyAccessToken],
  uploader.single("avatar"),
  ctrls.updateUser
);
router.put("/cart", [verifyAccessToken], ctrls.updateCart);
router.put("/remove", [verifyAccessToken], ctrls.removeCourse);
router.put("/:uid", [verifyAccessToken, isAdmin], ctrls.updateUserByAdmin);

module.exports = router;
