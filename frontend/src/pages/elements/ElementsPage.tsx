import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, Button, Paper, Chip } from "@mui/material";
import { Link, useParams } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";

// Define Element interface
interface Element {
  _id: string;
  name: string;
  type: "קיר" | "תקרה" | "רצפה" | "גשר תרמי";
  subType?: string;
  spaceId: string;
}

const ElementsPage: React.FC = () => {
  const { projectId, typeId, spaceId } = useParams<{
    projectId: string;
    typeId: string;
    spaceId: string;
  }>();

  const [elements, setElements] = useState<Element[]>([]);
  const [projectName, setProjectName] = useState("");
  const [typeName, setTypeName] = useState("");
  const [spaceName, setSpaceName] = useState("");

  // Fetch elements (mock data for now)
  useEffect(() => {
    // This would be replaced with an actual API call
    const mockElements: Element[] = [
      {
        _id: "elem1",
        name: "קיר צפוני",
        type: "קיר",
        subType: "קיר חיצוני",
        spaceId: spaceId || "",
      },
      {
        _id: "elem2",
        name: "קיר מזרחי",
        type: "קיר",
        subType: "קיר בידוד",
        spaceId: spaceId || "",
      },
      {
        _id: "elem3",
        name: "רצפה ראשית",
        type: "רצפה",
        subType: "מרחב עליון פתוח",
        spaceId: spaceId || "",
      },
      {
        _id: "elem4",
        name: "תקרה",
        type: "תקרה",
        subType: "גג עליון",
        spaceId: spaceId || "",
      },
      {
        _id: "elem5",
        name: "מסגרת חלון",
        type: "גשר תרמי",
        spaceId: spaceId || "",
      },
    ];

    setElements(mockElements);
    setProjectName("פרויקט לדוגמה");
    setTypeName("מגורים");
    setSpaceName("חדר שינה");
  }, [spaceId]);

  const getChipColor = (type: string) => {
    switch (type) {
      case "קיר":
        return "primary";
      case "תקרה":
        return "secondary";
      case "רצפה":
        return "success";
      case "גשר תרמי":
        return "warning";
      default:
        return "default";
    }
  };

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
          &gt;
          <Link
            to={`/projects/${projectId}/types/${typeId}/spaces`}
            style={{ textDecoration: "none" }}
          >
            {" "}
            חללים
          </Link>{" "}
          &gt;
          {spaceName}
        </Typography>
      </Box>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          אלמנטים עבור {spaceName}
        </Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />}>
          הוסף אלמנט
        </Button>
      </Box>

      <Grid container spacing={3}>
        {elements.map((element) => (
          <Grid item key={element._id} xs={12} sm={6} md={4}>
            <Paper
              sx={{
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography variant="h6" component="h2" gutterBottom>
                  {element.name}
                </Typography>
                <Chip
                  label={element.type}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  color={getChipColor(element.type) as any}
                  size="small"
                  sx={{ mb: 1 }}
                />
                {element.subType && (
                  <Typography variant="body2" color="text.secondary">
                    {element.subType}
                  </Typography>
                )}
              </Box>

              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button size="small" color="primary">
                  ערוך
                </Button>
                <Button size="small" color="error" sx={{ mr: 1 }}>
                  מחק
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ElementsPage;
