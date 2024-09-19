import React, { useEffect, useState, useRef } from "react";
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
  Card,
} from "@mui/material";
import { tokens } from "../../theme";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import cardsService from "../../services/cards";
import commonService from "../../services/common";
import ImageCropDialog from "../hospitals/ImageCropDialog";
import { isEmpty } from "lodash";
import CircularProgress from "@mui/material/CircularProgress";
import { createFilterOptions } from "@mui/material/Autocomplete";
import moment from "moment";
import NativeSelect from "@mui/material/NativeSelect";

let useEffectTypingTimer;

const EditDialog = ({ open, onClose, cardData, setIscardLoadtion }) => {
  const [profilePic, setProfilePic] = useState(null);
  const [formData, setFormData] = useState({ blood_group: "" });
  const [stateOption, setStateOption] = useState([]);
  const [districtOption, setDistrictOption] = useState([]);
  const [tehsilOption, setTehsilOption] = useState([]);
  const [gramOption, setGramOption] = useState([]);
  const [isCropDialogOpened, setIsCropDialogOpened] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [isImageUpdated, setIsImageUpdated] = useState(false);
  const fileInputRef = useRef(null);

  const [isDistrictLoading, setIsDistrictLoading] = useState(false);
  const [isStateLoading, setIsStateLoading] = useState(false);
  const [isTehsilLoading, setIsTehsilLoading] = useState(false);
  const [isGramLoading, setIsGramLoading] = useState(false);

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
    if (payload?.type == "district") {
      setIsDistrictLoading(true);
    }
    if (!payload?.type) {
      setIsStateLoading(true);
    }
    if (payload?.type == "tehsil") {
      setIsTehsilLoading(true);
    }
    if (payload?.type == "gram") {
      setIsGramLoading(true);
    }
    commonService.getAddressData(payload).then((data) => {
      if (payload?.type == "tehsil") {
        setTehsilOption(data || []);
        setIsTehsilLoading(false);
      } else if (payload?.type == "district") {
        setDistrictOption(data || []);
        setIsDistrictLoading(false);
      } else if (payload?.type == "gram") {
        console.log("data >>>>", data);

        setGramOption(data || []);
        setIsGramLoading(false);
      } else {
        setStateOption(data || []);
        setIsStateLoading(false);
      }
    });
  }

  useEffect(() => {
    clearTimeout(useEffectTypingTimer);
    useEffectTypingTimer = setTimeout(function () {
      // call API
      getAddressData();
    }, 10);

    // getAddressData({ type: "tehsil" });
    // getAddressData({ type: "gram" });
  }, [formData?.state, formData?.district, formData?.tehsil]);
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

  const handleSave = async (status) => {
    // // Send the image to another API
    let image;
    if (isImageUpdated) {
      image = profilePic;
    }
    let newFormData = {
      ...formData,
    };
    if (status) {
      newFormData.status = status;
    }
    setIscardLoadtion(true);
    cardsService.updateCard(newFormData, formData._id, image).finally(() => {
      setIscardLoadtion(false);
      onClose(true); // Close the dialog after saving
    });
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

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setProfilePic(reader.result);
        setIsImageUpdated(true);
      });
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card>
      <ImageCropDialog
        open={isCropDialogOpened}
        onClose={(e) => {
          e.stopPropagation();
          setIsCropDialogOpened(false);
        }}
        image={selectedImage}
        onCropComplete={handleImageUpdate}
        selectedImageIndex={0}
        mode="Edit"
      />
      <Dialog open={open} maxWidth="md">
        <DialogTitle>Edit Details</DialogTitle>
        {/* <DialogContent> */}
        <Grid container spacing={2} sx={{ px: 2 }}>
          <Grid container item xs={6} spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData?.name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Birth Year"
                name="birth_year"
                value={formData?.birth_year}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6} sm={6}>
              {formData?.gender && (
                <FormControl>
                  <FormLabel id="demo-radio-buttons-group-label">
                    Gender
                  </FormLabel>
                  <RadioGroup
                    row
                    aria-labelledby="demo-radio-buttons-group-label"
                    defaultValue={formData?.gender}
                    name="gender"
                    value={formData.gender}
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
              )}
            </Grid>

            <Grid item xs={4}>
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

            <Grid item xs={8} alignContent="center">
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
                label="Phone"
                name="phone"
                value={formData?.phone}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
          {/* Image container */}
          <Grid
            container
            item
            xs={6}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {/* image */}
            <Grid item xs={6}>
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
                      width: 360,
                      height: 360,
                      borderRadius: 2,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(profilePic);
                      setIsCropDialogOpened(true);
                    }}
                  />
                  <IconButton>
                    <UploadFileIcon
                      onClick={() => fileInputRef.current.click()}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }} // Hide the input
                      ref={fileInputRef} // Reference to programmatically trigger it
                      onChange={handleFileChange} // Handle the file change event
                    />
                  </IconButton>
                </Box>
              </Box>
            </Grid>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel id="blood_group-helper-label">Blood Group</InputLabel>
              <Select
                labelId="blood_group-helper-label"
                id="blood_group-dropdown"
                label="Blood Group"
                name="blood_group"
                fullWidth
                onChange={handleChange}
                defaultValue={formData?.blood_group}
                value={formData?.blood_group}
              >
                <MenuItem value="A+">A+</MenuItem>
                <MenuItem value="A-">A-</MenuItem>
                <MenuItem value="B+">B+</MenuItem>
                <MenuItem value="AB+">AB+</MenuItem>
                <MenuItem value="AB-">AB-</MenuItem>
                <MenuItem value="O+">O+</MenuItem>
                <MenuItem value="O-">O-</MenuItem>
              </Select>
            </FormControl>
            {/* <TextField
              fullWidth
              label="Blood Group"
              name="blood_group"
              value={formData?.blood_group}
              onChange={handleChange}
            /> */}
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
                <InputLabel id="state-helper-label">State</InputLabel>
                <Select
                  labelId="state-helper-label"
                  id="state-dropdown"
                  label="state"
                  name="State"
                  disabled={isStateLoading}
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
                {isStateLoading && (
                  <CircularProgress
                    size={24}
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      marginTop: "-12px",
                      marginLeft: "-12px",
                    }}
                  />
                )}
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
                filterOptions={createFilterOptions({
                  matchFrom: "start", // Options are filtered from the start of the string
                  stringify: (option) => option.name, // Specifies which part of the option to match against
                })}
                disabled={isDistrictLoading}
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
                  <Box sx={{ position: "relative" }}>
                    {isDistrictLoading ? (
                      <CircularProgress
                        size={24}
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          marginTop: "-12px",
                          marginLeft: "-12px",
                        }}
                      />
                    ) : null}
                    <TextField
                      {...params}
                      label="District"
                      variant="outlined"
                    />
                  </Box>
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
                <InputLabel id="tehsil-helper-label">Tehsil</InputLabel>
                <Select
                  labelId="tehsil-helper-label"
                  id="tehsil-dropdown"
                  label="Tehsil"
                  name="tehsil"
                  disabled={isTehsilLoading}
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
                {isTehsilLoading ? (
                  <CircularProgress
                    size={24}
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      marginTop: "-12px",
                      marginLeft: "-12px",
                    }}
                  />
                ) : null}
              </FormControl>
            </Grid>
          )}

          {Boolean(gramOption?.length) && (
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <Autocomplete
                  options={gramOption.map((gram) => {
                    return {
                      ...gram,
                      label: `${gram.name}, ${gram.grampanchayat_name}`,
                    };
                  })}
                  disabled={isGramLoading}
                  filterOptions={createFilterOptions({
                    matchFrom: "any", // Options are filtered from the start of the string
                    stringify: (option) => option.label, // Specifies which part of the option to match against
                  })}
                  // defaultValue={formData?.area}
                  {...(!isEmpty(formData?.area)
                    ? { value: formData?.area }
                    : { value: "" })}
                  onChange={(e, newValue, value) => {
                    if (newValue) {
                      setFormData((prev) => ({
                        ...prev,
                        area: newValue.name,
                      }));
                    } else {
                      if (formData?.area != "") {
                        setFormData((prev) => ({
                          ...prev,
                          area: "",
                        }));
                      }
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
                            {option.label}
                          </Typography>
                        </Grid>
                      </Box>
                    );
                  }}
                  renderInput={(params) => (
                    <Box>
                      {isGramLoading ? (
                        <CircularProgress
                          size={24}
                          sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            marginTop: "-12px",
                            marginLeft: "-12px",
                          }}
                        />
                      ) : null}
                      <TextField
                        {...params}
                        label="Gram Panchayat"
                        variant="outlined"
                      />
                    </Box>
                  )}
                />
              </FormControl>
            </Grid>
          )}
        </Grid>
        {/* </DialogContent> */}
        <DialogActions>
          <Box sx={{ p: 2, width: "100%" }}>
            <Typography variant="body2" color="textSecondary">
              ID: {formData?._id} | Created At:{" "}
              {moment(formData?.created_at).format("DD-MM-YYYY HH:MM")}
            </Typography>
          </Box>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleSave("REPRINT");
            }}
            variant="contained"
            sx={{ color: colors.primary[100], background: colors.primary[500] }}
          >
            Reprint
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleSave();
            }}
            variant="contained"
            sx={{ color: colors.primary[100], background: colors.primary[500] }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default EditDialog;
