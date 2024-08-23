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
import DownloadIcon from "@mui/icons-material/Download";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import CropIcon from "@mui/icons-material/Crop";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import { canvasPreview } from "./ConvasPreview";
import { useDebounceEffect } from "./useDebounceEffect";

import "react-image-crop/dist/ReactCrop.css";

const CroppingDialog = ({
  open,
  onClose,
  image,
  onCropComplete,
  selectedImageIndex,
  mode = "View",
}) => {
  const [imgSrc, setImgSrc] = useState("");
  const previewCanvasRef = useRef(null);
  const imgRef = useRef(null);
  const hiddenAnchorRef = useRef(null);
  const blobUrlRef = useRef("");
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [aspect, setAspect] = useState(16 / 9);

  // This is to demonstate how to make and center a % aspect crop
  // which is a bit trickier so we use some helper functions.
  function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
    return centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: 90,
        },
        aspect,
        mediaWidth,
        mediaHeight
      ),
      mediaWidth,
      mediaHeight
    );
  }

  function onSelectFile(e) {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined); // Makes crop preview update between images.
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImgSrc(reader.result?.toString() || "");
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  useEffect(() => {
    // if (image) {
    //   setCrop(undefined); // Makes crop preview update between images.
    //   const reader = new FileReader();
    //   reader.addEventListener("load", () => {
    //     setImgSrc(reader.result?.toString() || "");
    //   });
    //   reader.readAsDataURL(image);
    // }
    setImgSrc(image);
  }, [image]);

  function downloadImage() {
    console.log("imgRef", imgRef);
    if (!imgRef.current) return;
    const image = imgRef.current;
    const link = document.createElement("a");
    link.href = image.src; // Get the image source URL
    link.download = "downloaded-image.png"; // Set the default download filename
    link.click();
  }

  function onImageLoad(e) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
      setAspect(undefined);
    }
  }

  async function onDownloadCropClick({ isDownload = false } = {}) {
    const _image = imgRef.current;
    const previewCanvas = previewCanvasRef.current;
    if (!_image || !previewCanvas || !completedCrop) {
      throw new Error("Crop canvas does not exist");
    }

    // This will size relative to the uploaded image
    // size. If you want to size according to what they
    // are looking at on screen, remove scaleX + scaleY
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

    ctx.drawImage(
      previewCanvas,
      0,
      0,
      previewCanvas.width,
      previewCanvas.height,
      0,
      0,
      offscreen.width,
      offscreen.height
    );
    // You might want { type: "image/jpeg", quality: <0 to 1> } to
    // reduce image size
    const blob = await offscreen.convertToBlob({
      type: "image/png",
    });

    const urlData = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Resolve with the Data URL
        resolve(reader.result);
      };
      // Read the Blob as a Data URL
      reader.readAsDataURL(blob);
    });
    console.log("EDIT Download");

    if (!isDownload) {
      onCropComplete({ croppedImage: urlData, selectedImageIndex });
    } else {
      if (hiddenAnchorRef.current) {
        if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current);
        }
        const imageUrl = URL.createObjectURL(blob);
        blobUrlRef.current = imageUrl;
        hiddenAnchorRef.current.href = blobUrlRef.current;
        hiddenAnchorRef.current.click();
      }
    }
  }

  useDebounceEffect(
    async () => {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        imgRef.current &&
        previewCanvasRef.current
      ) {
        // We use canvasPreview as it's much faster than imgPreview.
        canvasPreview(
          imgRef.current,
          previewCanvasRef.current,
          completedCrop,
          scale,
          rotate
        );
      }
    },
    100,
    [completedCrop, scale, rotate]
  );

  function handleToggleAspectClick() {
    if (aspect) {
      setAspect(undefined);
    } else {
      setAspect(16 / 9);
      if (imgRef.current) {
        const { width, height } = imgRef.current;
        const newCrop = centerAspectCrop(width, height, 16 / 9);
        setCrop(newCrop);
        // Updates the preview
        setCompletedCrop(convertToPixelCrop(newCrop, width, height));
      }
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md">
      <DialogActions sx={{ display: "flex", justifyContent: "space-between" }}>
        <DialogTitle sx={{ m: 0, p: 0 }}>Image Cropping</DialogTitle>
        {mode != "View" && (
          <Box>
            <Button onClick={onClose} color="secondary">
              Close
            </Button>
            <Button
              onClick={() => {
                console.log("EDIT");

                onDownloadCropClick();
              }}
              color="primary"
            >
              Apply
            </Button>
          </Box>
        )}
        <IconButton
          onClick={() => {
            console.log("mode", mode);
            if (mode != "View") {
              onDownloadCropClick({ isDownload: true });
            } else {
              downloadImage();
            }
          }}
        >
          <DownloadIcon />
        </IconButton>
      </DialogActions>
      <DialogContent sx={{ m: 0, pt: 0, p: 1 }}>
        {mode != "View" && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <label htmlFor="scale-input">Scale: </label>
              <input
                id="scale-input"
                type="number"
                step="0.1"
                value={scale}
                disabled={!imgSrc}
                onChange={(e) => setScale(Number(e.target.value))}
              />
            </div>
            <Box>
              <IconButton onClick={() => setRotate((pre) => pre - 90)}>
                <RotateLeftIcon />
              </IconButton>
              <IconButton onClick={() => setRotate((pre) => pre + 90)}>
                <RotateRightIcon />
              </IconButton>
            </Box>
          </Box>
        )}
        <Box>
          {!!imgSrc && (
            <ReactCrop
              {...(mode != "View" && { crop: crop })}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
              // minWidth={400}
              minHeight={100}
              // circularCrop
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={imgSrc}
                // style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                onLoad={onImageLoad}
                crossOrigin="anonymous"
                style={{
                  transform: `scale(${scale}) rotate(${rotate}deg)`,
                  // width: "700Px",
                  width: "366.4px",
                }}
              />
            </ReactCrop>
          )}
        </Box>

        {/* <div className="App">
          <div className="Crop-Controls">
            <input type="file" accept="image/*" onChange={onSelectFile} />
            <div>
              <label htmlFor="scale-input">Scale: </label>
              <input
                id="scale-input"
                type="number"
                step="0.1"
                value={scale}
                disabled={!imgSrc}
                onChange={(e) => setScale(Number(e.target.value))}
              />
            </div>
            <div>
              <label htmlFor="rotate-input">Rotate: </label>
              <input
                id="rotate-input"
                type="number"
                value={rotate}
                disabled={!imgSrc}
                onChange={(e) => {
                  setRotate(
                    Math.min(180, Math.max(-180, Number(e.target.value)))
                  );
                }}
              />
            </div>
            <div>
              <button onClick={handleToggleAspectClick}>
                Toggle aspect {aspect ? "off" : "on"}
              </button>
            </div>
          </div></div>
*/}
        {!!completedCrop && (
          <>
            <div>
              <canvas
                ref={previewCanvasRef}
                style={{
                  border: "1px solid black",
                  objectFit: "contain",
                  width: completedCrop.width,
                  height: completedCrop.height,
                  display: "none",
                }}
              />
            </div>
            <a
              href="#hidden"
              ref={hiddenAnchorRef}
              download
              style={{
                position: "absolute",
                top: "-200vh",
                visibility: "hidden",
              }}
            >
              Hidden download
            </a>
            {/* <div>
                <button onClick={onDownloadCropClick}>Download Crop</button>
                <div style={{ fontSize: 12, color: "#666" }}>
                  If you get a security error when downloading try opening the
                  Preview in a new tab (icon near top right).
                </div>
               
              </div> */}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CroppingDialog;
