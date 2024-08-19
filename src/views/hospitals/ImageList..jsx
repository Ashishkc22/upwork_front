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
  const [images, setImages] = useState(initialImages);
  const [selectedImage, setSelectImages] = useState("");
  const [isCroppingDialogOpen, setIsCroppingDialogOpen] = useState(false);

  const handleAddImage = () => {
    console.log("Image updated......");
    onImagesChange(images);
  };

  useEffect(() => {
    handleAddImage();
    console.log("images", images);
  }, [images]);

  const handleRemoveImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  const handleCropComplete = ({ croppedImage, selectedImageIndex }) => {
    let _imageList = [...images];
    _imageList.splice(selectedImageIndex, 1);
    _imageList.push(croppedImage);
    setImages(_imageList);
    setIsCroppingDialogOpen(false);
    console.log("_imageList", _imageList);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener("load", () =>
        setImages((pre) => {
          const a = [...pre];
          a.push(reader.result?.toString() || "");
          return a;
        })
      );
      reader.readAsDataURL(file);
      //   setFileName(file.name);
      //   if (onFileSelect) {
      //     onFileSelect(file);
      //   }
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      {images.map((image, index) => {
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
