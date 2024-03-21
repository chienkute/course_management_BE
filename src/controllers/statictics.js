const Order = require("../models/order");
const asyncHandler = require("express-async-handler");
const getOrderStatistics = asyncHandler(async (req, res) => {
  const cancelledOrders = await Order.countDocuments({ status: "Cancelled" });
  const succeededOrders = await Order.countDocuments({ status: "Succeed" });
  return res.status(200).json({
    success: true,
    succeededOrders,
    cancelledOrders,
  });
});
const calculateRevenue = asyncHandler(async (req, res) => {
  const revenue = await Order.aggregate([
    {
      $match: {
        status: "Succeed", // Chỉ tính doanh thu từ các đơn hàng đã thành công
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$total" },
      },
    },
  ]);
  return res.status(200).json({
    success: true,
    data: revenue.length > 0 ? revenue[0].totalRevenue : 0,
  });
});
const calculateRevenueByMonth = asyncHandler(async (req, res) => {
  const revenueByMonth = await Order.aggregate([
    {
      $match: {
        status: "Succeed", // Chỉ tính doanh thu từ các đơn hàng đã thành công
      },
    },
    {
      $project: {
        month: { $month: { $toDate: "$createdAt" } },
        total: 1,
      },
    },
    {
      $group: {
        _id: "$month",
        totalRevenue: { $sum: "$total" },
      },
    },
  ]);
  return res.status(200).json({
    success: true,
    data: revenueByMonth,
  });
});
module.exports = {
  getOrderStatistics,
  calculateRevenue,
  calculateRevenueByMonth,
};
