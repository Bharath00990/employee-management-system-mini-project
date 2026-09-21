import React from "react";
import { Box, Skeleton, Card, CardContent, Grid } from "@mui/material";

export const StatCardSkeleton = () => (
  <Card><CardContent sx={{ p: 3 }}>
    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
      <Skeleton variant="rounded" width={52} height={52} />
      <Skeleton variant="rounded" width={60} height={24} />
    </Box>
    <Skeleton variant="text" width="40%" height={50} />
    <Skeleton variant="text" width="70%" />
    <Skeleton variant="text" width="50%" />
  </CardContent></Card>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <Box>
    {Array.from({ length: rows }).map((_, i) => (
      <Box key={i} sx={{ display: "flex", gap: 2, p: 2, borderBottom: 1, borderColor: "divider" }}>
        <Skeleton variant="circular" width={40} height={40} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="30%" />
          <Skeleton variant="text" width="50%" />
        </Box>
        <Skeleton variant="text" width="15%" />
        <Skeleton variant="rounded" width={80} height={28} />
      </Box>
    ))}
  </Box>
);

export default StatCardSkeleton;
