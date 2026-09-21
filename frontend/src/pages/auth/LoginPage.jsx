import React, { useState } from "react";
import {
  Box, Card, CardContent, TextField, Button, Typography,
  IconButton, InputAdornment, Alert, Divider, Chip, useTheme,
} from "@mui/material";
import { Visibility, VisibilityOff, LockOutlined, Business } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useThemeMode } from "../../context/ThemeContext";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const from = location.state?.from?.pathname || "/dashboard";

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError("Please fill in all fields"); return; }
    setLoading(true); setError("");
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally { setLoading(false); }
  };

  const fillAdmin = () => setForm({ email: "admin@ems.com", password: "Admin@123" });
  const fillUser = () => setForm({ email: "john@ems.com", password: "User@123" });

  return (
    <Box sx={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      bgcolor: "background.default", p: 2,
      background: mode === "dark"
        ? "radial-gradient(ellipse at top left, rgba(99,102,241,0.15) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(236,72,153,0.1) 0%, transparent 50%), #0f172a"
        : "radial-gradient(ellipse at top left, rgba(99,102,241,0.08) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(236,72,153,0.06) 0%, transparent 50%), #f8fafc",
    }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ width: "100%", maxWidth: 440 }}>
        {/* Logo */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Box sx={{ display: "inline-flex", bgcolor: "primary.main", borderRadius: 3, p: 1.5, mb: 2 }}>
            <Business sx={{ color: "white", fontSize: 32 }} />
          </Box>
          <Typography variant="h4" fontWeight={800} color="primary.main">EMS Pro</Typography>
          <Typography color="text.secondary" variant="body2">Employee Management System</Typography>
        </Box>

        <Card sx={{ borderRadius: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight={700} mb={0.5}>Sign In</Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>Enter your credentials to continue</Typography>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                  <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit}>
              <TextField fullWidth label="Email Address" name="email" type="email" value={form.email}
                onChange={handleChange} sx={{ mb: 2.5 }} autoComplete="email"
                InputProps={{ startAdornment: <InputAdornment position="start"><LockOutlined fontSize="small" color="action" /></InputAdornment> }}
              />
              <TextField fullWidth label="Password" name="password" type={showPass ? "text" : "password"}
                value={form.password} onChange={handleChange} sx={{ mb: 3 }} autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPass((p) => !p)} edge="end">
                        {showPass ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}
                sx={{ py: 1.5, fontSize: "1rem", borderRadius: 2, mb: 2 }}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <Divider sx={{ mb: 2 }}><Chip label="Demo Credentials" size="small" /></Divider>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button variant="outlined" fullWidth size="small" onClick={fillAdmin} sx={{ borderRadius: 2 }}>
                Admin Login
              </Button>
              <Button variant="outlined" fullWidth size="small" onClick={fillUser} sx={{ borderRadius: 2 }}>
                User Login
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Button size="small" color="inherit" onClick={toggleTheme} sx={{ color: "text.secondary", borderRadius: 2 }}>
            Switch to {mode === "dark" ? "Light" : "Dark"} Mode
          </Button>
        </Box>
      </motion.div>
    </Box>
  );
};

export default LoginPage;
