import React, { useEffect, useState, useRef } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Box,
  IconButton,
  TextField,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArogyamComponent from "../../components/ArogyaCard";
import ArogyamComponentV1 from "../../components/ArogyaCard_v1";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MenuItem from "@mui/material/MenuItem";
import CardActions from "@mui/material/CardActions";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import RepeatOneIcon from "@mui/icons-material/RepeatOne";
import CancelIcon from "@mui/icons-material/Cancel";
import CardHeader from "@mui/material/CardHeader";
import EditIcon from "@mui/icons-material/Edit";
import { useParams } from "react-router-dom";
import cards from "../../services/cards";
import moment from "moment";
import { useNavigate, useLocation } from "react-router-dom";
import downloadCards from "../../utils/downloadCards";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import cardService from "../../services/cards";
import { isEmpty } from "lodash";
import RestoreIcon from "@mui/icons-material/Restore";
import PlaceIcon from "@mui/icons-material/Place";
import Link from "@mui/material/Link";
import storageUtil from "../../utils/storage.util";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import EditCardDialog from "./EditCardDialog";
import TimeLineDialog from "./TimeLineDialog";
import DeleteIcon from "@mui/icons-material/Delete";
import fieldExecutives from "../../services/field_executives";

const images = {
  LogoImage: <img src="/v1cardImages/cardLogo.png" alt="Card Logo" />,
  Phone: (
    <img
      src="/v1cardImages/phone.png"
      alt="Phone"
      style={{ width: "10px", height: "10px", marginRight: "9px" }}
    />
  ),
  Loc: (
    <img
      src="/v1cardImages/loc.png"
      alt="Location"
      style={{ width: "10px", height: "10px", marginRight: "9px" }}
    />
  ),
  WaterMark: (
    <img
      src="/v1cardImages/waterMark.png"
      alt="Watermark"
      style={{
        width: "118px",
        right: "29px",
        position: "relative",
        bottom: "47px",
        "z-index": 0,
      }}
    />
  ),
  Support: (
    <img
      src="/v1cardImages/support.png"
      alt="support"
      style={{ width: "54px", height: "54px" }}
    />
  ),
};

const idList = storageUtil.getStorageData("cards_ids");

