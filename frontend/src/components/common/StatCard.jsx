import React from "react";
import { Card, CardContent, Box, Typography, Avatar } from "@mui/material";
import { TrendingUp, TrendingDown } from "@mui/icons-material";
import { motion } from "framer-motion";

const StatCard = ({ title, value, subtitle, icon, color, change, index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    style={{ height: "100%" }}
  >
    <Card sx={{ height: "100%", position: "relative", overflow: "visible" }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Avatar sx={{ bgcolor: `${color}20`, width: 52, height: 52, borderRadius: 3 }}>
            <Box sx={{ color: color, display: "flex" }}>{icon}</Box>
          </Avatar>
          {change !== undefined && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.3,
              bgcolor: change >= 0 ? "success.main" + "15" : "error.main" + "15",
              color: change >= 0 ? "success.main" : "error.main",
              borderRadius: 2, px: 1, py: 0.3,
            }}>
              {change >= 0 ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
              <Typography variant="caption" fontWeight={700}>{Math.abs(change)}%</Typography>
            </Box>
          )}
        </Box>
        <Typography variant="h3" fontWeight={800} sx={{ mb: 0.5, lineHeight: 1 }}>{value}</Typography>
        <Typography variant="body2" fontWeight={600} color="text.primary">{title}</Typography>
        {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
        <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, borderRadius: "0 0 12px 12px", bgcolor: color }} />
      </CardContent>
    </Card>
  </motion.div>
);

export default StatCard;
