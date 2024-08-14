import React from "react";
import { Container, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom"; // if using react-router for navigation

const NotFoundPage = () => {
  const navigate = useNavigate(); // for navigation

  const handleGoBack = () => {
    navigate("/"); // or the route you want to navigate to
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        mt: 8,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <Typography variant="h1" color="primary" sx={{ fontWeight: "bold" }}>
        404
      </Typography>
      <Typography variant="h5" color="textSecondary" sx={{ mb: 2 }}>
        Oops! The page you're looking for doesn't exist.
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        <Button variant="contained" color="primary" onClick={handleGoBack}>
          Go to Home
        </Button>
      </Box>
    </Container>
  );
};

export default NotFoundPage;
