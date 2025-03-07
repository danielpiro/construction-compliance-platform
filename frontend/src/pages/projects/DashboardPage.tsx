import React from "react";
import { Box, Typography, Grid, Paper } from "@mui/material";

const DashboardPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        לוח בקרה
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={4}>
          <Paper
            sx={{ p: 2, display: "flex", flexDirection: "column", height: 240 }}
          >
            <Typography variant="h6" component="h2">
              פרויקטים אחרונים
            </Typography>
            {/* Add content here */}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <Paper
            sx={{ p: 2, display: "flex", flexDirection: "column", height: 240 }}
          >
            <Typography variant="h6" component="h2">
              סטטוס עמידה בתקנים
            </Typography>
            {/* Add content here */}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <Paper
            sx={{ p: 2, display: "flex", flexDirection: "column", height: 240 }}
          >
            <Typography variant="h6" component="h2">
              פעילות אחרונה
            </Typography>
            {/* Add content here */}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
