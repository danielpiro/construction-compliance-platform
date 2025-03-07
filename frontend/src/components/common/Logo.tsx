// src/components/common/Logo.tsx
import React from "react";
import { Box, SvgIcon } from "@mui/material";
import { Business as BusinessIcon } from "@mui/icons-material";

interface LogoProps {
  height?: number;
}

const Logo: React.FC<LogoProps> = ({ height = 50 }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: `${height}px`,
      }}
    >
      <SvgIcon
        component={BusinessIcon}
        sx={{
          fontSize: `${height}px`,
          color: "primary.main",
          mr: 1,
        }}
      />
    </Box>
  );
};

export default Logo;
