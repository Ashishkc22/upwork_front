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
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import PhoneIcon from "@mui/icons-material/Phone";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import AddIcon from "@mui/icons-material/Add";

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
  const imageRef = useRef(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState(""); //renew and discard
  const [selectReason, setSelectReason] = useState([]);
  const [discardMessageReason, setDiscardMessageReason] = useState("");
  const [isEditDialogOpened, setIsEditDialogOpened] = useState(false);
  const [FEDetails, setFEDetails] = useState({});
  const [TLDetails, setTLDetails] = useState({});
  const [renewIncValue, setRenewIncValue] = useState(1);

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

  const fetchCardData = ({ paramId = false } = {}) => {
    cards.getCardById({ id: paramId || id }).then((data) => {
      setCardData(data);
      if (data?.status_history?.length) {
        setIsTimeLineData(data.status_history.reverse());
      }
      fetchUserById({ uid: data.created_by_uid }).then((data) => {
        setFEDetails(data);
        fieldExecutives
          .getTLById({ tl_id: data.team_leader_id })
          .then((tlDetails) => {
            setTLDetails(tlDetails);
          });
      });
    });
  };

  const fetchUserById = ({ uid }) => {
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
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  const TextElement = ({ label, value, path, subText }) => {
    return (
      <Box
      // {...(path && {
      //   onClick: () => navigate(path),
      // })}
      // sx={{
      //   ...(path && { ":hover": { cursor: "pointer", color: "blue" } }),
      // }}
      >
        <Typography
          component="div"
          sx={{ color: "#00000070", mt: 1, fontSize: "13px" }}
        >
          {label}
        </Typography>
        <Typography variant="h6" component="div" sx={{ fontWeight: 500 }}>
          {value}
        </Typography>
        {subText && (
          <Typography
            variant="body"
            component="div"
            sx={{ fontWeight: 500, color: "#000000ab", fontSize: "9px" }}
          >
            {subText}
          </Typography>
        )}
      </Box>
    );
  };

  // https://asia-south1-arogyam-super.cloudfunctions.net/app/cards/66891b06173e6b8a1bf1ff55?token=7wWnejhnZjhHWyzDF8yHk9
  // FromData {status: DISCARDED
  // discard_reason: Wrong Mobile No.: testing discard feature}
  const handleRenewCard = async () => {
    try {
      const renewPayload = {};
      console.log("cardData", cardData);

      renewPayload.expiry_date = moment(new Date(cardData.expiry_date))
        .add(renewIncValue, "year")
        .valueOf();
      renewPayload.expiry_years = cardData.expiry_years + renewIncValue;
      renewPayload.expiry = moment(new Date(cardData.expiry_date))
        .add(renewIncValue, "year")
        .format("MMM YYYY");

      console.log("renewPayload", renewPayload);
      console.log("renewIncValue", renewIncValue);

      const updatedCardData = await cardService.renewCard({
        ...renewPayload,
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
    const imageUrl = imageRef.current;
    if (imageUrl) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = imageUrl.width;
      canvas.height = imageUrl.height;
      ctx.drawImage(imageUrl, 0, 0);
      const imageDataUrl = canvas.toDataURL("image/jpeg");

      downloadCards.downloadSingleCard({
        Element: <ArogyamComponent cardData={cardData} images={images} />,
        secondaryImage: imageDataUrl,
        cardData,
      });
    }
  };

  return (
    <Box
      sx={{
        display: "inline-flex",
        width: "80%",
        justifyContent: "space-between",
      }}
      onClick={(e) => {
        if (!isEditDialogOpened) {
          e.stopPropagation();
          navigate(-1);
        }
      }}
    >
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
      <img
        src="/health-card-back.jpeg"
        ref={imageRef}
        alt="health back"
        style={{ display: "none" }}
      />
      <Card
        sx={{
          minWidth: "470px",
          margin: "auto",
          mx: { lg: "auto", sm: 2 },
          mt: "2%",
          borderRadius: 2,
          boxShadow: 3,
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {/* renew dialog */}
        <Dialog
          open={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
          }}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {dialogType === "renew" ? "Renew Card" : "Discard Reason?"}
          </DialogTitle>
          <DialogContent>
            {dialogType === "renew" ? (
              <DialogContentText id="alert-dialog-description">
                <Box>
                  Renew {cardData.name}'s card, extending expiry till{" "}
                  {renewCalculation}
                </Box>
                <Box display="inline-flex">
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant={renewIncValue === 1 ? "outlined" : "standard"}
                      endIcon={<AddIcon />}
                      onClick={() => {
                        setDialogType("renew");
                        const issueDate = cardData.issue_date
                          ? moment(cardData.issue_date, "DD/MM/YYYY")
                          : new Date(cardData.created_at);

                        setRenewCalculation(
                          moment(issueDate, "DD/MM/YYYY")
                            .add(1, "years")
                            .format("DD-MM-YYYY")
                        );
                        setRenewIncValue(1);
                      }}
                    >
                      1
                    </Button>
                  </Box>
                  <Box sx={{ mt: 2, mx: 2 }}>
                    <Button
                      variant={renewIncValue === 2 ? "outlined" : "standard"}
                      endIcon={<AddIcon />}
                      onClick={() => {
                        setDialogType("renew");
                        const issueDate = cardData.issue_date
                          ? moment(cardData.issue_date, "DD/MM/YYYY")
                          : new Date(cardData.created_at);

                        setRenewCalculation(
                          moment(issueDate, "DD/MM/YYYY")
                            .add(2, "years")
                            .format("DD-MM-YYYY")
                        );
                        setRenewIncValue(2);
                      }}
                    >
                      2
                    </Button>
                  </Box>
                </Box>
              </DialogContentText>
            ) : (
              <Box alignItems="center">
                <TextField
                  id="standard-basic"
                  label="Discard Reason"
                  variant="standard"
                  placeholder="Discard Reason"
                  onChange={(e) => setDiscardMessageReason(e.target.value)}
                  sx={{ mt: 1, width: "350px" }}
                />
                <Box sx={{ mt: 2 }}>
                  <InputLabel id="demo-simple-select-standard-label">
                    Select Reason
                  </InputLabel>
                  <ToggleButtonGroup
                    color="primary"
                    sx={{ my: 1 }}
                    value={selectReason}
                    exclusive
                    onChange={(event, newValue) => {
                      setSelectReason((pre) => {
                        if (pre && pre.includes(newValue)) {
                          return pre.filter((v) => v != newValue);
                        } else {
                          return [newValue].concat(pre);
                        }
                      });
                    }}
                    aria-label="Platform"
                  >
                    <ToggleButton value="Wrong ID">Wrong ID</ToggleButton>
                    <ToggleButton value="Wrong Mobile No.">
                      Wrong Mobile No.
                    </ToggleButton>
                    <ToggleButton value="Wrong Name/TOB">
                      Wrong Name/TOB
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
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
                      discard_reason: `${selectReason.join(
                        " "
                      )}: ${discardMessageReason}`,
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
          <Grid container spacing={0} columnSpacing={1}>
            <Grid item container xs={12} columnSpacing={1}>
              <Grid item xs={12} md={5}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(-1);
                    }}
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
                    onClick={() =>
                      window.open(`https://wa.me/${cardData.phone}`)
                    }
                  >
                    <div>
                      <img src="/whatsapp.png" alt="" srcset="" />
                    </div>
                    <div style={{ marginLeft: "14px", textAlign: "start" }}>
                      <TextElement label="Phone" value={cardData.phone} />
                    </div>
                  </IconButton>
                  {/* <IconButton
                      sx={{ color: "#23e223" }}
                      onClick={() =>
                        window.open(`https://wa.me/${cardData.phone}`)
                      }
                    >
                      <WhatsAppIcon />
                    </IconButton> */}
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
                  <Grid container>
                    {cardData.blood_group && (
                      <Grid item xs={6}>
                        <TextElement
                          label="Blood Group"
                          value={cardData.blood_group || ""}
                        />
                      </Grid>
                    )}
                    {cardData.emergency_contact && (
                      <Grid item xs={6}>
                        <TextElement
                          label="Emergency Contact"
                          value={cardData.emergency_contact || ""}
                        />
                      </Grid>
                    )}
                  </Grid>
                </Box>
                {/* created by */}
                {/* <Box>
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
                </Box> */}

                {/* <Box display="inline-flex" alignItems="flex-end"></Box> */}

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
                        moment(cardData.expiry_date).format("MMM YYYY")
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
                        moment(cardData.created_at).format(
                          "DD-MM-YYYY HH:mm:ss"
                        )
                      }
                    />
                  </Box>
                </Grid>
              </Grid>
            </Grid>
            <Grid item container xs={12} alignItems="center">
              <Grid item xs={6}>
                <Box>
                  <TextElement label="Status" value={cardData.status} />
                  {cardData.discard_reason && (
                    <span label="" style={{ fontSize: 12, color: "#00000075" }}>
                      {cardData.discard_reason}
                    </span>
                  )}
                </Box>
              </Grid>
              <Grid item xs={6}>
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
              </Grid>
              <Grid item xs={6}>
                <Grid
                  container
                  alignItems="end"
                  columnSpacing={1}
                  sx={{ my: 1 }}
                >
                  <Grid item>
                    {/* `/field-executives/${cardData.created_by_uid}` */}
                    <TextElement
                      label="Created By"
                      value={FEDetails.name}
                      path={`/field-executives/${cardData.created_by_uid}`}
                      subText={`UID: ${FEDetails.uid}`}
                    />
                  </Grid>
                  <Grid item>
                    <IconButton>
                      <PhoneIcon
                        onClick={() => window.open(`tel:${FEDetails.phone}`)}
                      />
                    </IconButton>
                  </Grid>
                  <Grid item>
                    <IconButton
                      sx={{ color: "#23e223" }}
                      onClick={() =>
                        window.open(`https://wa.me/+91${FEDetails.phone}`)
                      }
                    >
                      <WhatsAppIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={6}>
                <Grid
                  container
                  alignItems="end"
                  columnSpacing={1}
                  sx={{ my: 1 }}
                >
                  <Grid item>
                    {/* `/field-executives/${cardData.created_by_uid}` */}
                    <TextElement
                      label="TL Name"
                      value={TLDetails.name}
                      path={`/field-executives/${TLDetails.tl_id}`}
                      subText={`UID: ${TLDetails.tl_id}`}
                    />
                  </Grid>

                  <Grid item>
                    <IconButton>
                      <PhoneIcon
                        onClick={() => window.open(`tel:${TLDetails.phone}`)}
                      />
                    </IconButton>
                  </Grid>

                  <Grid item>
                    <IconButton
                      sx={{ color: "#23e223" }}
                      onClick={() =>
                        window.open(`https://wa.me/+91${TLDetails.phone}`)
                      }
                    >
                      <WhatsAppIcon />
                    </IconButton>
                  </Grid>
                </Grid>
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
                    const issueDate = new Date(cardData.expiry_date);
                    console.log(
                      'moment(issueDate).add(1, "years").format("DD-MM-YYYY")',
                      moment(issueDate).add(1, "years").format("DD-MM-YYYY")
                    );

                    setRenewCalculation(
                      moment(issueDate).add(1, "years").format("DD-MM-YYYY")
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
                {/* <Button
                  sx={{ color: "#ff5722" }}
                  onClick={() => {
                    setAnchorEl(null);
                    setIsMenuOpened(false);
                    handleStatusChange({ payload: { status: "SUBMITTED" } });
                  }}
                >
                  Submitted
                </Button> */}
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