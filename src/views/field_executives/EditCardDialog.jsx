import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  Box,
} from "@mui/material";
import ImageCropDialog from "./ImageCropDialog";
import common from "../../services/common";
import field_executives from "../../services/field_executives";
import { isEmpty } from "lodash";
import { styled } from "@mui/material/styles";
import UploadFileIcon from "@mui/icons-material/UploadFile";

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

const EditProfileDialog = ({ open, onClose, data, teamLeaderDetails }) => {
  const [profilePic, setProfilePic] = useState(null);
  const [frontID, setFrontID] = useState(null);
  const [backID, setBackID] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [emergencyNumber, setEmergencyNumber] = useState("");
  const [teamLeader, setTeamLeader] = useState("");

  const [stateOptions, setStateOption] = useState([]);

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
        if (selectedImageIndex === "Profile") {
          setProfilePic(reader.result);
        } else if (selectedImageIndex === "aFront") {
          setAadhaarFront(reader.result);
        } else {
          setSadhaarBack(reader.result);
        }
      });
      reader.readAsDataURL(file);
    }
  };

  function getAddressData(payload) {
    common.getAddressData(payload).then((data) => {
      if (payload?.type == "district" && !data?.error) {
        setDistrictOption(data);
      } else {
        if (!data?.error) {
          setStateOption(data);
        }
      }
    });
  }

  useEffect(() => {
    getAddressData({ type: "state" });
    field_executives
      .getUsers({
        params: {
          role: "TL",
          onlyInfo: true,
        },
      })
      .then((data) => {
        console.log("setTeamLeaderOption", data);

        setTeamLeaderOption(data.data);
      });
    setProfilePic(data?.image);
    getAddressData({ type: "district" });

    if (data?.id_proof?.front) {
      setAadhaarFront(data.id_proof.front);
    }
    if (data?.id_proof?.back) {
      setSadhaarBack(data.id_proof.back);
    }
    if (data) {
      setName(data.name);
      setPhone(data.phone);
      setEmail(data.email);
      setPassword(data.password);
      setAddress(data.address);
      setState(data.state);
      setDistrict(data.district);
      setEmergencyNumber(data.emergency_contact);
    }
    if (teamLeaderDetails) {
      setTeamLeader(teamLeaderDetails.name);
    }
  }, [data]);

  function handleSaveFormData() {
    field_executives
      .saveFieldExecutiveForm({
        id: data._id,
        name: name || data?.name,
        phone: phone || data?.phone,
        email: email || data?.email,
        password: password || data.password,
        address: address || data.address,
        state: state || data.state,
        district: district || data.district,
        team_leader_id: teamLeader || data.team_leader_id,
        emergency_contact: emergencyNumber || data.emergency_contact,
        id_proof: data.id_proof,
        image: data.image,
        images: {
          ...(updatedImagesNames?.aadhaarBack && {
            aadhaarBack: aadhaarBack,
          }),
          ...(updatedImagesNames?.aadhaarFront && {
            aadhaarFront: aadhaarFront,
          }),
          ...(updatedImagesNames?.profilePic && {
            profilePic: profilePic,
          }),
        },
      })
      .then(() => {
        onClose(true);
      });
  }

  function handleImageUpdate({ croppedImage, selectedImageIndex }) {
    if (selectedImageIndex === "Profile") {
      setProfilePic(croppedImage);
      setUpdatedImagesNames((pre) => {
        return {
          ...pre,
          profilePic: true,
        };
      });
    } else if (selectedImageIndex === "aFront") {
      setAadhaarFront(croppedImage);
      setUpdatedImagesNames((pre) => {
        return {
          ...pre,
          aadhaarFront: true,
        };
      });
    } else if (selectedImageIndex === "aBack") {
      setSadhaarBack(croppedImage);
      setUpdatedImagesNames((pre) => {
        return {
          ...pre,
          aadhaarBack: true,
        };
      });
    }
    setIsCropDialogOpened(false);
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md">
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
      <Box sx={{ maxWidth: 500 }}>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "16px",
              justifyContent: "center",
            }}
          >
            <Avatar
              src={profilePic}
              alt="Profile Pic"
              // tabIndex={-1}
              sx={{
                width: 100,
                height: 100,
                marginRight: "16px",
                borderRadius: 2,
              }}
              onClick={(e) => {
                if (profilePic) {
                  setSelectedImage(profilePic);
                  setIsCropDialogOpened(true);
                  setSelectedImageIndex("Profile");
                }
              }}
            />
            <IconButton>
              <UploadFileIcon onClick={() => fileInputRef.current.click()} />
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
            label="Name"
            fullWidth
            margin="normal"
            variant="standard"
            defaultValue={data?.name}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Phone"
            fullWidth
            margin="normal"
            variant="standard"
            defaultValue={data?.phone}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            variant="standard"
            type="email"
            defaultValue={data?.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
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
          <TextField
            label="Address"
            fullWidth
            margin="normal"
            variant="standard"
            defaultValue={data?.address}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          {data?.state && (
            <FormControl fullWidth margin="normal" variant="standard">
              <InputLabel>State</InputLabel>
              <Select defaultValue={data.state} value={state} label="State">
                {stateOptions.map((state) => (
                  <MenuItem
                    key={state.name}
                    value={state.name}
                    onClick={(e) => {
                      setState(e.target.value);
                      getAddressData({ type: "district", stateId: state._id });
                    }}
                  >
                    {state.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {data?.district && districtOption && (
            <FormControl fullWidth margin="normal" variant="standard">
              <InputLabel>District</InputLabel>
              <Select
                defaultValue={data.district}
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                label="District"
              >
                {districtOption.map((district) => (
                  <MenuItem key={district.name} value={district.name}>
                    {district.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {!isEmpty(teamLeaderOption) && (
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
          <Box display="flex">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "16px",
                justifyContent: "center",
              }}
            >
              <Avatar
                src={aadhaarFront}
                alt="Profile Pic"
                sx={{
                  width: 100,
                  height: 100,
                  marginRight: "16px",
                  borderRadius: 2,
                }}
                onClick={() => {
                  setSelectedImage(aadhaarFront);
                  setIsCropDialogOpened(true);
                  setSelectedImageIndex("aFront");
                }}
              />
              <IconButton sx={{ mr: 1 }}>
                <UploadFileIcon
                  onClick={() => {
                    setSelectedImageIndex("aFront");
                    fileInputRef.current.click();
                  }}
                />
              </IconButton>
            </div>
            <div
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
            </div>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSaveFormData} color="primary">
            Save
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default EditProfileDialog;
