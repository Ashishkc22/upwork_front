import React, { useState, useRef, useEffect } from "react";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
  convertToPixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  IconButton,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import CropIcon from "@mui/icons-material/Crop";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import RotateRightIcon from "@mui/icons-material/RotateRight";

const centerAspectCrop = (mediaWidth, mediaHeight, aspect) => {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
};

const TO_RADIANS = Math.PI / 180;

const CroppingDialog = ({
  open,
  onClose,
  image,
  onCropComplete,
  selectedImageIndex,
}) => {
  const [crop, setCrop] = useState(null);
  const [completedCrop, setCompletedCrop] = useState(null);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [aspect, setAspect] = useState(16 / 9);
  const [isCrop, setIsCropImage] = useState(false);

  const [imageDataUrl, setImageDataUrl] = useState(null);

  const imgRef = useRef(null);

  const handleImageLoad = (e) => {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  };

  const handleImageCrop = async () => {
    const _image = imgRef.current;
    if (!completedCrop || !imgRef.current) return;

    const scaleX = _image.naturalWidth / _image.width;
    const scaleY = _image.naturalHeight / _image.height;

    const offscreen = new OffscreenCanvas(
      completedCrop.width * scaleX,
      completedCrop.height * scaleY
    );

    const ctx = offscreen.getContext("2d");
    if (!ctx) {
      throw new Error("No 2d context");
    }
    if (rotate && rotate > 0) {
      const rotateRads = rotate * TO_RADIANS;
      ctx.rotate(rotateRads);
    }

    ctx.drawImage(
      _image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      offscreen.width,
      offscreen.height
    );

    const blob = await offscreen.convertToBlob({
      type: "image/png",
    });
    setImageDataUrl(URL.createObjectURL(blob));
  };

  useEffect(() => {
    setImageDataUrl(image);
  }, [image]);

  const handleImageRoatation = async ({ _rotate }) => {
    const image = imgRef.current;

    if (!image || !image.complete) return; // Ensure the image is loaded

    const offscreen = document.createElement("canvas");
    const ctx = offscreen.getContext("2d");

    if (!ctx) return; // Ensure the canvas context is available

    const rotateValue = _rotate; // Example rotation value, you might use a state variable

    // Set the canvas size
    offscreen.width = image.naturalWidth;
    offscreen.height = image.naturalHeight;

    // Clear the canvas and set up transformation
    ctx.clearRect(0, 0, offscreen.width, offscreen.height);
    ctx.save();
    ctx.translate(offscreen.width / 2, offscreen.height / 2);
    ctx.rotate((rotateValue * Math.PI) / 180);
    ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);
    ctx.restore();

    // Convert canvas to Blob and trigger download
    offscreen.toBlob((blob) => {
      if (blob) {
        // const url = URL.createObjectURL(blob);
        setImageDataUrl(URL.createObjectURL(blob));

        // const link = document.createElement("a");
        // link.href = url;
        // link.download = "rotated-image.png";
        // link.click();
        // URL.revokeObjectURL(url);
      }
    }, "image/png");
  };

  const handleCropImage = () => {
    onCropComplete({ croppedImage: imageDataUrl, selectedImageIndex });
    setCrop(null);
    setCompletedCrop(null);
    setRotate(null);
    setIsCropImage(null);
  };

  useEffect(() => {}, [rotate, completedCrop]);

  const handleRotateLeft = () => {
    console.log("Left", rotate - 90);
    handleImageRoatation({ _rotate: rotate - 90 });
    setRotate((prev) => prev - 90);
  };
  const handleRotateRight = () => {
    console.log("tight", rotate + 90);

    setRotate((prev) => prev + 90);
    handleImageRoatation({ _rotate: rotate + 90 });
  };
  const canvasRef = useRef(null);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md">
      <DialogActions sx={{ display: "flex", justifyContent: "space-between" }}>
        <DialogTitle sx={{ m: 0, p: 0 }}>Image Cropping</DialogTitle>
        <Box>
          <Button onClick={onClose} color="secondary">
            Close
          </Button>
          <Button onClick={() => handleCropImage()} color="primary">
            Apply
          </Button>
        </Box>
      </DialogActions>
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>

      <DialogContent sx={{ m: 0, pt: 0, p: 1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Box>
            {isCrop ? (
              <Box>
                <IconButton
                  onClick={() => {
                    handleImageCrop();
                  }}
                >
                  <CheckIcon />
                </IconButton>
                <IconButton onClick={() => setIsCropImage(false)}>
                  <ClearIcon />
                </IconButton>
              </Box>
            ) : (
              <IconButton onClick={() => setIsCropImage(true)}>
                <CropIcon />
              </IconButton>
            )}
          </Box>
          <Box>
            <IconButton onClick={handleRotateLeft} disabled={isCrop}>
              <RotateLeftIcon />
            </IconButton>
            <IconButton onClick={handleRotateRight} disabled={isCrop}>
              <RotateRightIcon />
            </IconButton>
          </Box>
        </Box>
        {/* {isCrop ? ( */}
        <Box>
          <ReactCrop
            {...(isCrop && { crop: crop })}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={setCompletedCrop}
            // aspect={aspect}
          >
            <img
              ref={imgRef}
              src={imageDataUrl}
              alt="Crop me"
              crossorigin="anonymous"
              onLoad={handleImageLoad}
              style={{
                // transform: `scale(${scale}) rotate(${rotate}deg)`,
                height: "500Px",
              }}
            />
          </ReactCrop>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CroppingDialog;
