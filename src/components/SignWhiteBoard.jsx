import React, { useRef, useState, useEffect } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";

const Whiteboard = ({ closeBoard, handleSignatureSubmit }) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(
    window.innerWidth > 768 ? 600 : window.innerWidth
  ); // Set initial width based on screen size
  const [canvasHeight, setCanvasHeight] = useState(
    window.innerWidth > 768 ? 400 : window.innerHeight
  ); // Set initial height based on screen size

  useEffect(() => {
    // Set up canvas for drawing
    const canvas = canvasRef.current;
    canvas.width = canvasWidth * 2; // Set canvas size to support high DPI displays
    canvas.height = canvasHeight * 2;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    const context = canvas.getContext("2d");
    context.scale(2, 2); // Scale the canvas for high DPI support
    context.lineCap = "round";
    context.strokeStyle = "black";
    context.lineWidth = 2;
    contextRef.current = context;
  }, [canvasWidth, canvasHeight]);

  // Update canvas size on window resize
  useEffect(() => {
    const handleResize = () => {
      const isSmallScreen = window.innerWidth <= 768;
      setCanvasWidth(isSmallScreen ? window.innerWidth : 600);
      setCanvasHeight(isSmallScreen ? window.innerHeight : 400);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Start drawing on mouse or touch down
  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  // Stop drawing on mouse or touch end
  const finishDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  // Draw line on mouse move or touch move
  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  // Clear the canvas
  const clearCanvas = () => {
    contextRef.current.clearRect(0, 0, canvasWidth, canvasHeight);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        // height: "100vh", // Set to viewport height for full-screen effect
        overflow: "hidden",
        p: 1,
      }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseUp={finishDrawing}
        onMouseMove={draw}
        onMouseLeave={finishDrawing}
        onTouchStart={startDrawing}
        onTouchEnd={finishDrawing}
        onTouchMove={draw}
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          cursor: "crosshair",
          backgroundColor: "#ffffff",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      />
      <Stack direction="row" spacing={2} mt={2}>
        <Button color="primary" onClick={clearCanvas}>
          Clear
        </Button>
        <Button color="secondary" onClick={() => closeBoard(false)}>
          Close
        </Button>
        <Button
          color="primary"
          onClick={() => {
            // Export canvas as an image
            const canvas = canvasRef.current;
            const dataURL = canvas.toDataURL("image/png");
            handleSignatureSubmit(dataURL);
            closeBoard(false);
          }}
        >
          Done
        </Button>
      </Stack>
    </Box>
  );
};

export default Whiteboard;
