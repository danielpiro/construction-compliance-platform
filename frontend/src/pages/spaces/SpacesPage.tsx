import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, Button, Paper } from "@mui/material";
import { Link, useParams } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";

// Define Space interface
interface Space {
  _id: string;
  name: string;
  type: string;
  projectTypeId: string;
}

const SpacesPage: React.FC = () => {
  const { projectId, typeId } = useParams<{
    projectId: string;
    typeId: string;
  }>();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [projectName, setProjectName] = useState("");
  const [typeName, setTypeName] = useState("");

  // Fetch spaces (mock data for now)
  useEffect(() => {
    // This would be replaced with an actual API call
    const mockSpaces: Space[] = [
      {
        _id: "space1",
        name: "חדר שינה",
        type: "מגורים",
        projectTypeId: typeId || "",
      },
      {
        _id: "space2",
        name: "מרחב מוגן",
        type: "מוגן",
        projectTypeId: typeId || "",
      },
      {
        _id: "space3",
        name: "חדר אמבטיה",
        type: "חדר רטוב",
        projectTypeId: typeId || "",
      },
      {
        _id: "space4",
        name: "מרפסת",
        type: "מרפסת",
        projectTypeId: typeId || "",
      },
    ];

    setSpaces(mockSpaces);
    setProjectName("פרויקט לדוגמה");
    setTypeName("מגורים");
  }, [typeId]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="caption" component="div">
          <Link to="/projects" style={{ textDecoration: "none" }}>
            פרויקטים
          </Link>{" "}
          &gt;
          <Link
            to={`/projects/${projectId}`}
            style={{ textDecoration: "none" }}
          >
            {" "}
            {projectName}
          </Link>{" "}
          &gt;
          <Link
            to={`/projects/${projectId}/types/${typeId}`}
            style={{ textDecoration: "none" }}
          >
            {" "}
            {typeName}
          </Link>{" "}
          &gt; חללים
        </Typography>
      </Box>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          חללים
        </Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />}>
          הוסף חלל
        </Button>
      </Box>

      <Grid container spacing={3}>
        {spaces.map((space) => (
          <Grid item key={space._id} xs={12} sm={6} md={4}>
            <Paper
              component={Link}
              to={`/projects/${projectId}/types/${typeId}/spaces/${space._id}/elements`}
              sx={{
                p: 3,
                display: "block",
                textDecoration: "none",
                color: "inherit",
                textAlign: "center",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 3,
                },
              }}
            >
              <Typography variant="h6" component="h2">
                {space.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {space.type}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SpacesPage;
