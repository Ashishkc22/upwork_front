import React, { useEffect, useState } from "react";
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
import Menu from "@mui/material/Menu";
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
import { useNavigate } from "react-router-dom";
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

const CardComponent = () => {
  const [isMenuOpened, setIsMenuOpened] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [cardData, setCardData] = useState({});
  const [renewCalculation, setRenewCalculation] = useState("");
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setIsMenuOpened(true);
  };
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState(""); //renew and discard
  const [selectReason, setSelectReason] = useState("");
  const [discardMessageReason, setDiscardMessageReason] = useState("");
  const [idList, setIdList] = useState([]);
  const navigate = useNavigate();

  const { id } = useParams();

  const fetchCardData = () => {
    cards.getCardById({ id }).then((data) => {
      console.log("data", data);
      setIdList(storageUtil.getStorageData("card_ids") || []);
      setCardData(data);
    });
  };

  useEffect(() => {
    fetchCardData();
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

  const handleDownloadCard = () => {
    console.log("cardData", cardData);

    downloadCards.downloadSingleCard({
      Element: <ArogyamComponent cardData={cardData} images={images} />,
      cardData,
    });
  };

  return (
    <Card
      sx={{
        minWidth: "470px",
        margin: "auto",
        mx: {
          lg: "auto",
          sm: 2,
        },

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
          {dialogType == "renew" ? "Renew Card" : "Discard Reason?"}
        </DialogTitle>
        <DialogContent>
          {dialogType == "renew" ? (
            <DialogContentText id="alert-dialog-description">
              Renew {cardData.name}'s card, extending expiry till{" "}
              {renewCalculation}
            </DialogContentText>
          ) : (
            <Box alignItems="center">
              <TextField
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
                  sx={{
                    width: "150px",
                    mb: 1,
                  }}
                  // value={age}
                  onChange={(e) => setSelectReason(e.target.value)}
                  label="Select Reason"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value={"Wrong ID"}>Wrong ID</MenuItem>
                  <MenuItem value={"Wrong Mobile No."}>
                    Wrong Mobile No.
                  </MenuItem>
                  <MenuItem value={"Wrong Name/TOB"}>Wrong Name/TOB</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              if (dialogType == "renew") {
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
            {dialogType == "renew" ? "Renew" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
      <CardHeader
        sx={{ p: 0, mt: 1 }}
        action={
          <Button
            sx={{ display: "inline-flex", color: "#ff5722", p: 1, m: 0, mr: 3 }}
            variant="standard"
            startIcon={<EditIcon />}
          >
            Edit
          </Button>
        }
      />
      <CardContent sx={{ px: 5 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
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
              <TextElement label="Birth Year" value={cardData.birth_year} />
            </Box>

            <Box>
              <TextElement
                label="Blood Group"
                value={cardData.blood_group || ""}
              />
            </Box>
            <Box>
              <TextElement label="Gender" value={cardData.gender} />
            </Box>

            <Box>
              <TextElement
                label="Father/Husband Name"
                value={cardData.father_husband_name}
              />
            </Box>

            <Box>
              <TextElement label="Aadhaar" value={cardData?.id_proof?.value} />
            </Box>

            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton sx={{ mr: 1 }}>
                <img src="/whatsapp.png" alt="" srcset="" />
              </IconButton>
              <div>
                <TextElement label="Phone" value={cardData.phone} />
              </div>
            </Box>
            <Box sx={{ display: "flex" }}>
              <Link
                underline="none"
                href="#"
                sx={{ display: "inline-flex" }}
                color="none"
              >
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
              </Link>
            </Box>
          </Grid>

          <Grid item xs={12} md={6} sx={{ ml: 0 }}>
            <Grid item xs={12}>
              <Box>
                <ArogyamComponentV1 cardData={cardData} images={images || {}} />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box>
                <TextElement
                  label="Expiry"
                  value={
                    cardData?.expiry_date &&
                    moment(cardData.expiry_date).format("MMM YYYY")
                  }
                />
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
                    onClick={handleClick}
                    aria-controls={
                      isMenuOpened ? "demo-positioned-menu" : undefined
                    }
                    aria-haspopup="true"
                    aria-expanded={isMenuOpened ? "true" : undefined}
                    sx={{
                      display: "inline-flex",
                      color: "#ff5722 !important",
                      pb: 0,
                    }}
                    variant="standard"
                    startIcon={<VerifiedUserOutlinedIcon />}
                    disabled
                  >
                    Status
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
                      vertical: "top",
                      horizontal: "left",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "left",
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

              <Box>
                <TextElement
                  label="Created At"
                  value={
                    cardData?.created_at &&
                    moment(cardData.created_at).format("DD-MM-YYYY")
                  }
                />
              </Box>
              <Box>
                <TextElement
                  label="Created By"
                  value={
                    cardData?.created_by_uid &&
                    `UID : ${cardData.created_by_uid}`
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
                disabled={cardData?.status == "DISCARDED"}
                sx={{ display: "inline-flex", color: "#ff5722", p: 1 }}
                onClick={() => {
                  if (cardData.status != "DISCARDED") {
                    setDialogType("discard");
                    setIsDialogOpen(true);
                  }
                }}
              >
                Discard
              </Button>
              {cardData?.status == "DISCARDED" && (
                <Button
                  size="large"
                  startIcon={<RestoreIcon />}
                  disabled={cardData?.status != "DISCARDED"}
                  sx={{ display: "inline-flex", color: "#ff5722", p: 1 }}
                  onClick={() => {
                    if (cardData.status == "DISCARDED") {
                      // setIsDialogOpen(true);
                      handleStatusChange({ payload: { status: "SUBMITTED" } });
                    }
                  }}
                >
                  Reset
                </Button>
              )}
            </Box>
            <Box sx={{ display: "inline-flex" }}>
              <Button
                sx={{ color: "#ff5722" }}
                onClick={() => {
                  setAnchorEl(null);
                  setIsMenuOpened(false);
                }}
              >
                Submitted
              </Button>
              <Button
                sx={{ color: "#ff5722" }}
                onClick={() => {
                  setAnchorEl(null);
                  setIsMenuOpened(false);
                }}
              >
                Delivered
              </Button>
              <Button
                sx={{ color: "#ff5722" }}
                onClick={() => {
                  setAnchorEl(null);
                  setIsMenuOpened(false);
                }}
              >
                Undelivered
              </Button>
              <Button
                sx={{ color: "#ff5722" }}
                onClick={() => {
                  setAnchorEl(null);
                  setIsMenuOpened(false);
                }}
              >
                RTO
              </Button>
              <Button
                sx={{ color: "#ff5722" }}
                onClick={() => {
                  setAnchorEl(null);
                  setIsMenuOpened(false);
                }}
              >
                Reprint
              </Button>
            </Box>
          </Box>
        </CardActions>
      </CardContent>
    </Card>
  );
};

export default CardComponent;
