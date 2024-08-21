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
  Select,
  Avatar,
  Autocomplete,
} from "@mui/material";
import { tokens } from "../../theme";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import cardsService from "../../services/cards";
import commonService from "../../services/common";
import ImageCropDialog from "../hospitals/ImageCropDialog";
import { isEmpty } from "lodash";

import moment from "moment";

const EditDialog = ({ open, onClose, cardData }) => {
  const [profilePic, setProfilePic] = useState(null);
  const [formData, setFormData] = useState({});
  const [stateOption, setStateOption] = useState([]);
  const [districtOption, setDistrictOption] = useState([]);
  const [tehsilOption, setTehsilOption] = useState([]);
  const [gramOption, setGramOption] = useState([]);
  const [isCropDialogOpened, setIsCropDialogOpened] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [isImageUpdated, setIsImageUpdated] = useState(false);

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
    // // Send the image to another API
    let image;
    if (isImageUpdated) {
      image = profilePic;
    }
    cardsService.updateCard(formData, formData._id, image);

    onClose(); // Close the dialog after saving
  };

  useEffect(() => {
    setFormData(cardData);
    setProfilePic(cardData?.image);
  }, [cardData]);

  // HandleCropped Images
  function handleImageUpdate({ croppedImage }) {
    setProfilePic(croppedImage);
    setIsCropDialogOpened(false);
    setIsImageUpdated(true);
  }

  return (
    <Box>
      <ImageCropDialog
        open={isCropDialogOpened}
        onClose={() => {
          setIsCropDialogOpened(false);
        }}
        image={selectedImage}
        onCropComplete={handleImageUpdate}
        selectedImageIndex={0}
        mode="Edit"
      />
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
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "16px",
                    justifyContent: "center",
                  }}
                >
                  <Avatar
                    src={profilePic}
                    alt="Profile Pic"
                    sx={{
                      width: 200,
                      height: 200,
                      borderRadius: 2,
                    }}
                    onClick={() => {
                      setSelectedImage(profilePic);
                      setIsCropDialogOpened(true);
                    }}
                  />
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
                <FormLabel id="demo-radio-buttons-group-label">
                  Gender
                </FormLabel>
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
                {/* <FormControl fullWidth> */}
                {/* <InputLabel id="demo-simple-select-helper-label">
                    District
                  </InputLabel> */}
                <Autocomplete
                  options={districtOption}
                  defaultValue={formData?.district}
                  {...(!isEmpty(formData?.district)
                    ? { value: formData?.district }
                    : { value: "" })}
                  onChange={(e, newValue, value) => {
                    if (newValue) {
                      setFormData((prev) => ({
                        ...prev,
                        district: newValue.name,
                      }));
                    } else {
                      setFormData((prev) => ({
                        ...prev,
                        district: "",
                      }));
                    }

                    // handleChange({ e, newValue });
                  }}
                  renderOption={(props, option) => {
                    const { key, ...optionProps } = props;
                    return (
                      <Box
                        key={key}
                        sx={{ p: "3px", display: "block" }}
                        {...optionProps}
                      >
                        <Grid container>
                          <Typography fontSize={12} fontWeight={500}>
                            {option.name}
                          </Typography>
                        </Grid>
                      </Box>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="District"
                      variant="outlined"
                    />
                  )}
                />
                {/* </FormControl> */}
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
                  <Autocomplete
                    options={gramOption}
                    defaultValue={formData?.gram}
                    {...(!isEmpty(formData?.gram)
                      ? { value: formData?.gram }
                      : { value: "" })}
                    onChange={(e, newValue, value) => {
                      if (newValue) {
                        setFormData((prev) => ({
                          ...prev,
                          gram: newValue.name,
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          gram: "",
                        }));
                      }
                    }}
                    renderOption={(props, option) => {
                      const { key, ...optionProps } = props;
                      return (
                        <Box
                          key={key}
                          sx={{ p: "3px", display: "block" }}
                          {...optionProps}
                        >
                          <Grid container>
                            <Typography fontSize={12} fontWeight={500}>
                              {option.name}
                            </Typography>
                          </Grid>
                        </Box>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Gram" variant="outlined" />
                    )}
                  />
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
    </Box>
  );
};

export default EditDialog;
