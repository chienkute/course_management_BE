const ctrls = require("../controllers/statictics");
const { verifyAccessToken, isAdmin } = require("../middleware/verifytoken");
const router = require("express").Router();
router.get("/getorder", [verifyAccessToken, isAdmin], ctrls.getOrderStatistics);
router.get("/gettotal", [verifyAccessToken, isAdmin], ctrls.calculateRevenue);
router.get(
  "/getrevenue",
  [verifyAccessToken, isAdmin],
  ctrls.calculateRevenueByMonth
);
module.exports = router;
