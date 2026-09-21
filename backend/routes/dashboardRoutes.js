const express = require("express");
const router = express.Router();
const { getStats, getDepartmentDistribution, getEmployeeGrowth, getStatusBreakdown } = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");

router.get("/stats", protect, getStats);
router.get("/department-distribution", protect, getDepartmentDistribution);
router.get("/employee-growth", protect, getEmployeeGrowth);
router.get("/status-breakdown", protect, getStatusBreakdown);

module.exports = router;
