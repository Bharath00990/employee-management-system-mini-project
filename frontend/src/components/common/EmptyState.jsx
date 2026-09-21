import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { SearchOff } from "@mui/icons-material";
import { motion } from "framer-motion";

const EmptyState = ({ title = "No data found", subtitle, action, actionLabel }) => (
  <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
    sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 8, gap: 2 }}
  >
    <Box sx={{ bgcolor: "action.hover", borderRadius: "50%", p: 3 }}>
      <SearchOff sx={{ fontSize: 48, color: "text.secondary" }} />
    </Box>
    <Typography variant="h6" fontWeight={700} color="text.primary">{title}</Typography>
    {subtitle && <Typography variant="body2" color="text.secondary" textAlign="center" maxWidth={300}>{subtitle}</Typography>}
    {action && <Button onClick={action} variant="contained">{actionLabel || "Action"}</Button>}
  </Box>
);

export default EmptyState;
