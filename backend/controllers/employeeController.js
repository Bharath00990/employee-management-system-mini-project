const Employee = require("../models/Employee");
const { validationResult } = require("express-validator");

// @desc    Get all employees (with search, filter, pagination)
// @route   GET /api/employees
// @access  Private
const getEmployees = async (req, res, next) => {
  try {
    const { search, department, status, page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
        { position: { $regex: search, $options: "i" } },
      ];
    }
    if (department && department !== "all") query.department = department;
    if (status && status !== "all") query.status = status;

    const total = await Employee.countDocuments(query);
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const sortObj = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const employees = await Employee.find(query).sort(sortObj).skip(skip).limit(limitNum);

    res.status(200).json({
      success: true,
      data: { employees, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private
const getEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
};

// @desc    Create employee
// @route   POST /api/employees
// @access  Private/Admin
const createEmployee = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    const emailExists = await Employee.findOne({ email: req.body.email });
    if (emailExists) {
      return res.status(409).json({ success: false, message: "Email already in use by another employee" });
    }
    const employee = await Employee.create(req.body);
    res.status(201).json({ success: true, message: "Employee created successfully", data: employee });
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private/Admin
const updateEmployee = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    let employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    // Check if email is taken by another employee
    if (req.body.email && req.body.email !== employee.email) {
      const emailExists = await Employee.findOne({ email: req.body.email, _id: { $ne: req.params.id } });
      if (emailExists) {
        return res.status(409).json({ success: false, message: "Email already in use by another employee" });
      }
    }
    employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, message: "Employee updated successfully", data: employee });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private/Admin
const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    await Employee.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Employee deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee };
