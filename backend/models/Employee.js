const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      unique: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Invalid email"],
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "Prefer not to say"],
      default: "Prefer not to say",
    },
    dateOfBirth: {
      type: Date,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      enum: ["Engineering", "HR", "Finance", "Marketing", "Sales", "Operations", "Design", "Legal"],
    },
    position: {
      type: String,
      required: [true, "Position is required"],
      trim: true,
    },
    salary: {
      type: Number,
      min: [0, "Salary cannot be negative"],
    },
    joiningDate: {
      type: Date,
      required: [true, "Joining date is required"],
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "On Leave"],
      default: "Active",
    },
    address: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Auto-generate employee ID before saving
// Hash password before saving
// Auto-generate employee ID and hash password before saving
employeeSchema.pre("save", async function () {
  // Generate employee ID if it doesn't exist
  if (!this.employeeId) {
    const count = await mongoose.model("Employee").countDocuments();
    this.employeeId = `EMP${String(count + 1).padStart(4, "0")}`;
  }

  // Hash password if it was modified
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

// Indexes
employeeSchema.index({ email: 1 });
employeeSchema.index({ department: 1 });
employeeSchema.index({ status: 1 });
employeeSchema.index({ firstName: "text", lastName: "text", email: "text" });

module.exports = mongoose.model("Employee", employeeSchema);
