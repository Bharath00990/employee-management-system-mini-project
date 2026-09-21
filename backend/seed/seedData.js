const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const User = require("../models/User");
const Employee = require("../models/Employee");

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected for seeding...");
};

const users = [
  { name: "Admin User", email: "admin@ems.com", password: "Admin@123", role: "admin" },
  { name: "John Manager", email: "john@ems.com", password: "User@123", role: "user" },
];

const employees = [
  { firstName: "Alice", lastName: "Johnson", email: "alice.johnson@company.com", phone: "+1-555-0101", gender: "Female", dateOfBirth: new Date("1990-04-15"), department: "Engineering", position: "Senior Software Engineer", salary: 95000, joiningDate: new Date("2021-03-01"), status: "Active", address: "123 Tech Street, San Francisco, CA 94105", profileImage: "https://i.pravatar.cc/150?img=1" },
  { firstName: "Bob", lastName: "Smith", email: "bob.smith@company.com", phone: "+1-555-0102", gender: "Male", dateOfBirth: new Date("1988-07-22"), department: "Engineering", position: "Full Stack Developer", salary: 85000, joiningDate: new Date("2020-06-15"), status: "Active", address: "456 Code Ave, Austin, TX 78701", profileImage: "https://i.pravatar.cc/150?img=3" },
  { firstName: "Carol", lastName: "Williams", email: "carol.williams@company.com", phone: "+1-555-0103", gender: "Female", dateOfBirth: new Date("1992-11-08"), department: "HR", position: "HR Manager", salary: 72000, joiningDate: new Date("2019-09-01"), status: "Active", address: "789 People Blvd, New York, NY 10001", profileImage: "https://i.pravatar.cc/150?img=5" },
  { firstName: "David", lastName: "Brown", email: "david.brown@company.com", phone: "+1-555-0104", gender: "Male", dateOfBirth: new Date("1985-02-14"), department: "Finance", position: "Financial Analyst", salary: 78000, joiningDate: new Date("2018-11-20"), status: "Active", address: "321 Money Lane, Chicago, IL 60601", profileImage: "https://i.pravatar.cc/150?img=7" },
  { firstName: "Emma", lastName: "Davis", email: "emma.davis@company.com", phone: "+1-555-0105", gender: "Female", dateOfBirth: new Date("1994-06-30"), department: "Marketing", position: "Marketing Specialist", salary: 65000, joiningDate: new Date("2022-01-10"), status: "Active", address: "654 Brand Street, Seattle, WA 98101", profileImage: "https://i.pravatar.cc/150?img=9" },
  { firstName: "Frank", lastName: "Miller", email: "frank.miller@company.com", phone: "+1-555-0106", gender: "Male", dateOfBirth: new Date("1987-09-05"), department: "Sales", position: "Sales Manager", salary: 88000, joiningDate: new Date("2017-05-15"), status: "Active", address: "987 Sales Dr, Boston, MA 02101", profileImage: "https://i.pravatar.cc/150?img=11" },
  { firstName: "Grace", lastName: "Wilson", email: "grace.wilson@company.com", phone: "+1-555-0107", gender: "Female", dateOfBirth: new Date("1991-12-18"), department: "Engineering", position: "DevOps Engineer", salary: 92000, joiningDate: new Date("2021-08-01"), status: "On Leave", address: "147 Cloud Road, Denver, CO 80201", profileImage: "https://i.pravatar.cc/150?img=13" },
  { firstName: "Henry", lastName: "Taylor", email: "henry.taylor@company.com", phone: "+1-555-0108", gender: "Male", dateOfBirth: new Date("1986-03-25"), department: "Finance", position: "CFO", salary: 150000, joiningDate: new Date("2016-02-01"), status: "Active", address: "258 Executive Way, Los Angeles, CA 90001", profileImage: "https://i.pravatar.cc/150?img=15" },
  { firstName: "Iris", lastName: "Anderson", email: "iris.anderson@company.com", phone: "+1-555-0109", gender: "Female", dateOfBirth: new Date("1993-08-11"), department: "Marketing", position: "Content Strategist", salary: 62000, joiningDate: new Date("2022-06-20"), status: "Active", address: "369 Creative Blvd, Portland, OR 97201", profileImage: "https://i.pravatar.cc/150?img=17" },
  { firstName: "James", lastName: "Thomas", email: "james.thomas@company.com", phone: "+1-555-0110", gender: "Male", dateOfBirth: new Date("1989-05-07"), department: "Sales", position: "Sales Representative", salary: 55000, joiningDate: new Date("2023-03-15"), status: "Active", address: "741 Prospect Ave, Miami, FL 33101", profileImage: "https://i.pravatar.cc/150?img=19" },
  { firstName: "Kate", lastName: "Jackson", email: "kate.jackson@company.com", phone: "+1-555-0111", gender: "Female", dateOfBirth: new Date("1995-01-28"), department: "HR", position: "Recruitment Specialist", salary: 60000, joiningDate: new Date("2022-11-01"), status: "Active", address: "852 Talent Street, Phoenix, AZ 85001", profileImage: "https://i.pravatar.cc/150?img=21" },
  { firstName: "Liam", lastName: "Harris", email: "liam.harris@company.com", phone: "+1-555-0112", gender: "Male", dateOfBirth: new Date("1983-10-15"), department: "Engineering", position: "Engineering Manager", salary: 125000, joiningDate: new Date("2015-07-01"), status: "Active", address: "963 Leader Lane, San Jose, CA 95101", profileImage: "https://i.pravatar.cc/150?img=23" },
  { firstName: "Mia", lastName: "Martin", email: "mia.martin@company.com", phone: "+1-555-0113", gender: "Female", dateOfBirth: new Date("1997-04-22"), department: "Design", position: "UI/UX Designer", salary: 70000, joiningDate: new Date("2023-07-10"), status: "Active", address: "174 Design Court, Austin, TX 78702", profileImage: "https://i.pravatar.cc/150?img=25" },
  { firstName: "Noah", lastName: "Garcia", email: "noah.garcia@company.com", phone: "+1-555-0114", gender: "Male", dateOfBirth: new Date("1990-07-03"), department: "Operations", position: "Operations Manager", salary: 82000, joiningDate: new Date("2020-02-14"), status: "Inactive", address: "285 Ops Avenue, Houston, TX 77001", profileImage: "https://i.pravatar.cc/150?img=27" },
  { firstName: "Olivia", lastName: "Martinez", email: "olivia.martinez@company.com", phone: "+1-555-0115", gender: "Female", dateOfBirth: new Date("1992-09-17"), department: "Engineering", position: "Data Scientist", salary: 98000, joiningDate: new Date("2021-11-15"), status: "Active", address: "396 Data Drive, San Francisco, CA 94106", profileImage: "https://i.pravatar.cc/150?img=29" },
];

const seedDB = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Employee.deleteMany({});
    console.log("Cleared existing data");

    // Seed users
    for (const u of users) {
      await User.create(u);
    }

    // Seed employees with varied dates (spread over 6 months)
    const now = new Date();
    for (let i = 0; i < employees.length; i++) {
      const emp = { ...employees[i] };
      // Vary createdAt over past 6 months for chart data
      const daysAgo = Math.floor(Math.random() * 180);
      const createdAt = new Date(now);
      createdAt.setDate(createdAt.getDate() - daysAgo);
      const created = await Employee.create(emp);
      // Update createdAt manually
      await Employee.findByIdAndUpdate(created._id, { createdAt });
    }
    console.log("Employees seeded");

    console.log("\n========== SEED COMPLETE ==========");
    console.log("Admin Login: admin@ems.com / Admin@123");
    console.log("User Login:  john@ems.com / User@123");
    console.log("=====================================\n");
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

seedDB();
