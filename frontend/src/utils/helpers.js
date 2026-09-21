export const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

export const formatSalary = (salary) => {
  if (!salary) return "N/A";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(salary);
};

export const getInitials = (firstName, lastName) => {
  return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
};

export const getStatusColor = (status) => {
  const colors = { Active: "success", Inactive: "error", "On Leave": "warning" };
  return colors[status] || "default";
};

export const getDeptColor = (dept) => {
  const colors = {
    Engineering: "#6366f1",
    HR: "#ec4899",
    Finance: "#10b981",
    Marketing: "#f59e0b",
    Sales: "#3b82f6",
    Operations: "#8b5cf6",
    Design: "#ef4444",
    Legal: "#06b6d4",
  };
  return colors[dept] || "#94a3b8";
};

export const DEPARTMENTS = ["Engineering", "HR", "Finance", "Marketing", "Sales", "Operations", "Design", "Legal"];
export const STATUSES = ["Active", "Inactive", "On Leave"];
export const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];
