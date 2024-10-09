import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  Box,
  Autocomplete,
  Typography,
  Grid,
} from "@mui/material";
import ImageCropDialog from "./ImageCropDialog";
import common from "../../services/common";
import field_executives from "../../services/field_executives";
import { isEmpty } from "lodash";
import { styled } from "@mui/material/styles";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import commonService from "../../services/common";
import SignWhiteBoard from "./SignWhiteBoard";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import storageUtil from "../../utils/storage.util";
import CancelPresentationIcon from "@mui/icons-material/CancelPresentation";

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

function UploadImage({ src, handleAvatarClick, handleUploadClick }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        marginBottom: "16px",
        justifyContent: "center",
      }}
    >
      <Avatar
        src={src}
        alt="Profile Pic"
        sx={{
          width: 100,
          height: 100,
          marginRight: "10px",
          borderRadius: 2,
        }}
        onClick={handleAvatarClick}
      />
      <IconButton>
        <UploadFileIcon onClick={handleUploadClick} />
      </IconButton>
    </div>
  );
}

const EditProfileDialog = ({
  open,
  onClose,
  data = {},
  teamLeaderDetails,
  addTLMode = false,
  setUserData,
}) => {
  const [profilePic, setProfilePic] = useState(null);
  const [frontID, setFrontID] = useState(null);
  const [backID, setBackID] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [alternatePhone, setAlternatePhone] = useState("");
  const [janPanchayatOptions, setJanPanchayatOptions] = useState([]);
  const [janPanchayat, setJanPanchayat] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState(null);
  const [district, setDistrict] = useState(null);
  const [emergencyNumber, setEmergencyNumber] = useState("");
  const [teamLeader, setTeamLeader] = useState("");
  const [backupData, setBackupData] = useState({});
  const [stateOptions, setStateOption] = useState([]);

  // const [formErrors, setFormErros] = useState({
  //   name: "required",
  //   phone: "required",
  //   alternateNumber: "required",
  //   email: "required",
  //   address: "required",
  //   state: "required",
  // });

  const [imagesToUpload, setImagesToUpload] = useState({});

  const [aadhaarFront, setAadhaarFront] = useState("");
  const [aadhaarBack, setSadhaarBack] = useState("");
  // District states
  const [districtOption, setDistrictOption] = useState([]);
  const [teamLeaderOption, setTeamLeaderOption] = useState([]);

  const [selectedImage, setSelectedImage] = useState("");
  const [isCropDialogOpened, setIsCropDialogOpened] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState("");

  const [updatedImagesNames, setUpdatedImagesNames] = useState({});
  const fileInputRef = useRef(null);
  const [openSignatureBoard, setOpenSignatureBoard] = useState(false);

  const [signatureDataUrl, setSignatureDataUrl] = useState("");
  const [draftDataCleared, setDraftDataCleared] = useState(false);

  useEffect(() => {
    if (!isEmpty(teamLeaderDetails)) {
      setTeamLeader(teamLeaderDetails.tl_id);
    }
  }, [teamLeaderDetails]);

  // const handleFileChange = (event, setFile) => {
  //   const file = event.target.files[0];
  //   if (file) {
  //     setFile(URL.createObjectURL(file));
  //   }
  // };

  useEffect(() => {
    if (selectedImage) {
      setIsCropDialogOpened(true);
    }
  }, [selectedImage]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImagesToUpload((pre) => {
          const preState = { ...pre };
          preState[selectedImageIndex] = reader.result;
          return preState;
        });
        setUpdatedImagesNames((pre) => {
          return {
            ...pre,
            [selectedImageIndex]: true,
          };
        });
        // if (selectedImageIndex === "Profile") {
        //   setProfilePic(reader.result);
        // } else if (selectedImageIndex === "aFront") {
        //   setAadhaarFront(reader.result);
        // } else {
        //   setSadhaarBack(reader.result);
        // }
      });
      reader.readAsDataURL(file);
    }
  };

  async function getAddressData(payload) {
    let draftData;
    if (addTLMode) {
      draftData = storageUtil.getStorageData("TL-draft-data") || {};
    }

    const _data = await common.getAddressData(payload);
    console.log("address ", _data);

    if (payload?.type == "district" && !_data?.error) {
      setDistrictOption(_data);
      if (!isEmpty(_data) && data?.district) {
        setDistrict(_data?.find((d) => d.name === data.district));
      }
    } else if (payload?.type == "janPanchayat") {
      setJanPanchayatOptions(_data);
      if (!isEmpty(_data) && data?.janPanchayat) {
        setJanPanchayat(_data?.find((d) => d.name === data.janPanchayat));
      }
    } else {
      if (!_data?.error) {
        setStateOption(_data);
        if (!isEmpty(_data) && data?.state) {
          setState(_data?.find((d) => d.name === data.state));
        } else if (addTLMode && draftData.state) {
          setState(_data?.find((d) => d.name === draftData.state.name));
        }
      }
    }
  }

  useEffect(() => {
    if (!isEmpty(data)) {
      field_executives
        .getUsers({
          params: {
            role: "TL",
            onlyInfo: true,
          },
        })
        .then((data) => {
          setTeamLeaderOption(data.data);
        });

      setImagesToUpload((pre) => {
        const temp = { ...pre };
        if (data?.image) {
          temp.Profile = data?.image;
        }
        if (data?.id_proof?.front) {
          temp.aFront = data?.id_proof?.front;
        }
        if (data?.id_proof?.back) {
          temp.aBack = data?.id_proof?.back;
        }
        if (data?.passportImage) {
          temp.Passport = data?.passportImage;
        }
        if (data?.registrationFormImage) {
          temp.RegistrationForm = data?.registrationFormImage;
        }
        if (data?.agreementImage) {
          temp.Agreement = data?.agreementImage;
        }
        if (data?.panCardImage) {
          temp.PanCard = data?.panCardImage;
        }
        return temp;
      });
      if (data) {
        setName(data.name);
        setPhone(data.phone);
        setEmail(data.email);
        setPassword(data.password);
        setAddress(data.address);
        setState(data.state);
        setDistrict(data.district);
        setEmergencyNumber(data.emergency_contact);
        setSignatureDataUrl(data?.signatureImage);
      }
      if (teamLeaderDetails) {
        setTeamLeader(teamLeaderDetails.name);
      }
      setBackupData(data);
    }
  }, [data]);

  useEffect(() => {
    console.log("data change");

    if (!isEmpty(data)) {
      if (isEmpty(stateOptions)) {
        console.log("state ap call");

        getAddressData({ type: "state" });
      } else if (isEmpty(districtOption)) {
        const selectedState = stateOptions.find((s) => s.name === data.state);
        if (data.district && !isEmpty(selectedState)) {
          console.log("district ap call", selectedState);
          getAddressData({
            type: "district",
            params: { stateId: selectedState?._id },
          });
        }
      } else if (isEmpty(janPanchayatOptions)) {
        if (data.janPanchayat && !isEmpty(districtOption)) {
          const selectedJanPanchyat = districtOption.find(
            (s) => s.name === data.district
          );
          getAddressData({
            type: "janPanchayat",
            params: { districtId: selectedJanPanchyat?._id },
          });
        }
      }
    }
  }, [data, stateOptions, districtOption]);

  function handleSaveFormData() {
    if (addTLMode) {
      field_executives
        .saveTLDetails({
          name: name || data?.name,
          phone: phone || data?.phone,
          ...((alternatePhone || data.alternatePhone) && {
            alternatePhone: alternatePhone || data.alternatePhone,
          }),
          email: email || data?.email,
          password: password || data.password,
          address: address || data.address,
          state: state.name || data.state,
          district: district.name || data.district,
          ...((janPanchayat || data.janPanchayat) && {
            janPanchayat: janPanchayat.name || data.janPanchayat,
          }),
          ...((teamLeader || data.team_leader_id) && {
            team_leader_id: teamLeader || data.team_leader_id,
          }),
          ...((emergencyNumber || data.emergency_contact) && {
            emergency_contact: emergencyNumber || data.emergency_contact,
          }),
          imagesToUpload,
          signatureDataUrl,
        })
        .then(() => {
          onClose(true);
        });
    } else {
      field_executives
        .saveFieldExecutiveForm({
          ...(data._id && { id: data._id }),
          name: name || data?.name,
          phone: phone || data?.phone,
          email: email || data?.email,
          password: password || data.password,
          address: address || data.address,
          ...((janPanchayat || data.janPanchayat) && {
            janPanchayat:
              janPanchayat.name || janPanchayat || data.janPanchayat,
          }),
          state: state?.name || state || data.state,
          district: district?.name || district || data.district,
          team_leader_id: teamLeader || data.team_leader_id,
          emergency_contact: emergencyNumber || data.emergency_contact,
          id_proof: data.id_proof,
          image: data.image,
          signatureDataUrl,
          updatedImagesNames,
          images: imagesToUpload,
        })
        .then(() => {
          onClose(true);
        });
    }
  }

  function handleImageUpdate({ croppedImage, selectedImageIndex }) {
    setImagesToUpload((pre) => {
      return {
        ...pre,
        [selectedImageIndex]: croppedImage,
      };
    });
    setUpdatedImagesNames((pre) => {
      return {
        ...pre,
        [selectedImageIndex]: true,
      };
    });
    setIsCropDialogOpened(false);
  }

  const getJanpadPanchyat = () => {
    commonService.getAddressAllJanpadPanchyat().then((data) => {
      setJanPanchayatOptions(data);
    });
  };

  const draftFormData = () => {
    if (addTLMode && !draftDataCleared) {
      storageUtil.setStorageData(
        {
          ...(name && { name }),
          ...(phone && { phone }),
          ...(alternatePhone && { alternatePhone }),
          ...(janPanchayat && { janPanchayat }),
          ...(email && { email }),
          ...(address && { address }),
          ...(state && { state }),
          ...(district && { district }),
          ...(emergencyNumber && { emergencyNumber }),
        },
        "TL-draft-data"
      );
    }
  };

  useEffect(() => {
    // getJanpadPanchyat();
    if (addTLMode) {
      const draftData = storageUtil.getStorageData("TL-draft-data") || {};
      setName(draftData.name);
      setPhone(draftData.phone);
      setEmail(draftData.email);
      setAddress(draftData.address);
      setAlternatePhone(draftData.alternatePhone);
      // setEmergencyNumber(draftData.emergency_contact);
      if (draftData.state) {
        getAddressData({ type: "state" }).then(() => {
          // setState(draftData.state);
          if (draftData.district) {
            getAddressData({
              type: "district",
              params: { stateId: draftData.state._id },
            }).then(() => {
              setDistrict(draftData.district);
              if (draftData.janPanchayat) {
                getAddressData({
                  type: "janPanchayat",
                  params: { districtId: draftData.district._id },
                }).then(() => {
                  setJanPanchayat(draftData.janPanchayat);
                });
              }
            });
          }
        });
      } else {
        getAddressData({ type: "state" });
      }
    }
  }, []);

  return (
    <Dialog
      open={open}
      maxWidth="md"
      // {...(openSignatureBoard && { fullScreen: "md" })}
    >
      <DialogContent>
        <ImageCropDialog
          open={isCropDialogOpened}
          onClose={() => {
            setIsCropDialogOpened(false);
          }}
          image={selectedImage}
          onCropComplete={handleImageUpdate}
          selectedImageIndex={selectedImageIndex}
          mode="Edit"
        />
        {/* <SignWhiteBoard /> */}
        {openSignatureBoard ? (
          <SignWhiteBoard
            closeBoard={setOpenSignatureBoard}
            handleSignatureSubmit={(dataUrl) => {
              setSignatureDataUrl(dataUrl);
              setUpdatedImagesNames((pre) => {
                return {
                  ...pre,
                  signature: true,
                };
              });
            }}
          />
        ) : (
          <Box sx={{ maxWidth: 500 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mx: 2 }}
            >
              <DialogTitle>Edit Profile</DialogTitle>
              <Button
                disabled={!storageUtil.getStorageData("TL-draft-data")}
                onClick={() => {
                  setDraftDataCleared(true);
                  storageUtil.removeItem("TL-draft-data");
                }}
                endIcon={<CancelPresentationIcon />}
              >
                Delete Draft
              </Button>
            </Box>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "16px",
                justifyContent: "center",
              }}
            >
              <Avatar
                src={imagesToUpload["Profile"]}
                alt="Profile Pic"
                // tabIndex={-1}
                sx={{
                  width: 100,
                  height: 100,
                  marginRight: "16px",
                  borderRadius: 2,
                }}
                onClick={(e) => {
                  if (imagesToUpload["Profile"]) {
                    setSelectedImage(imagesToUpload["Profile"]);
                    setIsCropDialogOpened(true);
                    setSelectedImageIndex("Profile");
                  }
                }}
              />
              <IconButton>
                <UploadFileIcon
                  onClick={() => {
                    setSelectedImageIndex("Profile");
                    fileInputRef.current.click();
                  }}
                />
              </IconButton>
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }} // Hide the input
                ref={fileInputRef} // Reference to programmatically trigger it
                onChange={handleFileChange} // Handle the file change event
              />
            </div>
            <TextField
              label="Trading Name"
              // error={formErrors["name"]}
              // helperText={formErrors["name"]}
              fullWidth
              margin="normal"
              variant="standard"
              defaultValue={data?.name}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              label="Mobile no"
              // error={formErrors["phone"]}
              // helperText={formErrors["phone"]}
              fullWidth
              margin="normal"
              variant="standard"
              defaultValue={data?.phone}
              value={phone}
              type="number"
              onChange={(e) => {
                if (e.target.value.length <= 10) setPhone(e.target.value);
              }}
            />
            <TextField
              label="Alternate No"
              fullWidth
              margin="normal"
              variant="standard"
              type="number"
              defaultValue={data?.alternatePhone}
              value={alternatePhone}
              onChange={(e) => {
                if (e.target.value.length <= 10)
                  setAlternatePhone(e.target.value);
              }}
            />
            <TextField
              label="Email id"
              // error={formErrors["email"]}
              // helperText={formErrors["email"]}
              fullWidth
              margin="normal"
              variant="standard"
              type="email"
              defaultValue={data?.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Full Address"
              // error={formErrors["address"]}
              // helperText={formErrors["address"]}
              fullWidth
              margin="normal"
              variant="standard"
              defaultValue={data?.address}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            {!isEmpty(stateOptions) && (
              <FormControl fullWidth margin="normal" variant="standard">
                <InputLabel>State</InputLabel>
                <Select value={state} label="State">
                  {stateOptions.map((_state) => (
                    <MenuItem
                      key={_state._id}
                      value={_state}
                      onClick={(e) => {
                        console.log("_state", _state);

                        setState(_state);
                        getAddressData({
                          type: "district",
                          params: {
                            stateId: _state._id,
                          },
                        });
                      }}
                    >
                      {_state.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {!isEmpty(districtOption) && (
              <Autocomplete
                getOptionLabel={(option) => option.name}
                options={districtOption}
                value={district}
                onChange={(e, data) => {
                  setDistrict(data);
                  if (data) {
                    getAddressData({
                      type: "janPanchayat",
                      params: { districtId: data._id },
                    });
                  }
                }}
                sx={{ my: 1 }}
                renderInput={(params) => (
                  <TextField variant="standard" {...params} label="District" />
                )}
              />
            )}

            {!isEmpty(janPanchayatOptions) && (
              <Autocomplete
                getOptionLabel={(option) => option.name}
                onChange={(e, data) => {
                  setJanPanchayat(data);
                }}
                value={janPanchayat}
                options={janPanchayatOptions}
                renderInput={(params) => (
                  <TextField
                    variant="standard"
                    {...params}
                    label="Jan Panchayat"
                  />
                )}
                sx={{ mt: 2 }}
              />
            )}

            <TextField
              label="Password"
              fullWidth
              margin="normal"
              variant="standard"
              type="text"
              defaultValue={data?.password}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {!isEmpty(teamLeaderOption) && teamLeaderDetails?.tl_id && (
              <FormControl fullWidth margin="normal" variant="standard">
                <InputLabel>Team Leader</InputLabel>
                <Select
                  value={teamLeader}
                  defaultValue={teamLeaderDetails?.tl_id}
                  onChange={(e) => setTeamLeader(e.target.value)}
                  label="Team Leader"
                >
                  {teamLeaderOption.map((leader) => (
                    <MenuItem key={leader.name} value={leader.tl_id}>
                      {leader.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            {data?.emergency_contact && (
              <TextField
                label="Emergency Number"
                fullWidth
                margin="normal"
                variant="standard"
                type="tel"
                defaultValue={data?.emergency_contact}
                value={emergencyNumber}
                onChange={(e) => setEmergencyNumber(e.target.value)}
              />
            )}
            {signatureDataUrl ? (
              <Box
                sx={{ display: "flex", alignItems: "center", my: 1 }}
                columnGap={2}
              >
                <Typography variant="h6" gutterBottom>
                  Signature :
                </Typography>
                <img style={{ height: "14vh" }} src={signatureDataUrl} />
                <IconButton
                  onClick={() => {
                    setSignatureDataUrl("");
                  }}
                >
                  <ClearIcon />
                </IconButton>
              </Box>
            ) : (
              <Button
                color="secondary"
                sx={{ my: 2 }}
                endIcon={<AddIcon />}
                onClick={() => setOpenSignatureBoard(true)}
              >
                Add signature
              </Button>
            )}
            <Grid container>
              {/* Aadhaar Front side Image Upload*/}
              <Grid item>
                <Typography fontSize={9}>Aadhaar Front</Typography>
                <UploadImage
                  src={imagesToUpload["aFront"]}
                  handleAvatarClick={() => {
                    if (imagesToUpload["aFront"]) {
                      setSelectedImage(imagesToUpload["aFront"]);
                      setIsCropDialogOpened(true);
                      setSelectedImageIndex("aFront");
                    }
                  }}
                  handleUploadClick={() => {
                    setSelectedImageIndex("aFront");
                    fileInputRef.current.click();
                  }}
                />
              </Grid>
              {/* <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "16px",
                  justifyContent: "center",
                }}
              >
                <Avatar
                  src={aadhaarBack}
                  alt="Profile Pic"
                  sx={{
                    width: 100,
                    height: 100,
                    marginRight: "16px",
                    borderRadius: 2,
                  }}
                  onClick={() => {
                    setSelectedImage(aadhaarBack);
                    setIsCropDialogOpened(true);
                    setSelectedImageIndex("aBack");
                  }}
                />
                <IconButton>
                  <UploadFileIcon
                    onClick={() => {
                      setSelectedImageIndex("aBack");
                      fileInputRef.current.click();
                    }}
                  />
                </IconButton>
              </div> */}
              {/* Aadhaar Back Side Image */}
              <Grid item>
                <Typography fontSize={9}>Aadhaar Back</Typography>
                <UploadImage
                  src={imagesToUpload["aBack"]}
                  handleAvatarClick={() => {
                    if (imagesToUpload["aBack"]) {
                      setSelectedImage(imagesToUpload["aBack"]);
                      setIsCropDialogOpened(true);
                      setSelectedImageIndex("aBack");
                    }
                  }}
                  handleUploadClick={() => {
                    setSelectedImageIndex("aBack");
                    fileInputRef.current.click();
                  }}
                />
              </Grid>
              {/* Passport Image */}
              <Grid item>
                <Typography fontSize={9}>Passport</Typography>
                <UploadImage
                  src={imagesToUpload["Passport"]}
                  handleAvatarClick={() => {
                    if (imagesToUpload["Passport"]) {
                      setSelectedImage(imagesToUpload["Passport"]);
                      setIsCropDialogOpened(true);
                      setSelectedImageIndex("Passport");
                    }
                  }}
                  handleUploadClick={() => {
                    setSelectedImageIndex("Passport");
                    fileInputRef.current.click();
                  }}
                />
              </Grid>
              {/* registration form Image */}
              <Grid item>
                <Typography fontSize={9}>Registration Form</Typography>
                <UploadImage
                  src={imagesToUpload["RegistrationForm"]}
                  handleAvatarClick={() => {
                    if (imagesToUpload["RegistrationForm"]) {
                      setSelectedImage(aadhaarBack);
                      setIsCropDialogOpened(true);
                      setSelectedImageIndex("RegistrationForm");
                    }
                  }}
                  handleUploadClick={() => {
                    setSelectedImageIndex("RegistrationForm");
                    fileInputRef.current.click();
                  }}
                />
              </Grid>
              {/* Agreement pics Image */}
              <Grid item>
                <Typography fontSize={9}>Agreement</Typography>
                <UploadImage
                  src={imagesToUpload["Agreement"]}
                  handleAvatarClick={() => {
                    if (imagesToUpload["Agreement"]) {
                      setSelectedImage(imagesToUpload["Agreement"]);
                      setIsCropDialogOpened(true);
                      setSelectedImageIndex("Agreement");
                    }
                  }}
                  handleUploadClick={() => {
                    setSelectedImageIndex("Agreement");
                    fileInputRef.current.click();
                  }}
                />
              </Grid>
              {/* id proofs -Pan card Image */}
              <Grid item>
                <Typography fontSize={9}>Pan card</Typography>
                <UploadImage
                  src={imagesToUpload["PanCard"]}
                  handleAvatarClick={() => {
                    if (imagesToUpload["PanCard"]) {
                      setSelectedImage(imagesToUpload["PanCard"]);
                      setIsCropDialogOpened(true);
                      setSelectedImageIndex("PanCard");
                    }
                  }}
                  handleUploadClick={() => {
                    setSelectedImageIndex("PanCard");
                    fileInputRef.current.click();
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
      {!openSignatureBoard && (
        <DialogActions
        // sx={{ position: "sticky", bottom: "8px", right: "8px" }}
        >
          <Button
            onClick={(...rest) => {
              draftFormData();
              if (setUserData) {
                setUserData(backupData);
              }
              onClose(rest);
            }}
            color="primary"
          >
            Cancel
          </Button>
          <Button onClick={handleSaveFormData} color="secondary">
            Save
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default EditProfileDialog;
