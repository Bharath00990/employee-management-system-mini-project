import React from "react";
import { Box, Card, CardContent, Typography, Switch, FormControlLabel, Divider, Stack } from "@mui/material";
import { DarkMode, LightMode } from "@mui/icons-material";
import { motion } from "framer-motion";
import PageTransition from "../../components/common/PageTransition";
import { useThemeMode } from "../../context/ThemeContext";

const SettingsPage = () => {
  const { mode, toggleTheme } = useThemeMode();
  return (
    <PageTransition>
      <Typography variant="h4" fontWeight={800} mb={3}>Settings</Typography>
      <Box maxWidth={600}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={2}>Appearance</Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  {mode === "dark" ? <DarkMode color="primary" /> : <LightMode color="warning" />}
                  <Box>
                    <Typography fontWeight={600}>{mode === "dark" ? "Dark Mode" : "Light Mode"}</Typography>
                    <Typography variant="caption" color="text.secondary">Toggle between light and dark themes</Typography>
                  </Box>
                </Box>
                <Switch checked={mode === "dark"} onChange={toggleTheme} color="primary" />
              </Stack>
            </CardContent>
          </Card>
        </motion.div>
      </Box>
    </PageTransition>
  );
};

export default SettingsPage;
