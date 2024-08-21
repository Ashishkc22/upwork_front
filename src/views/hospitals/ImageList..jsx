// ImageListCard.js
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Typography,
  Button,
  Box,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { CardActionArea } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageCropDialog from "./ImageCropDialog";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { styled } from "@mui/material/styles";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const ImageListCard = ({ initialImages = [], onImagesChange }) => {
  const [selectedImage, setSelectImages] = useState("");
  const [isCroppingDialogOpen, setIsCroppingDialogOpen] = useState(false);

  const handleRemoveImage = (index) => {
    const updatedImages = initialImages?.filter((_, i) => i !== index);
    onImagesChange(updatedImages);
  };

  const handleCropComplete = ({ croppedImage, selectedImageIndex }) => {
    let _imageList = [...initialImages];
    _imageList.splice(selectedImageIndex, 1);
    _imageList.push(croppedImage);
    onImagesChange(_imageList);
    setIsCroppingDialogOpen(false);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        const a = [...initialImages];
        a.push(reader.result?.toString() || "");
        onImagesChange(a);
      });
      reader.readAsDataURL(file);
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      {initialImages?.map((image, index) => {
        return (
          <Card sx={{ maxWidth: 345, m: 1 }}>
            <ImageCropDialog
              open={isCroppingDialogOpen}
              onClose={() => setIsCroppingDialogOpen(false)}
              image={selectedImage}
              onCropComplete={handleCropComplete}
              selectedImageIndex={index}
              mode="Edit"
            />
            <CardActionArea
              onClick={() => {
                setSelectImages(image);
                setIsCroppingDialogOpen(true);
              }}
            >
              <div
                key={index}
                style={{ position: "relative", width: 100, height: 100 }}
              >
                <CardMedia
                  component="img"
                  sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  image={image}
                  alt={`Image ${index}`}
                />
                <IconButton
                  sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    color: "white",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.7)",
                    },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage(index);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </div>
            </CardActionArea>
          </Card>
        );
      })}
      <Card
        sx={{
          width: "100px",
          height: "100px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <CardActionArea
          sx={{
            width: "100px",
            height: "100px",
            display: "flex",
            justifyContent: "center",
          }}
          role={undefined}
          tabIndex={-1}
          component="label"
          onChange={handleFileChange}
        >
          <AddIcon />
          <VisuallyHiddenInput type="file" />
        </CardActionArea>
      </Card>
    </Box>
  );
};

export default ImageListCard;