const CardComponent = () => {
  const [isMenuOpened, setIsMenuOpened] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [isTimeLineOpened, setIsTimeLineOpened] = useState(false);
  const [isTimeLineData, setIsTimeLineData] = useState([]);
  const [cardData, setCardData] = useState({});
  const [renewCalculation, setRenewCalculation] = useState("");
  const [shouldFocus, setShouldFocus] = useState(false); // State to control the focus condition
  const textFieldRef = useRef(null);
  // const handleClick = (event) => {
  //   setAnchorEl(event.currentTarget);
  //   setIsMenuOpened(true);
  // };
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState(""); //renew and discard
  const [selectReason, setSelectReason] = useState("");
  const [discardMessageReason, setDiscardMessageReason] = useState("");
  const [isEditDialogOpened, setIsEditDialogOpened] = useState(false);
  const [TLDetails, setTLDetails] = useState({});

  const location = useLocation();

  const navigate = useNavigate();

  let { id } = useParams();
  let newId = id;

  const updateQueryParam = (_newId) => {
    if (_newId) {
      const newUrl = `/${location.pathname.split("/")[1]}/${_newId}`;
      navigate(newUrl, { replace: true });
    }
  };

  useEffect(() => {
    if (shouldFocus && textFieldRef.current) {
      // Access the input element within the TextField and call focus
      textFieldRef.current.querySelector("input").focus();
    }
  }, [shouldFocus]);

  const fetchCardData = ({ paramId = false } = {}) => {
    cards.getCardById({ id: paramId || id }).then((data) => {
      setCardData(data);
      if (data?.status_history?.length) {
        setIsTimeLineData(data.status_history.reverse());
      }
      fetchUserById({ uid: data.created_by_uid }).then((data) => {
        setTLDetails(data);
      });
    });
  };

  const fetchUserById = ({ uid }) => {
    console.log("uid", uid);

    return fieldExecutives.getUserById({ uid });
  };

  const handleKeyPress = ({ key }) => {
    if (key === "ArrowLeft" || key === "ArrowRight") {
      if (idList?.length && newId) {
        let indexOf = idList.indexOf(newId.trim());
        console.log("indexOf", indexOf);

        if (indexOf != 0 && key == "ArrowLeft") {
          indexOf = indexOf - 1;
        } else if (idList?.length != indexOf) {
          indexOf = indexOf + 1;
        }
        updateQueryParam(idList?.[indexOf]);
        newId = idList?.[indexOf];
        fetchCardData({ paramId: idList?.[indexOf] });
      }
    }
  };

  useEffect(() => {
    fetchCardData();
    // let ids = storageUtil.getStorageData("cards_ids");
    // if (!ids.length) {
    //   ids = [];
    // };
    // setIdList(ids);
    window.addEventListener("keydown", handleKeyPress);
  }, []);

  const TextElement = ({ label, value }) => {
    return (
      <>
        <Typography
          component="div"
          sx={{ color: "#00000070", mt: 1, fontSize: "13px" }}
        >
          {label}
        </Typography>
        <Typography variant="h6" component="div" sx={{ fontWeight: 500 }}>
          {value}
        </Typography>
      </>
    );
  };

  // https://asia-south1-arogyam-super.cloudfunctions.net/app/cards/66891b06173e6b8a1bf1ff55?token=7wWnejhnZjhHWyzDF8yHk9
  // FromData {status: DISCARDED
  // discard_reason: Wrong Mobile No.: testing discard feature}
  const handleRenewCard = async () => {
    try {
      const updatedCardData = await cardService.renewCard({
        issueDate: cardData?.issue_date,
        createdAt: cardData?.created_at,
        expiryYears: cardData?.expiry_years,
        id: cardData._id,
      });
      if (!isEmpty(updatedCardData)) {
        setCardData(updatedCardData);
      }
      setRenewCalculation("");
      setIsDialogOpen(false);
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleStatusChange = async ({ payload }) => {
    try {
      const updatedCardData = await cardService.changeStatus(
        payload,
        cardData._id
      );
      if (!isEmpty(updatedCardData)) {
        setCardData(updatedCardData);
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleCardDelete = async () => {
    try {
      const deletedData = await cardService.deleteCard(cardData._id);
      if (!isEmpty(deletedData)) {
        navigate(-1);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleDownloadCard = () => {
    downloadCards.downloadSingleCard({
      Element: <ArogyamComponent cardData={cardData} images={images} />,
      cardData,
    });
  };

  return (
    <Box sx={{ display: "inline-flex", width: "100%" }}>
      {/* Left button */}
      {Boolean(idList?.length || false) && (
        <IconButton
          sx={{
            // position: "absolute",
            borderRadius: 0,
            color: "#ff5722",
          }}
          onClick={() => {
            // Your left button action here
          }}
        >
          <KeyboardArrowLeftIcon />
        </IconButton>
      )}

      <Card
        sx={{
          minWidth: "470px",
          margin: "auto",
          mx: { lg: "auto", sm: 2 },
          mt: "2%",
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Dialog
          open={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {dialogType === "renew" ? "Renew Card" : "Discard Reason?"}
          </DialogTitle>
          <DialogContent>
            {dialogType === "renew" ? (
              <DialogContentText id="alert-dialog-description">
                Renew {cardData.name}'s card, extending expiry till{" "}
                {renewCalculation}
              </DialogContentText>
            ) : (
              <Box alignItems="center">
                <TextField
                  inputRef={textFieldRef}
                  id="standard-basic"
                  label="Discard Reason"
                  variant="standard"
                  placeholder="Discard Reason"
                  onChange={(e) => setDiscardMessageReason(e.target.value)}
                  sx={{ mt: 1, width: "250px" }}
                />
                <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                  <InputLabel id="demo-simple-select-standard-label">
                    Select Reason
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-standard-label"
                    id="demo-simple-select-standard"
                    variant="standard"
                    placeholder="Select Reason"
                    sx={{ width: "150px", mb: 1 }}
                    onChange={(e) => setSelectReason(e.target.value)}
                    label="Select Reason"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    <MenuItem value="Wrong ID">Wrong ID</MenuItem>
                    <MenuItem value="Wrong Mobile No.">
                      Wrong Mobile No.
                    </MenuItem>
                    <MenuItem value="Wrong Name/TOB">Wrong Name/TOB</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (dialogType === "renew") {
                  handleRenewCard();
                } else {
                  handleStatusChange({
                    status: "DISCARDED",
                    payload: {
                      status: "DISCARDED",
                      discard_reason: `${selectReason}: ${discardMessageReason}`,
                    },
                  });
                }
              }}
              autoFocus
            >
              {dialogType === "renew" ? "Renew" : "Save"}
            </Button>
          </DialogActions>
        </Dialog>
        <CardHeader
          sx={{ p: 0, mt: 1 }}
          action={
            <Box>
              <Button
                sx={{
                  display: "inline-flex",
                  color: "#ff5722",
                  p: 1,
                  m: 0,
                  mr: 3,
                }}
                variant="standard"
                startIcon={<DeleteIcon />}
                onClick={() => handleCardDelete()}
              >
                Delete
              </Button>
              <Button
                sx={{
                  display: "inline-flex",
                  color: "#ff5722",
                  p: 1,
                  m: 0,
                  mr: 3,
                }}
                variant="standard"
                startIcon={<EditIcon />}
                onClick={() => setIsEditDialogOpened(true)}
              >
                Edit
              </Button>
            </Box>
          }
        />
        <CardContent sx={{ px: 5 }}>
          <Grid container spacing={0}>
            <Grid item xs={12} md={5}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <IconButton
                  onClick={() => navigate(-1)}
                  aria-label="back"
                  sx={{ mr: 5 }}
                >
                  <ArrowBackIcon sx={{ fontSize: 30 }} />
                </IconButton>
                <Box>
                  <TextElement
                    label="Unique Number"
                    value={cardData.unique_number}
                  />
                </Box>
              </Box>
              <Box>
                <TextElement label="Name" value={cardData.name} />
              </Box>

              <Box>
                <TextElement
                  label="Father/Husband Name"
                  value={cardData.father_husband_name}
                />
              </Box>
              <Box>
                <TextElement label="Gender" value={cardData.gender} />
              </Box>
              <Box>
                <TextElement label="Birth Year" value={cardData.birth_year} />
              </Box>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                <IconButton
                  sx={{
                    mr: 1,
                    borderRadius: 0,
                  }}
                  onClick={() => window.open(`https://wa.me/${cardData.phone}`)}
                >
                  <div>
                    <img src="/whatsapp.png" alt="" srcset="" />
                  </div>
                  <div style={{ marginLeft: "14px", textAlign: "start" }}>
                    <TextElement label="Phone" value={cardData.phone} />
                  </div>
                </IconButton>
              </Box>

              <Box sx={{ display: "flex" }}>
                <IconButton
                  sx={{
                    mr: 1,
                    height: "46px",
                    ":hover": {
                      color: "#0000ff91",
                    },
                  }}
                >
                  <PlaceIcon sx={{ fontSize: "30px" }} />
                </IconButton>
                <div>
                  <TextElement
                    label="Address"
                    value={`${cardData.area} ${cardData.tehsil}  ${cardData.district} ${cardData.state} `}
                  />
                </div>
              </Box>
              <Box>
                <TextElement
                  label="Blood Group"
                  value={cardData.blood_group || ""}
                />
              </Box>
              <Box>
                {/* TLDetails */}
                <Link
                  onClick={() =>
                    navigate(`/field-executives/${cardData.created_by_uid}`)
                  }
                >
                  <TextElement
                    label="Created By"
                    value={
                      cardData?.created_by_uid &&
                      `UID : ${cardData.created_by_uid}`
                    }
                  />
                </Link>
                {!isEmpty(TLDetails) && (
                  <>
                    <TextElement label="TL Name" value={TLDetails?.name} />
                    <IconButton
                      sx={{
                        mr: 1,
                        borderRadius: 0,
                      }}
                      onClick={() =>
                        window.open(`https://wa.me/${TLDetails.phone}`)
                      }
                    >
                      <div>
                        <img
                          src="/whatsapp.png"
                          alt=""
                          srcset=""
                          width="19px"
                        />
                      </div>
                      <div style={{ marginLeft: "14px", textAlign: "start" }}>
                        <TextElement label="Phone" value={TLDetails.phone} />
                      </div>
                    </IconButton>
                  </>
                )}
              </Box>
              <Box display="inline-flex" alignItems="flex-end">
                <Box>
                  <TextElement label="Status" value={cardData.status} />
                  {cardData.discard_reason && (
                    <span label="" style={{ fontSize: 12, color: "#00000075" }}>
                      {cardData.discard_reason}
                    </span>
                  )}
                </Box>
                <Box sx={{ ml: 6 }}>
                  <Button
                    // onClick={handleClick}
                    aria-controls={
                      isMenuOpened ? "demo-positioned-menu" : undefined
                    }
                    onClick={() => setIsTimeLineOpened(true)}
                    aria-haspopup="true"
                    aria-expanded={isMenuOpened ? "true" : undefined}
                    sx={{
                      display: "inline-flex",
                      color: "#ff5722 !important",
                      pb: 0,
                    }}
                    variant="standard"
                    startIcon={<VerifiedUserOutlinedIcon />}
                  >
                    Status timeline
                  </Button>
                  {/* <Menu
                    id="demo-positioned-menu"
                    aria-labelledby="demo-positioned-button"
                    anchorEl={anchorEl}
                    open={isMenuOpened}
                    onClose={() => {
                      setAnchorEl(null);
                      setIsMenuOpened(false);
                    }}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'left',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'left',
                    }}
                  >
                    <MenuItem
                      onClick={() => {
                        setAnchorEl(null);
                        setIsMenuOpened(false);
                      }}
                    >
                      Printed
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setAnchorEl(null);
                        setIsMenuOpened(false);
                      }}
                    >
                      Delivered
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setAnchorEl(null);
                        setIsMenuOpened(false);
                      }}
                    >
                      Undelivered
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setAnchorEl(null);
                        setIsMenuOpened(false);
                      }}
                    >
                      RTO
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setAnchorEl(null);
                        setIsMenuOpened(false);
                      }}
                    >
                      Reprint
                    </MenuItem>
                  </Menu> */}
                </Box>
              </Box>

              {/* <Box>
                <TextElement
                  label="Aadhaar"
                  value={cardData?.id_proof?.value}
                />
              </Box> */}
            </Grid>

            <Grid item xs={12} md={7} sm={12} sx={{ ml: 0 }}>
              <Grid item xs={12}>
                <Box>
                  <ArogyamComponentV1
                    cardData={cardData}
                    images={images || {}}
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box>
                  <TextElement label="ID#" value={cardData._id} />
                </Box>
                <Box>
                  <TextElement
                    label="Expiry"
                    value={
                      cardData?.expiry_date &&
                      moment(cardData.expiry_date)
                        .subtract(1, "day")
                        .add(2, "years")
                        .format("MMM YYYY")
                    }
                  />
                </Box>

                {cardData?.emergency_contact && (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton
                      sx={{
                        mr: 1,
                        borderRadius: 0,
                      }}
                      onClick={() =>
                        window.open(
                          `https://wa.me/${cardData.emergency_contact}`
                        )
                      }
                    >
                      <div>
                        <img src="/whatsapp.png" alt="" srcset="" />
                      </div>
                      <div style={{ marginLeft: "14px", textAlign: "start" }}>
                        <TextElement
                          label="Emergency Contact"
                          value={cardData.emergency_contact}
                        />
                      </div>
                    </IconButton>
                  </Box>
                )}

                <Box>
                  <TextElement
                    label="Created At"
                    value={
                      cardData?.created_at &&
                      moment(cardData.created_at).format("DD-MM-YYYY")
                    }
                  />
                </Box>
              </Grid>
            </Grid>
          </Grid>

          <CardActions>
            <Box
              sx={{
                width: "100%",
                display: "inline-flex",
                justifyContent: "space-between",
                alignItems: "end",
              }}
            >
              <Box>
                <Button
                  sx={{
                    display: "inline-flex",
                    color: "#ff5722",
                    p: 1,
                    m: 0,
                    mr: 3,
                  }}
                  variant="standard"
                  startIcon={<FileDownloadIcon />}
                  onClick={() => {
                    handleDownloadCard();
                  }}
                >
                  Download
                </Button>

                <Button
                  size="large"
                  startIcon={<RepeatOneIcon />}
                  sx={{
                    display: "inline-flex",
                    color: "#ff5722",
                    p: 1,
                    m: 0,
                    mr: 3,
                  }}
                  onClick={() => {
                    setDialogType("renew");

                    const issueDate = cardData.issue_date
                      ? new Date(cardData.issue_date)
                      : new Date(cardData.created_at);
                    setRenewCalculation(
                      moment(issueDate).add(2, "years").format("DD-MM-YYYY")
                    );

                    setIsDialogOpen(true);
                  }}
                >
                  Renew
                </Button>
                <Button
                  size="large"
                  startIcon={<CancelIcon />}
                  disabled={cardData?.status === "DISCARDED"}
                  sx={{ display: "inline-flex", color: "#ff5722", p: 1 }}
                  onClick={() => {
                    if (cardData.status !== "DISCARDED") {
                      setDialogType("discard");
                      setIsDialogOpen(true);
                      setShouldFocus(true);
                    }
                  }}
                >
                  Discard
                </Button>
                {cardData?.status === "DISCARDED" && (
                  <Button
                    size="large"
                    startIcon={<RestoreIcon />}
                    disabled={cardData?.status !== "DISCARDED"}
                    sx={{ display: "inline-flex", color: "#ff5722", p: 1 }}
                    onClick={() => {
                      if (cardData.status === "DISCARDED") {
                        // setIsDialogOpen(true);
                        handleStatusChange({
                          payload: { status: "SUBMITTED" },
                        });
                      }
                    }}
                  >
                    Undiscard
                  </Button>
                )}
              </Box>
              <Box sx={{ display: "inline-flex" }}>
                <Button
                  sx={{ color: "#ff5722" }}
                  onClick={() => {
                    setAnchorEl(null);
                    setIsMenuOpened(false);
                    handleStatusChange({ payload: { status: "SUBMITTED" } });
                  }}
                >
                  Submitted
                </Button>
                <Button
                  sx={{ color: "#ff5722" }}
                  onClick={() => {
                    setAnchorEl(null);
                    setIsMenuOpened(false);
                    handleStatusChange({ payload: { status: "DELIVERED" } });
                  }}
                >
                  Delivered
                </Button>
                <Button
                  sx={{ color: "#ff5722" }}
                  onClick={() => {
                    setAnchorEl(null);
                    setIsMenuOpened(false);
                    handleStatusChange({ payload: { status: "UNDELIVERED" } });
                  }}
                >
                  Undelivered
                </Button>
                <Button
                  sx={{ color: "#ff5722" }}
                  onClick={() => {
                    setAnchorEl(null);
                    setIsMenuOpened(false);
                    handleStatusChange({ payload: { status: "RTO" } });
                  }}
                >
                  RTO
                </Button>
                <Button
                  sx={{ color: "#ff5722" }}
                  onClick={() => {
                    setAnchorEl(null);
                    setIsMenuOpened(false);
                    handleStatusChange({ payload: { status: "REPRINT" } });
                  }}
                >
                  Reprint
                </Button>
              </Box>
            </Box>
          </CardActions>
        </CardContent>
      </Card>
      {/* Right button */}
      {Boolean(idList?.length) && (
        <IconButton
          sx={{
            // position: "absolute",
            borderRadius: 0,
            color: "#ff5722",
          }}
          onClick={() => {
            // Your right button action here
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      )}
      <EditCardDialog
        open={isEditDialogOpened}
        cardData={cardData}
        onClose={() => setIsEditDialogOpened(false)}
      />
      {Boolean(isTimeLineData.length) && (
        <TimeLineDialog
          open={isTimeLineOpened}
          onClose={() => setIsTimeLineOpened(false)}
          data={isTimeLineData}
        />
      )}
    </Box>
  );
};

export default CardComponent;
