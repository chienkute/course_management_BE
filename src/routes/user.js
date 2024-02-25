const router = require("express").Router();
const ctrls = require("../controllers/user");
const { verifyAccessToken, isAdmin } = require("../middleware/verifytoken");
const uploader = require("../config/cloudinary.config");

router.get("/test", ctrls.test);
// router.post("/register", ctrls.register);
// router.post("/login", ctrls.login);
// router.get("/current", verifyAccessToken, ctrls.getCurrent);
// router.post("/refreshtoken", ctrls.refreshAccessToken);
// router.get("/logout", ctrls.logout);
// router.get("/", [verifyAccessToken, isAdmin], ctrls.getUsers);
// router.delete("/", [verifyAccessToken, isAdmin], ctrls.deleteUser);
// router.put(
//   "/update",
//   [verifyAccessToken],
//   uploader.single("avatar"),
//   ctrls.updateUser
// );
// router.put("/cart", [verifyAccessToken], ctrls.updateCart);
// router.put("/remove", [verifyAccessToken], ctrls.removeProduct);
// router.put("/:uid", [verifyAccessToken, isAdmin], ctrls.updateUserByAdmin);

module.exports = router;
