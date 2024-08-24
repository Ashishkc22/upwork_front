import React from "react";
import { CircularProgress, Box } from "@mui/material";

const TransparentLoadingScreen = () => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1300, // Ensure it appears above other content
      }}
    >
      <CircularProgress
        sx={{
          color: "#fff", // White spinner
        }}
      />
    </Box>
  );
};

export default TransparentLoadingScreen;
