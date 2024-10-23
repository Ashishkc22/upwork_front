import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  IconButton,
  Link,
  Grid,
  Typography,
  Switch,
  CardMedia,
  Button,
  Input,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import PersonIcon from "@mui/icons-material/Person";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import fieldExecutives from "../../services/field_executives";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import moment from "moment";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { isEmpty } from "lodash";
import CroppingDialog from "./ImageCropDialog"; // Adjust path as necessary
import EditCardDialog from "./EditCardDialog";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import EmailIcon from "@mui/icons-material/Email";
import ImageDialog from "./ImageList.";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const UserInfoCard = () => {
  const navigate = useNavigate();
  let { id } = useParams();
  const [userData, setUserData] = useState({
    // Initial state as before
  });
  let [urlDateType, setUrlDateType] = useSearchParams();

  const [teamLeaderDetails, setTeamLeaderDetails] = useState({});
  const [imageListDialog, setImageListDialog] = useState(false);
  const [isEditDialogOpened, setIsEditDialogOpened] = useState(false);
  const [role, setRole] = useState();
  const [suspensionReason, setSuspensionReason] = useState("");
  const [isSuspensionDialogOpened, setIsSuspensionDialogOpened] =
    useState(false);

  const statupMap = {
    Verified: "suspend",
    "Verification Pending": "Verify",
  };

  const fetchCardData = () => {
    const isTL = urlDateType.get("isTL");
    console.log("isTL", cancelIdleCallback);
    if (Boolean(isTL)) {
      fieldExecutives
        .getTLById({ tl_id: id, showExtra: true })
        .then((tlDetails) => {
          setTeamLeaderDetails(tlDetails);
          setUserData(tlDetails);
          setRole(tlDetails.role);
        });
    } else {
      fieldExecutives.getUserById({ uid: id }).then((data) => {
        setUserData(data);
        setRole(data.role);
        console.log("data", data);
        fieldExecutives
          .getTeamLeaderDetailsById({
            tlId: data?.team_leader_id,
          })
          .then((data) => {
            console.log("_____data", data);

            setTeamLeaderDetails(data);
          });
      });
    }
  };

  useEffect(() => {
    // Fetch the data from the API
    fetchCardData();
  }, [id]);

  const TextGroup = ({ title, value, subText }) => (
    <Box mb={1}>
      <Typography fontSize="10px" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h6" fontSize="12px" fontWeight={600} gutterBottom>
        {value}
      </Typography>
      <Typography
        fontSize="12px"
        fontWeight={600}
        sx={{ color: "#0000007d" }}
        gutterBottom
      >
        {subText}
      </Typography>
    </Box>
  );

  const updateUserRole = ({ role }) => {
    const formData = new FormData();
    formData.append("role", role);
    setRole(role);
    fieldExecutives.updateUserRole({ formData: { role }, id: userData._id });
  };

  const handleUserSuspension = async () => {
    const _formData = {
      status: userData.status === "Verified" ? "Suspended" : "Verified",
      ...(suspensionReason && { suspension_reason: suspensionReason }),
    };
    if (userData.status === "Verification Pending") {
      _formData.status = "Verified";
    }
    await fieldExecutives.changeUserStatus(_formData, userData._id);
    fetchCardData();
    setIsSuspensionDialogOpened(false);
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{ width: "100%", p: 2 }}
    >
      <Box
        onClick={() => navigate(-1)}
        sx={{
          position: "absolute",
          height: `100vh`,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1, // Lower than the content
        }}
      />

      {/* Your content */}
      <Box
        sx={{
          position: "relative",
          zIndex: 2, // Higher z-index so this is clickable
        }}
      >
        <Dialog
          open={isSuspensionDialogOpened}
          onClose={() => setIsSuspensionDialogOpened(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <Box alignItems="center" sx={{ m: 2 }}>
            <TextField
              id="standard-basic"
              label="Discard Reason"
              variant="standard"
              value={suspensionReason}
              placeholder="Discard Reason"
              onChange={(e) => setSuspensionReason(e.target.value)}
              sx={{ mt: 1, width: "250px" }}
            />
          </Box>
          <Box display="flex" justifyContent="end">
            <Button onClick={() => setIsSuspensionDialogOpened(false)}>
              cancel
            </Button>
            <Button onClick={handleUserSuspension}>
              {userData.status === "Verified" ? "suspend" : "unsuspend"}
            </Button>
          </Box>
        </Dialog>
        {isEditDialogOpened && (
          <EditCardDialog
            open={isEditDialogOpened}
            data={userData}
            setUserData={setUserData}
            teamLeaderDetails={teamLeaderDetails}
            onClose={(callApi) => {
              if (callApi) {
                fetchCardData();
              }
              setIsEditDialogOpened(false);
            }}
          />
        )}
        {(userData?.id_proof?.front ||
          userData?.id_proof?.back ||
          userData?.image) &&
          imageListDialog && (
            <ImageDialog
              open={imageListDialog}
              onClose={() => setImageListDialog(false)}
              initialIndex={imageListDialog - 1}
              images={[
                userData.image,
                userData.id_proof.front,
                userData.id_proof.back,
              ]}
            />
          )}

        <Card sx={{ maxWidth: 1000, width: "100%" }}>
          <Box
            sx={{
              display: "flex",
              position: "relative",
              flexDirection: "row-reverse",
              mt: 1,
            }}
          >
            <Button
              sx={{
                color: "#ff5722",
                p: 1,
                m: 0,
                mr: 3,
              }}
              variant="standard"
              startIcon={<EditIcon />}
              onClick={() => {
                setIsEditDialogOpened(true);
              }}
            >
              Edit
            </Button>
          </Box>
          <CardContent>
            <Grid container>
              {/* COL 1 */}
              <Grid item xs={6}>
                {/* Profile image */}
                <Grid container rowGap={3}>
                  <Grid item xs={12}>
                    <Box display="flex">
                      <IconButton
                        onClick={() => navigate(-1)}
                        aria-label="back"
                        sx={{ mr: 2 }}
                      >
                        <ArrowBackIcon sx={{ fontSize: 30 }} />
                      </IconButton>
                      <TextGroup title="UID:" value={userData.uid} />
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Grid container>
                      <Grid item xs={7}>
                        <Card sx={{ width: "110px", height: "120px" }}>
                          {userData.image ? (
                            <CardMedia
                              component="img"
                              sx={{ width: "110px" }}
                              image={userData.image}
                              alt={`Profile Image`}
                              onClick={() => {
                                setImageListDialog(1);
                              }}
                            />
                          ) : (
                            <PersonIcon sx={{ fontSize: "100px" }} />
                          )}
                        </Card>
                      </Grid>
                      <Grid item xs={5}>
                        <TextGroup title="Name" value={userData.name} />
                        <TextGroup title="Status" value={userData.status} />
                        <ToggleButtonGroup
                          color="primary"
                          exclusive
                          value={role}
                          onChange={(e) => {
                            if (e.target.value != "ADMIN") {
                              updateUserRole({ role: e.target.value });
                            }
                          }}
                          aria-label="Platform"
                        >
                          {role === "ADMIN" && (
                            <ToggleButton disabled value="ADMIN">
                              Admin
                            </ToggleButton>
                          )}
                          <ToggleButton value="FE">FE</ToggleButton>
                          <ToggleButton value="TL">TL</ToggleButton>
                          <ToggleButton value="SUBADMIN">SUBADMIN</ToggleButton>
                        </ToggleButtonGroup>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Box display="flex" alignItems="center">
                    <EmailIcon sx={{ mr: 2 }} />
                    <Link
                      onClick={() => window.open(`mailto:${userData.email}`)}
                      underline="none"
                    >
                      <TextGroup title="Email" value={userData.email} />
                    </Link>
                  </Box>
                </Grid>

                {/* Phone */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Box
                    display="flex"
                    alignItems="center"
                    sx={{ width: "30px !important" }}
                  >
                    <LocalPhoneIcon sx={{ mr: 2 }} />

                    <Box mb={1}>
                      <Typography fontSize="10px" color="text.secondary">
                        Phone
                      </Typography>
                      <Link underline="none" sx={{ width: "fit" }}>
                        <Typography
                          variant="h6"
                          fontSize="12px"
                          fontWeight={600}
                          gutterBottom
                          onClick={() =>
                            window.open(`https://wa.me/${userData.phone}`)
                          }
                        >
                          {userData.phone}
                        </Typography>
                      </Link>
                    </Box>
                    {/* <TextGroup title="Phone" value={userData.phone} /> */}
                  </Box>
                  <Box
                    sx={{
                      ml: { lg: "35px", md: "35px" },
                      width: "90px !important",
                    }}
                  >
                    <Box mb={1}>
                      <Typography fontSize="10px" color="text.secondary">
                        Emergency Contact
                      </Typography>
                      <Link underline="none" sx={{ width: "80px" }}>
                        <Typography
                          variant="h6"
                          fontSize="12px"
                          fontWeight={600}
                          gutterBottom
                          onClick={() =>
                            window.open(
                              `https://wa.me/${userData.emergency_contact}`
                            )
                          }
                        >
                          {userData.emergency_contact}
                        </Typography>
                      </Link>
                    </Box>
                    {/* <Link
                    onClick={() =>
                      window.open(`tel:${userData.emergency_contact}`)
                    }
                    underline="none"
                  >
                    <TextGroup
                      title="Emergency Contact"
                      value={userData.emergency_contact}
                    />
                  </Link> */}
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box display="flex" alignItems="center">
                    <LocationOnIcon sx={{ mr: 2 }} />
                    <TextGroup title="Address" value={userData.address} />
                  </Box>
                  <Box sx={{ ml: { lg: "35px", md: "35px" } }}>
                    <TextGroup title="District" value={userData.district} />
                  </Box>
                  <Box sx={{ ml: { lg: "35px", md: "35px" } }}>
                    <TextGroup title="State" value={userData.state} />
                  </Box>
                </Grid>
              </Grid>

              {/* COL 2 */}
              <Grid item xs={6}>
                <Grid container>
                  {teamLeaderDetails?.name && (
                    <Grid item xs={12}>
                      <Box
                        mb={1}
                        onClick={() =>
                          navigate(
                            `/field-executives/${teamLeaderDetails.tl_id}?isTL=true`
                          )
                        }
                      >
                        <Typography fontSize="10px" color="text.secondary">
                          Team Leader ID
                        </Typography>
                        <Typography
                          variant="h6"
                          fontSize="12px"
                          fontWeight={600}
                          gutterBottom
                        >
                          {teamLeaderDetails.tl_id}
                        </Typography>
                        <Typography
                          fontSize="12px"
                          fontWeight={600}
                          sx={{ color: "#0000007d" }}
                          gutterBottom
                        >
                          {teamLeaderDetails.name}
                        </Typography>
                      </Box>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Box mb={1}>
                      <Typography fontSize="10px" color="text.secondary">
                        Created At
                      </Typography>
                      <Typography
                        variant="h6"
                        fontSize="12px"
                        fontWeight={600}
                        gutterBottom
                      >
                        {moment(userData.created_at).format("DD-MM-YYYY HH:MM")}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box mb={1} sx={{ width: "80px" }}>
                      <Typography fontSize="10px" color="text.secondary">
                        Co-ordinates
                      </Typography>
                      <Link
                        onClick={() => {
                          window.open(
                            `https://www.google.com/maps?q=${
                              userData?.lat || 0
                            },${userData?.lon || 0}`
                          );
                        }}
                      >
                        <Typography
                          variant="h6"
                          fontSize="12px"
                          fontWeight={600}
                          gutterBottom
                        >
                          {`${userData?.lat || 0},${userData?.lon || 0}`}
                        </Typography>
                      </Link>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <TextGroup title="ID Card: (Aadhaar)" />
                    <Box display="flex" columnGap={1}>
                      <Box display="flex">
                        <Card
                          sx={{
                            width: "140px",
                            borderRadius: 3,
                          }}
                        >
                          {userData?.id_proof?.front ? (
                            <CardMedia
                              component="img"
                              sx={{ width: "140px", borderRadius: 3 }}
                              image={userData?.id_proof?.front}
                              alt={`Profile Image`}
                              onClick={() => {
                                setImageListDialog(2);
                              }}
                            />
                          ) : (
                            <PersonIcon sx={{ fontSize: "100px" }} />
                          )}
                        </Card>
                      </Box>
                      <Box>
                        <Card sx={{ width: "140px", borderRadius: 3 }}>
                          {userData?.id_proof?.back ? (
                            <CardMedia
                              component="img"
                              sx={{ width: "140px", borderRadius: 3 }}
                              image={userData?.id_proof?.back}
                              alt={`Profile Image`}
                              onClick={() => {
                                setImageListDialog(3);
                              }}
                            />
                          ) : (
                            <PersonIcon sx={{ fontSize: "100px" }} />
                          )}
                        </Card>
                      </Box>
                      {/* {userData?.id_proof?.front && (
                        <img
                          src={userData?.id_proof?.front}
                          alt=""
                          style={{ width: "100px", mx: 1 }}
                          onClick={() => {
                            setImageListDialog(true);
                          }}
                        />
                      )}

                      {userData?.id_proof?.back && (
                        <img
                          src={userData?.id_proof?.back}
                          alt=""
                          style={{
                            width: "100px",
                            marginLeft: 3,
                          }}
                          onClick={() => {
                            setImageListDialog(true);
                          }}
                        />
                      )} */}
                    </Box>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    container
                    columnGap={2}
                    rowGap={1}
                    sx={{ my: 1 }}
                  >
                    <Grid item xs={12}>
                      <TextGroup title="Other documents" />
                    </Grid>
                    <Grid item>
                      <Box>
                        <Card
                          sx={{
                            width: "140px",
                            borderRadius: 3,
                          }}
                        >
                          {userData?.passportImage ? (
                            <CardMedia
                              component="img"
                              sx={{ width: "140px", borderRadius: 3 }}
                              image={userData?.passportImage}
                              alt={`Profile Image`}
                              onClick={() => {
                                setImageListDialog(2);
                              }}
                            />
                          ) : (
                            <PersonIcon sx={{ fontSize: "100px" }} />
                          )}
                        </Card>
                      </Box>
                    </Grid>
                    <Grid item>
                      <Box>
                        <Card sx={{ width: "140px", borderRadius: 3 }}>
                          {userData?.registrationFormImage ? (
                            <CardMedia
                              component="img"
                              sx={{ width: "140px", borderRadius: 3 }}
                              image={userData?.registrationFormImage}
                              alt={`Profile Image`}
                              onClick={() => {
                                setImageListDialog(3);
                              }}
                            />
                          ) : (
                            <PersonIcon sx={{ fontSize: "100px" }} />
                          )}
                        </Card>
                      </Box>
                    </Grid>
                    <Grid item>
                      <Box>
                        <Card sx={{ width: "140px", borderRadius: 3 }}>
                          {userData?.agreementImage ? (
                            <CardMedia
                              component="img"
                              sx={{ width: "140px", borderRadius: 3 }}
                              image={userData?.agreementImage}
                              alt={`Profile Image`}
                              onClick={() => {
                                setImageListDialog(3);
                              }}
                            />
                          ) : (
                            <PersonIcon sx={{ fontSize: "100px" }} />
                          )}
                        </Card>
                      </Box>
                    </Grid>
                    <Grid item>
                      <Box>
                        <Card sx={{ width: "140px", borderRadius: 3 }}>
                          {userData?.panCardImage ? (
                            <CardMedia
                              component="img"
                              sx={{ width: "140px", borderRadius: 3 }}
                              image={userData?.panCardImage}
                              alt={`Pancard Image`}
                              onClick={() => {
                                setImageListDialog(3);
                              }}
                            />
                          ) : (
                            <PersonIcon sx={{ fontSize: "100px" }} />
                          )}
                        </Card>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item container xs={12} display="flex" justifyContent="end">
                <Button
                  onClick={() => {
                    window.open(
                      `https://wa.me/+91${userData.phone}?text=Hi ${userData.name}, your password is ${userData.password}`
                    );
                  }}
                >
                  send password
                </Button>
                <Button
                  onClick={
                    // () => handleUserSuspension()
                    () => {
                      if (userData?.status != "Suspended") {
                        setIsSuspensionDialogOpened(true);
                      } else {
                        handleUserSuspension();
                      }
                    }
                  }
                >
                  {statupMap[userData?.status]
                    ? statupMap[userData?.status]
                    : "unsuspend"}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default UserInfoCard;
