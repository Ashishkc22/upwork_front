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
import CloseIcon from "@mui/icons-material/Close";

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

  const [isJanpadPanchyatLoading, setIsJanpadPanchyatLoading] = useState(false);
  const [janpadOption, setJanpadOption] = useState([]);

  const [isGramPanchyatLoading, setIsGramPanchyatLoading] = useState(false);
  const [gramPanchayatOptions, setGramPanchayatOptions] = useState([]);

  const [rotation, setRotation] = useState(0);

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const nextTypeMap = {
    district: ["tehsil", "janPanchayat"],
    janPanchayat: "gramPanchayat",
  };

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
    if (payload?.type == "janPanchayat") {
      setIsJanpadPanchyatLoading(true);
    }
    if (payload?.type == "gramPanchayat") {
      payload.params.showGrams = true;
      setIsGramPanchyatLoading(true);
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
    return new Promise((resolve, reject) => {
      commonService
        .getAddressData(payload)
        .then((data) => {
          if (payload?.type == "tehsil") {
            setTehsilOption(data || []);
            setIsTehsilLoading(false);
          } else if (payload?.type == "janPanchayat") {
            setJanpadOption(data || []);
            setIsJanpadPanchyatLoading(false);
          } else if (payload?.type == "gramPanchayat") {
            let newGrams = [];
            let selectedGramPanchayatName = null;
            data.forEach(
              (d) =>
                (newGrams = newGrams.concat(
                  d.grams?.map((g) => {
                    const constructedObject = {
                      gramId: g._id,
                      gramName: g.name,
                      gramPanchayatId: d._id,
                      gramPanchayatName: d.name,
                      name: `${d.name}, ${g.name}`,
                    };
                    if (
                      cardData?.gramPanchayat?.name === d.name &&
                      cardData?.gram?.name === g.name
                    ) {
                      selectedGramPanchayatName = constructedObject;
                    } else if (
                      cardData?.gramPanchayat === d.name &&
                      cardData?.gram === g.name
                    ) {
                      selectedGramPanchayatName = constructedObject;
                    }
                    return constructedObject;
                  })
                ))
            );
            setGramPanchayatOptions(newGrams || []);
            if (selectedGramPanchayatName) {
              setFormData((pd) => ({
                ...pd,
                gramPanchayat: selectedGramPanchayatName,
              }));
            }
            setIsGramPanchyatLoading(false);
          } else if (payload?.type == "district") {
            setDistrictOption(data || []);
            setIsDistrictLoading(false);
          } else if (payload?.type == "gram") {
            setGramOption(data || []);
            setIsGramLoading(false);
          } else {
            setStateOption(data || []);
            setIsStateLoading(false);
          }
          resolve(data);
        })
        .catch(reject);
    });
  }

  useEffect(() => {
    clearTimeout(useEffectTypingTimer);
    useEffectTypingTimer = setTimeout(function () {
      // call API
      // getAddressData();
    }, 10);

    // getAddressData({ type: "tehsil" });
    // getAddressData({ type: "gram" });
  }, [formData?.state]);
  //  formData?.district, formData?.tehsil, formData.janpad

  function handleAddressAPICalls() {
    getAddressData().then((_stateOptions) => {
      const selectedState = _stateOptions.find(
        (data) => data.name === cardData.state.name
      );
      if (selectedState) {
        getAddressData({
          type: "district",
          params: { refId: selectedState._id },
        }).then((_districtOption) => {
          if (_districtOption || cardData.district) {
            const selectedDistrict = _districtOption.find((data) => {
              const districtName = data?.name?.toLowerCase();
              if (typeof cardData?.district === "string") {
                return districtName === cardData?.district?.toLowerCase();
              }
              if (typeof cardData?.district === "object" && cardData !== null) {
                return districtName === cardData?.district?.name?.toLowerCase();
              }
              return false;
            });
            if (selectedDistrict) {
              getAddressData({
                type: "tehsil",
                params: { refId: selectedDistrict._id },
              });
              getAddressData({
                type: "janPanchayat",
                params: { refId: selectedDistrict._id },
              }).then((_janpadOption) => {
                if (_janpadOption || cardData.janpad) {
                  const selected = _janpadOption.find((data) => {
                    const districtName = data?.name?.toLowerCase();
                    if (typeof cardData.janpad === "string") {
                      return districtName === cardData.janpad?.toLowerCase();
                    }
                    if (
                      typeof cardData.janpad === "object" &&
                      cardData !== null
                    ) {
                      return (
                        districtName === cardData.janpad?.name?.toLowerCase()
                      );
                    }
                    return false;
                  });
                  if (selected) {
                    getAddressData({
                      type: "gramPanchayat",
                      params: {
                        refId: selected._id,
                      },
                    });
                  }
                }
              });
            }
          }
        });
      }
    });
  }

  // useEffect(() => {
  //   if (stateOption || formData.state) {
  //     const selectedState = stateOption.find(
  //       (data) => data.name === formData.state
  //     );
  //     if (selectedState) {
  //       getAddressData({
  //         type: "district",
  //         params: { refId: selectedState._id },
  //       });
  //     } else {
  //     }
  //   }
  // }, [stateOption, formData?.state]);

  useEffect(() => {
    if (districtOption || formData.district) {
      const selectedDistrict = districtOption.find(
        (data) =>
          data.name === formData.district.name ||
          data.name === formData.district
      );
      if (selectedDistrict) {
        getAddressData({
          type: "tehsil",
          params: { refId: selectedDistrict._id },
        });
        getAddressData({
          type: "janPanchayat",
          params: { refId: selectedDistrict._id },
        });
      }
    }
  }, [districtOption, formData?.district]);

  useEffect(() => {
    if (janpadOption || formData.janpad) {
      const selected = janpadOption.find(
        (data) => data.name === formData.janpad
      );
      if (selected) {
        getAddressData({
          type: "gramPanchayat",
          params: {
            refId: selected._id,
          },
        });
      }
    }
  }, [janpadOption, formData.janpad]);

  // useEffect(() => {
  //   if (gramPanchayatOptions || formData.gramPanchayat) {
  //     console.log("formData", formData.gramPanchayat);
  //     const selected = gramPanchayatOptions.find(
  //       (data) =>
  //         data.gramPanchayatId === formData.gramPanchayat.gramPanchayatId &&
  //         data.gramId === formData.gramPanchayat.gramId
  //     );
  //     console.log("selected", selected);
  //   }
  // }, [gramPanchayatOptions, formData.gramPanchayat]);

  const handleRotateLeft = () => setRotation((prev) => prev - 90);
  const handleRotateRight = () => setRotation((prev) => prev + 90);
  function removeEmptyValues(obj) {
    return Object.fromEntries(
      Object.entries(obj).filter(
        ([key, value]) => value != null && value !== "" && value.length
      )
    );
  }
  const handleSave = async (status) => {
    // // Send the image to another API
    let image;
    if (isImageUpdated) {
      image = profilePic;
    }
    let newFormData = {
      id: formData._id,
      ...removeEmptyValues(formData),
    };
    delete newFormData._id;
    delete newFormData.status_updated_at;
    delete newFormData.created_at;
    delete newFormData.created_by;
    delete newFormData.created_by_uid;
    delete newFormData.issue_date;
    delete newFormData.unique_number;
    delete newFormData.s_no;
    delete newFormData.status_history;
    delete newFormData.__v;
    delete newFormData.address;
    delete newFormData.status;
    delete newFormData.created_by_name;
    delete newFormData.area;
    newFormData.state = "63c681806072b29c2133326e";
    if (formData.district) {
      newFormData.district = districtOption.find(
        (data) => data.name === formData.district
      )?._id;
    }
    if (formData.tehsil) {
      newFormData.tehsil = tehsilOption.find(
        (data) => data.name === formData.tehsil
      )?._id;
    }
    if (formData.janpad) {
      newFormData.janpad = janpadOption.find(
        (data) => data.name === formData.janpad
      )?._id;
    }

    if (formData.gramPanchayat) {
      const gramAndGramPanchyat = gramPanchayatOptions.find(
        (data) =>
          data.gramPanchayatId === formData.gramPanchayat.gramPanchayatId &&
          data.gramId === formData.gramPanchayat.gramId
      );
      newFormData.gramPanchayat = gramAndGramPanchyat.gramPanchayatId;
      newFormData.gram = gramAndGramPanchyat.gramId;
    }
    // if (formData.gram) {
    //   newFormData.gram = gramOption.find(
    //     (data) => data.name === formData.gram
    //   )?._id;
    // }

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
    if (cardData?.state) {
      handleAddressAPICalls();
    }
    setFormData({
      ...cardData,
      state: cardData?.state?.name || cardData?.state || "",
      district: cardData?.district?.name || cardData?.district || "",
      tehsil: cardData?.tehsil?.name || cardData?.tehsil || "",
      janpad: cardData?.janpad?.name || cardData?.janpad || "",
      // gramPanchayat:
      //   `${cardData?.gramPanchayat?.name || cardData?.gramPanchayat}, ${
      //     cardData?.gram?.name || cardData?.gram
      //   }` ||
      //   cardData?.gramPanchayat?.name ||
      //   cardData?.gramPanchayat ||
      // "",
      // gram: cardData?.gram?.name || cardData?.gram || "",
    });
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

  const handleMemberChanges = ({ index, value, name, isRemove = false }) => {
    setFormData((prev) => {
      const familyMembers = prev.family_members || [];
      if (isRemove) {
        familyMembers.splice(index, 1);
      } else {
        familyMembers[index][name] = value;
      }
      return { ...prev, family_members: familyMembers };
    });
  };

  const FamilyMember = (index) => {
    return (
      <Box sx={{ display: "flex", columnGap: 1, alignItems: "center" }}>
        <Typography component="div" sx={{ fontWeight: 600, fontSize: "13px" }}>
          {index + 1} .{" "}
        </Typography>
        <TextField
          label="Name"
          name="family_member_name"
          value={formData?.family_members?.[index]?.name}
          onChange={(e) =>
            handleMemberChanges({ index, value: e.target.value, name: "name" })
          }
        />
        <TextField
          label="Birth Year"
          name="family_member_name_birth_year"
          value={formData?.family_members?.[index]?.birth_year}
          onChange={(e) =>
            handleMemberChanges({
              index,
              value: e.target.value,
              name: "birth_year",
            })
          }
        />
        <FormControl sx={{ width: 200 }}>
          <InputLabel id="Gender-label">Gender</InputLabel>
          <Select
            labelId="Gender-label"
            id="Gender-dropdown"
            label="Gender"
            name="Gender"
            defaultValue={formData?.family_members?.[index]?.gender}
            onChange={(e) =>
              handleMemberChanges({
                index,
                value: e.target.value,
                name: "gender",
              })
            }
          >
            {["Male", "Female", "Other"].map((value) => {
              return <MenuItem value={value}>{value}</MenuItem>;
            })}
          </Select>
        </FormControl>
        <FormControl sx={{ width: 200 }}>
          <InputLabel id="relation-label">Relation</InputLabel>
          <Select
            labelId="relation-label"
            id="relation-dropdown"
            label="Relation"
            name="relation"
            defaultValue={formData?.family_members?.[index]?.relation}
            onChange={(e) =>
              handleMemberChanges({
                index,
                value: e.target.value,
                name: "relation",
              })
            }
          >
            {["Wife", "Daughter", "Son"].map((value) => {
              return <MenuItem value={value}>{value}</MenuItem>;
            })}
          </Select>
        </FormControl>
        <IconButton
          onClick={() => handleMemberChanges({ index, isRemove: true })}
        >
          <CloseIcon />
        </IconButton>
      </Box>
    );
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
        <DialogContent sx={{ p: 0, m: 0 }}>
          <Grid container spacing={2} sx={{ px: 2, py: 1 }}>
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
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Birth Year"
                  name="birth_year"
                  value={formData?.birth_year}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6} sm={7}>
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
                        control={<Radio size="small" />}
                        label="Female"
                      />
                      <FormControlLabel
                        value="Male"
                        control={<Radio size="small" />}
                        label="Male"
                      />
                      <FormControlLabel
                        value="Other"
                        control={<Radio size="small" />}
                        label="Other"
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

              <Grid item xs={8}>
                <TextField
                  fullWidth
                  label="ID Proof"
                  name="idProof"
                  value={formData?.id_proof?.value}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                {formData?.card_type !== "Family" && (
                  <TextField
                    fullWidth
                    label="Father/Husband's Name"
                    name="father_husband_name"
                    value={formData?.father_husband_name}
                    onChange={handleChange}
                  />
                )}
              </Grid>
              {formData.card_type !== "Family" && (
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel id="blood_group-helper-label">
                      Blood Group
                    </InputLabel>
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
                      <MenuItem value="B-">B-</MenuItem>
                      <MenuItem value="AB+">AB+</MenuItem>
                      <MenuItem value="AB-">AB-</MenuItem>
                      <MenuItem value="O+">O+</MenuItem>
                      <MenuItem value="O-">O-</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
              <Grid item xs={6}>
                {formData?.card_type !== "Family" && (
                  <TextField
                    fullWidth
                    label="Abha ID"
                    name="Abha ID"
                    value={formData?.abha_id}
                    onChange={handleChange}
                  />
                )}
              </Grid>
              <Grid item xs={6}>
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
                        height: 300,
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

            {!!formData.family_members?.length && (
              <Grid item xs={12}>
                <Typography fontSize={12} fontWeight={600} sx={{ mb: 2 }}>
                  Members
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    rowGap: 2,
                    my: 1,
                  }}
                >
                  {formData.family_members?.map((data, index) =>
                    FamilyMember(index)
                  )}
                </Box>
                <Box sx={{ display: "flex", justifyContent: "end" }}>
                  <Button
                    onClick={() =>
                      formData.family_members.length < 4 &&
                      setFormData((pre) => {
                        const temp = pre?.family_members || [];
                        temp.push({});
                        return { ...pre, family_members: temp };
                      })
                    }
                    disabled={formData.family_members.length === 4}
                  >
                    Add Members
                  </Button>
                </Box>
              </Grid>
            )}

            <Box
              sx={{
                px: 2,
                py: 1,
                display: "flex",
                width: "100%",
              }}
            >
              <Typography variant="h6">Area: </Typography>
              <Typography
                variant="body2"
                sx={{ textAlign: "center", alignContent: "center", px: 1 }}
              >
                {formData?.area}
              </Typography>
            </Box>

            {/* {Boolean(stateOption?.length) && (
            <Grid item xs={12} sm={6}>
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
          )} */}
            {Boolean(districtOption?.length) && (
              <Grid item xs={12} sm={3}>
                <Autocomplete
                  options={districtOption}
                  getOptionLabel={(option) => {
                    if (typeof option === "string") {
                      return option;
                    }
                    return option.name;
                  }}
                  filterOptions={createFilterOptions({
                    matchFrom: "start",
                    stringify: (option) => option.name,
                  })}
                  disabled={isDistrictLoading}
                  defaultValue={formData?.district}
                  value={formData?.district ? formData.district : ""}
                  onChange={(e, newValue, value) => {
                    setFormData((prev) => ({
                      ...prev,
                      district: newValue?.name ? newValue.name : "",
                    }));

                    if (formData?.district !== newValue?.name) {
                      setFormData((prev) => ({
                        ...prev,
                        tehsil: "",
                        janpad: "",
                        gramPanchayat: "",
                        gram: "",
                      }));
                      setGramPanchayatOptions(() => []);
                      setGramOption(() => []);
                    }
                  }}
                  renderOption={(props, option) => {
                    const { key, ...optionProps } = props;
                    // console.log("props", props);
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
              </Grid>
            )}
            {Boolean(janpadOption.length) && (
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel id="janpad-helper-label">
                    Janpad Panchyat
                  </InputLabel>
                  <Select
                    labelId="janpad-helper-label"
                    id="janpad-dropdown"
                    label="Janpad Panchyat"
                    name="janpad"
                    disabled={isJanpadPanchyatLoading}
                    defaultValue={formData?.janpad}
                    // value={formData?.janpad ? formData.janpad : ""}
                    onChange={handleChange}
                  >
                    {janpadOption.map((option) => {
                      return (
                        <MenuItem value={option.name}>{option.name}</MenuItem>
                      );
                    })}
                  </Select>
                  {isJanpadPanchyatLoading ? (
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
            {Boolean(gramPanchayatOptions.length) && (
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel id="gramPanchayat-helper-label">
                    Gram Panchayat
                  </InputLabel>
                  <Select
                    labelId="gramPanchayat-helper-label"
                    id="gramPanchayat-dropdown"
                    label="Gram Panchayat"
                    name="gramPanchayat"
                    disabled={isGramPanchyatLoading}
                    defaultValue={formData?.gramPanchayat}
                    onChange={handleChange}
                  >
                    {gramPanchayatOptions.map((option) => {
                      return <MenuItem value={option}>{option.name}</MenuItem>;
                    })}
                  </Select>
                  {isGramPanchyatLoading ? (
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

            {Boolean(tehsilOption?.length) && (
              <Grid item xs={12} sm={3}>
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
            {/* 
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
                      matchFrom: "any",
                      stringify: (option) => option.label,
                    })}
                    {...(!isEmpty(formData?.area)
                      ? { value: formData?.area }
                      : { value: "" })}
                    onChange={(e, newValue, value) => {
                      if (newValue) {
                        setFormData((prev) => ({
                          ...prev,
                          area: `${newValue.name},${newValue.grampanchayat_name}`,
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
            )} */}
            {Boolean(gramOption?.length) && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <Autocomplete
                    options={gramOption}
                    disabled={isGramLoading}
                    filterOptions={createFilterOptions({
                      matchFrom: "any",
                      stringify: (option) => option.label,
                    })}
                    getOptionLabel={(option) => {
                      if (typeof option === "string") {
                        return option;
                      }
                      return option.name;
                    }}
                    value={formData?.gram}
                    onChange={(e, newValue, value) => {
                      setFormData((prev) => ({
                        ...prev,
                        gram: newValue?.name ? newValue.name : "",
                      }));
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
                          label="Gram"
                          variant="outlined"
                        />
                      </Box>
                    )}
                  />
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Box sx={{ p: 2, width: "100%", position: "sticky", bottom: "0px" }}>
            <Typography variant="body2" color="textSecondary">
              ID: {formData?._id} | Created At:{" "}
              {moment(formData?.created_at).format("DD-MM-YYYY HH:MM")}
            </Typography>
          </Box>
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
              handleSave("REPRINT");
            }}
            variant="contained"
            sx={{ color: colors.primary[100], background: colors.primary[500] }}
          >
            Reprint
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default EditDialog;
