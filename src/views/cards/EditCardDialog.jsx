import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Box,
  Grid,
  Typography,
  IconButton,
  useTheme,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  InputLabel,
  MenuItem,
  FormHelperText,
  Select,
} from "@mui/material";
import { tokens } from "../../theme";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import cardsService from "../../services/cards";
import commonService from "../../services/common";

import moment from "moment";

const EditDialog = ({ open, onClose, cardData }) => {
  const [formData, setFormData] = useState({});
  const [stateOption, setStateOption] = useState([]);
  const [districtOption, setDistrictOption] = useState([]);
  const [tehsilOption, setTehsilOption] = useState([]);
  const [gramOption, setGramOption] = useState([]);
  const [tmepImage, settmepImage] = useState("");

  const [rotation, setRotation] = useState(0);

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "idProof") {
      setFormData((prev) => ({
        ...prev,
        "id_proof.value": value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  function getAddressData(payload) {
    commonService.getAddressData(payload).then((data) => {
      console.log("data", data);
      if (payload?.type == "tehsil") {
        setTehsilOption(data || []);
      } else if (payload?.type == "district") {
        setDistrictOption(data || []);
      } else if (payload?.type == "gram") {
        setGramOption(data || []);
      } else {
        setStateOption(data || []);
      }
    });
  }

  useEffect(() => {
    getAddressData();
    // getAddressData({ type: "tehsil" });
    // getAddressData({ type: "gram" });
  }, [formData]);
  useEffect(() => {
    if (stateOption || formData.state) {
      const selectedState = stateOption.find(
        (data) => data.name === formData.state
      );
      if (selectedState) {
        getAddressData({
          type: "district",
          params: { stateId: selectedState._id },
        });
      } else {
      }
    }
  }, [stateOption]);

  useEffect(() => {
    if (districtOption || formData.district) {
      const selectedDistrict = districtOption.find(
        (data) => data.name === formData.district
      );
      if (selectedDistrict) {
        getAddressData({
          type: "tehsil",
          params: { districtId: selectedDistrict._id },
        });
      } else {
      }
    }
  }, [districtOption]);

  useEffect(() => {
    if (tehsilOption || formData.tehsil) {
      const selected = tehsilOption.find(
        (data) => data.name === formData.tehsil
      );
      if (selected) {
        getAddressData({
          type: "gram",
          params: { tehsilId: selected._id, showHidden: true, display: "Gram" },
        });
      } else {
      }
    }
  }, [tehsilOption]);

  const handleRotateLeft = () => setRotation((prev) => prev - 90);
  const handleRotateRight = () => setRotation((prev) => prev + 90);

  const handleSave = async () => {
    // Save logic here

    const captureRotatedImage = async (imageId) => {
      try {
        // Get the image element
        const img = document.getElementById(imageId);
        if (!img) throw new Error("Image element not found");

        if (img.src.startsWith("http")) {
          img.crossOrigin = "anonymous"; // This allows for cross-origin requests
        }

        // Create a canvas element
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Set canvas dimensions to match image dimensions
        canvas.width = img.width;
        canvas.height = img.height;

        // Apply rotation
        const rotation =
          parseFloat(
            img.style.transform.replace("rotate(", "").replace("deg)", "")
          ) || 0;
        const radians = rotation * (Math.PI / 180);

        // Center the canvas context
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(radians);
        ctx.drawImage(
          img,
          -img.width / 2,
          -img.height / 2,
          img.width,
          img.height
        );

        // Convert canvas to Blob
        const imageBlob = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/png")
        );

        return imageBlob;
      } catch (error) {
        console.error("Error capturing rotated image:", error);
        return null;
      }
    };

    const imageBlob = await captureRotatedImage(`${formData._id}-profile`);

    console.log("imageBlob", imageBlob);

    // Create FormData and append the image blob
    const newformData = new FormData();
    newformData.append("file", imageBlob, "profile.png");

    // // Send the image to another API
    cardsService.updateCard(formData, formData._id);

    // onClose(); // Close the dialog after saving
  };

  useEffect(() => {
    setFormData(cardData);
  }, [cardData]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md">
      <DialogTitle>Edit Details</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  width: 150,
                  height: 150,
                  overflow: "hidden",
                  borderRadius: "50%",
                  border: "1px solid #ddd",
                }}
              >
                <img
                  id={`${formData._id}-profile`}
                  src={formData?.image}
                  alt="Profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: `rotate(${rotation}deg)`,
                  }}
                />
              </Box>

              <Box
                sx={
                  {
                    // position: "absolute",
                    // top: "60%",
                    // left: "60%",
                    // transform: "translate(-50%, -50%)",
                    // display: "flex",
                    // gap: 1,
                  }
                }
              >
                <IconButton
                  onClick={handleRotateLeft}
                  disabled={!formData?.image}
                >
                  <RotateLeftIcon />
                </IconButton>
                <IconButton
                  onClick={handleRotateRight}
                  disabled={!formData?.image}
                >
                  <RotateRightIcon />
                </IconButton>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              defaultValue={formData?.name}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Birth Year"
              name="expiry_years"
              value={formData?.expiry_years}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            {/* <TextField
              fullWidth
              label="Gender"
              name="gender"
              value={formData?.gender}
              onChange={handleChange}
            />
             */}
            <FormControl>
              <FormLabel id="demo-radio-buttons-group-label">Gender</FormLabel>
              <RadioGroup
                row
                aria-labelledby="demo-radio-buttons-group-label"
                defaultValue={formData?.gender}
                name="gender"
                value={formData?.gender}
                onChange={handleChange}
              >
                <FormControlLabel
                  value="Female"
                  control={<Radio />}
                  label="Female"
                />
                <FormControlLabel
                  value="Male"
                  control={<Radio />}
                  label="Male"
                />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid item>
            {Boolean(Object.keys(formData?.id_proof || {}).length) && (
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel id="demo-simple-select-helper-label">
                  Id Proof
                </InputLabel>
                <Select
                  labelId="demo-simple-select-helper-label"
                  id="demo-simple-select-helper"
                  label="Id Proof"
                  defaultValue={formData?.id_proof?.type}
                  // onChange={handleChange}
                >
                  {/* {Object.keys(formData?.id_proof).map((key) => {
                    return <MenuItem value={key}>{key}</MenuItem>;
                  })} */}
                  <MenuItem value={formData?.id_proof?.type}>
                    {formData?.id_proof?.type}
                  </MenuItem>
                </Select>
              </FormControl>
            )}
          </Grid>
          <Grid item xs={9} alignContent="center">
            <TextField
              fullWidth
              label="ID Proof"
              name="idProof"
              value={formData?.id_proof?.value}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Father/Husband's Name"
              name="father_husband_name"
              value={formData?.father_husband_name}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Blood Group"
              name="blood_group"
              value={formData?.blood_group}
              onChange={handleChange}
            />
          </Grid>
          {Boolean(stateOption?.length) && (
            <Grid item xs={12} sm={6}>
              {/* <TextField
              fullWidth
              label="State"
              name="state"
              value={formData?.state}
              onChange={handleChange}
            /> */}

              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-helper-label">
                  State
                </InputLabel>
                <Select
                  labelId="demo-simple-select-helper-label"
                  id="demo-simple-select-helper"
                  label="state"
                  name="State"
                  defaultValue={formData?.state}
                  onChange={handleChange}
                >
                  {stateOption.map((stateData) => {
                    return (
                      <MenuItem value={stateData.name}>
                        {stateData.name}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
          )}
          {Boolean(districtOption?.length) && (
            <Grid item xs={12} sm={6}>
              {/* <TextField
              fullWidth
              label="District"
              name="district"
              value={formData?.district}
              onChange={handleChange}
            /> */}
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-helper-label">
                  District
                </InputLabel>
                <Select
                  labelId="demo-simple-select-helper-label"
                  id="demo-simple-select-helper"
                  label="District"
                  name="district"
                  defaultValue={formData?.district}
                  onChange={handleChange}
                >
                  {districtOption.map((districtData) => {
                    return (
                      <MenuItem value={districtData.name}>
                        {districtData.name}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
          )}
          {Boolean(tehsilOption?.length) && (
            <Grid item xs={12} sm={6}>
              {/* <TextField
              fullWidth
              label="Tehsil"
              name="tehsil"
              value={formData?.tehsil}
              onChange={handleChange}
            /> */}
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-helper-label">
                  Tehsil
                </InputLabel>
                <Select
                  labelId="demo-simple-select-helper-label"
                  id="demo-simple-select-helper"
                  label="Tehsil"
                  name="tehsil"
                  defaultValue={formData?.tehsil}
                  onChange={handleChange}
                >
                  {tehsilOption.map((tehsilData) => {
                    return (
                      <MenuItem value={tehsilData.name}>
                        {tehsilData.name}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
          )}
          {Boolean(gramOption?.length) && (
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-helper-label">
                  Gram
                </InputLabel>
                <Select
                  labelId="demo-simple-select-helper-label"
                  id="demo-simple-select-helper"
                  label="Gram"
                  name="gram"
                  defaultValue={formData?.gram}
                  onChange={handleChange}
                >
                  {gramOption.map((gramData) => {
                    return (
                      <MenuItem value={gramData.name}>{gramData.name}</MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
          )}
          <Grid item xs={6} sm={6}>
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={formData?.phone}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Emergency Contact"
              name="emergency_contact"
              value={formData?.emergency_contact}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Box sx={{ p: 2, width: "100%" }}>
          <Typography variant="body2" color="textSecondary">
            ID: {formData?._id} | Created At:{" "}
            {moment(formData?.created_at).format("DD-MM-YYYY HH:MM")}
          </Typography>
        </Box>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          sx={{ color: colors.primary[100], background: colors.primary[500] }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditDialog;
