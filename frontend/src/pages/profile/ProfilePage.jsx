import React from "react";
import { Box, Card, CardContent, Typography, Avatar, Chip, Divider, Grid, Paper } from "@mui/material";
import { Email, Person, AdminPanelSettings } from "@mui/icons-material";
import { motion } from "framer-motion";
import PageTransition from "../../components/common/PageTransition";
import { useAuth } from "../../context/AuthContext";
import { getInitials, formatDate } from "../../utils/helpers";

const ProfilePage = () => {
  const { user } = useAuth();
  return (
    <PageTransition>
      <Typography variant="h4" fontWeight={800} mb={3}>My Profile</Typography>
      <Grid container spacing={3} maxWidth={700}>
        <Grid item xs={12}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent sx={{ p: 4, textAlign: "center" }}>
                <Avatar sx={{ width: 90, height: 90, bgcolor: "primary.main", fontSize: 30, fontWeight: 700, mx: "auto", mb: 2 }}>
                  {getInitials(user?.name?.split(" ")[0], user?.name?.split(" ")[1])}
                </Avatar>
                <Typography variant="h5" fontWeight={800}>{user?.name}</Typography>
                <Typography color="text.secondary" mb={2}>{user?.email}</Typography>
                <Chip icon={user?.role === "admin" ? <AdminPanelSettings /> : <Person />}
                  label={user?.role?.toUpperCase()} color="primary" variant="outlined" sx={{ fontWeight: 700 }} />
                <Divider sx={{ my: 3 }} />
                <Grid container spacing={2} justifyContent="center">
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2, borderRadius: 2, bgcolor: "action.hover" }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>ROLE</Typography>
                      <Typography fontWeight={700} textTransform="capitalize">{user?.role}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2, borderRadius: 2, bgcolor: "action.hover" }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>MEMBER SINCE</Typography>
                      <Typography fontWeight={700}>{formatDate(user?.createdAt)}</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </PageTransition>
  );
};

export default ProfilePage;
