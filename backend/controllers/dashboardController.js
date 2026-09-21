const Employee = require("../models/Employee");

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
const getStats = async (req, res, next) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ status: "Active" });
    const departments = await Employee.distinct("department");
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newEmployees = await Employee.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    const prevTotal = await Employee.countDocuments({ createdAt: { $lt: thirtyDaysAgo } });
    const totalChange = prevTotal > 0 ? (((totalEmployees - prevTotal) / prevTotal) * 100).toFixed(1) : 100;

    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        activeEmployees,
        departments: departments.length,
        newEmployees,
        totalChange: parseFloat(totalChange),
        activePercentage: totalEmployees > 0 ? ((activeEmployees / totalEmployees) * 100).toFixed(1) : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get department distribution
// @route   GET /api/dashboard/department-distribution
// @access  Private
const getDepartmentDistribution = async (req, res, next) => {
  try {
    const distribution = await Employee.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $project: { name: "$_id", value: "$count", _id: 0 } },
      { $sort: { value: -1 } },
    ]);
    res.status(200).json({ success: true, data: distribution });
  } catch (error) {
    next(error);
  }
};

// @desc    Get employee growth (last 6 months)
// @route   GET /api/dashboard/employee-growth
// @access  Private
const getEmployeeGrowth = async (req, res, next) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const growth = await Employee.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const result = [];
    let cumulative = await Employee.countDocuments({ createdAt: { $lt: sixMonthsAgo } });

    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - 5 + i);
      const month = d.getMonth() + 1;
      const year = d.getFullYear();
      const found = growth.find((g) => g._id.month === month && g._id.year === year);
      cumulative += found ? found.count : 0;
      result.push({ month: months[month - 1], employees: cumulative, new: found ? found.count : 0 });
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc    Get employee status breakdown
// @route   GET /api/dashboard/status-breakdown
// @access  Private
const getStatusBreakdown = async (req, res, next) => {
  try {
    const breakdown = await Employee.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { status: "$_id", count: 1, _id: 0 } },
    ]);
    res.status(200).json({ success: true, data: breakdown });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats, getDepartmentDistribution, getEmployeeGrowth, getStatusBreakdown };
