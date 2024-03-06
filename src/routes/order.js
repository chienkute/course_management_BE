const router = require("express").Router();
const ctrls = require("../controllers/order");
const { verifyAccessToken, isAdmin } = require("../middleware/verifytoken");

router.post("/", [verifyAccessToken], ctrls.createOrder);
router.get("/usercourse", [verifyAccessToken], ctrls.getUserOrder);
router.get("/", [verifyAccessToken], ctrls.getUsersOrder);

module.exports = router;
