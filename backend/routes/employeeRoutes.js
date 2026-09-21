const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { getEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee } = require("../controllers/employeeController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/roleMiddleware");

const employeeValidation = [
  body("firstName").trim().notEmpty().withMessage("First name is required"),
  body("lastName").trim().notEmpty().withMessage("Last name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("phone").trim().notEmpty().withMessage("Phone is required"),
  body("department").notEmpty().withMessage("Department is required"),
  body("position").trim().notEmpty().withMessage("Position is required"),
  body("joiningDate").notEmpty().withMessage("Joining date is required"),
  body("status").isIn(["Active", "Inactive", "On Leave"]).withMessage("Invalid status"),
];

router.get("/", protect, getEmployees);
router.get("/:id", protect, getEmployee);
router.post("/", protect, adminOnly, employeeValidation, createEmployee);
router.put("/:id", protect, adminOnly, updateEmployee);
router.delete("/:id", protect, adminOnly, deleteEmployee);

module.exports = router;
