import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Stack,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { SpaceForm, SpaceFormData } from "./SpaceForm";
import { ElementForm, ElementFormData } from "../elements/ElementForm";

export interface SpaceWithElements {
  spaceData: SpaceFormData;
  elements: ElementFormData[];
}

interface SpaceElementSectionProps {
  spaces: SpaceWithElements[];
  onSpacesChange: (spaces: SpaceWithElements[]) => void;
}

export const SpaceElementSection: React.FC<SpaceElementSectionProps> = ({
  spaces,
  onSpacesChange,
}) => {
  const [selectedSpaceIndex, setSelectedSpaceIndex] = useState<number>(-1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"space" | "element">("space");

  const handleAddSpace = (spaceData: SpaceFormData) => {
    onSpacesChange([...spaces, { spaceData, elements: [] }]);
    setIsDialogOpen(false);
  };

  const handleAddElement = (elementData: ElementFormData) => {
    if (selectedSpaceIndex > -1) {
      const newSpaces = [...spaces];
      newSpaces[selectedSpaceIndex].elements.push(elementData);
      onSpacesChange(newSpaces);
      setIsDialogOpen(false);
    }
  };

  const handleDeleteSpace = (index: number) => {
    const newSpaces = spaces.filter((_, i) => i !== index);
    onSpacesChange(newSpaces);
  };

  const handleDeleteElement = (spaceIndex: number, elementIndex: number) => {
    const newSpaces = [...spaces];
    newSpaces[spaceIndex].elements = newSpaces[spaceIndex].elements.filter(
      (_, i) => i !== elementIndex
    );
    onSpacesChange(newSpaces);
  };

  const openSpaceDialog = () => {
    setModalMode("space");
    setIsDialogOpen(true);
  };

  const openElementDialog = (spaceIndex: number) => {
    setSelectedSpaceIndex(spaceIndex);
    setModalMode("element");
    setIsDialogOpen(true);
  };

  return (
    <Box>
      <Stack spacing={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={openSpaceDialog}
          fullWidth
        >
          Add Space
        </Button>

        {spaces.map((space, spaceIndex) => (
          <Accordion key={spaceIndex}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>
                {space.spaceData.name} ({space.spaceData.type})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => openElementDialog(spaceIndex)}
                  >
                    Add Element
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDeleteSpace(spaceIndex)}
                  >
                    Delete Space
                  </Button>
                </Box>

                <Stack spacing={2}>
                  {space.elements.map((element, elementIndex) => (
                    <Paper key={elementIndex} elevation={1} sx={{ p: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box>
                          <Typography variant="subtitle1">
                            {element.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {element.type}
                            {element.subType && ` - ${element.subType}`}
                          </Typography>
                        </Box>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() =>
                            handleDeleteElement(spaceIndex, elementIndex)
                          }
                        >
                          Delete
                        </Button>
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>

      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {modalMode === "space" ? "Add Space" : "Add Element"}
        </DialogTitle>
        <DialogContent>
          {modalMode === "space" ? (
            <SpaceForm onSubmit={handleAddSpace} />
          ) : (
            <ElementForm onSubmit={handleAddElement} />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};
