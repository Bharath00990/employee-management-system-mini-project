const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { validationResult } = require("express-validator");

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    const { name, email, password, role } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }
    const user = await User.create({ name, email, password, role: role || "user" });
    const token = generateToken(user._id, user.role);
    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: { _id: user._id, name: user.name, email: user.email, role: user.role, token },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: "Account is deactivated" });
    }
    const token = generateToken(user._id, user.role);
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: { _id: user._id, name: user.name, email: user.email, role: user.role, token },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };
