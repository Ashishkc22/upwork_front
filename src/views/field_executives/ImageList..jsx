import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const ImageDialog = ({ open, onClose, images, initialIndex }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);

  // Navigate to previous image
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : images.length - 1
    );
  };

  // Navigate to next image
  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex < images.length - 1 ? prevIndex + 1 : 0
    );
  };

  // Handle keyboard navigation
  const handleKeyDown = (event) => {
    switch (event.key) {
      case "ArrowLeft":
        goToPrevious();
        break;
      case "ArrowRight":
        goToNext();
        break;
      default:
        break;
    }
  };

  // Add event listener for keyboard navigation
  useEffect(() => {
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <div style={{ position: "relative" }}>
        <img
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
        <IconButton
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            transform: "translateY(-50%)",
          }}
          onClick={goToPrevious}
        >
          <ArrowBackIcon />
        </IconButton>
        <IconButton
          style={{
            position: "absolute",
            top: "50%",
            right: 0,
            transform: "translateY(-50%)",
          }}
          onClick={goToNext}
        >
          <ArrowForwardIcon />
        </IconButton>
      </div>
    </Dialog>
  );
};

export default ImageDialog;
