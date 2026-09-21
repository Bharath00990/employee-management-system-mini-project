import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from "@mui/material";
import { Warning } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";

const ConfirmDialog = ({ open, title, message, onConfirm, onCancel, loading = false }) => (
  <AnimatePresence>
    {open && (
      <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth
        PaperProps={{ component: motion.div, initial: { scale: 0.8, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.8, opacity: 0 }, sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pt: 3, pb: 1, textAlign: "center" }}>
          <Box sx={{ bgcolor: "error.main" + "15", borderRadius: "50%", width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
            <Warning sx={{ color: "error.main", fontSize: 32 }} />
          </Box>
          <Typography variant="h6" fontWeight={700}>{title || "Confirm Action"}</Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center", pb: 1 }}>
          <Typography color="text.secondary">{message || "Are you sure you want to proceed?"}</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={onCancel} variant="outlined" fullWidth disabled={loading}>Cancel</Button>
          <Button onClick={onConfirm} variant="contained" color="error" fullWidth disabled={loading}>
            {loading ? "Deleting..." : "Delete Employee"}
          </Button>
        </DialogActions>
      </Dialog>
    )}
  </AnimatePresence>
);

export default ConfirmDialog;
