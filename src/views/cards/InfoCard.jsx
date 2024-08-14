import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Box,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArogyamComponent from "../../components/ArogyaCard";
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

const CardComponent = () => {
  const [isMenuOpened, setIsMenuOpened] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [cardData, setCardData] = useState({});
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setIsMenuOpened(true);
  };
  const navigate = useNavigate();

  const { id } = useParams();

  const fetchCardData = () => {
    cards.getCardById({ id }).then((data) => {
      console.log("data", data);

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

            <Box>
              <TextElement label="Phone" value={cardData.phone} />
            </Box>
            <Box>
              <TextElement
                label="Address"
                value={`${cardData.area} ${cardData.tehsil}  ${cardData.district} ${cardData.state} `}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={6} sx={{ ml: 0 }}>
            <Grid item xs={12}>
              <Box>
                <ArogyamComponent cardData={cardData} />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box>
                <TextElement
                  label="Expiry"
                  value={
                    cardData?.expiry &&
                    moment(cardData.expiry).format("MMM YYYY")
                  }
                />
              </Box>

              <Box display="inline-flex" alignItems="flex-end">
                <Box>
                  <TextElement label="Status" value={cardData.status} />
                </Box>
                <Box sx={{ ml: 6 }}>
                  <Button
                    onClick={handleClick}
                    aria-controls={
                      isMenuOpened ? "demo-positioned-menu" : undefined
                    }
                    aria-haspopup="true"
                    aria-expanded={isMenuOpened ? "true" : undefined}
                    sx={{ display: "inline-flex", color: "#ff5722", pb: 0 }}
                    variant="standard"
                    startIcon={<VerifiedUserOutlinedIcon />}
                  >
                    Status
                  </Button>
                  <Menu
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
                      Submitted
                    </MenuItem>
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
                  </Menu>
                </Box>
              </Box>

              <Box>
                <TextElement
                  label="Created At"
                  value={
                    cardData?.createdAt &&
                    moment(cardData.createdA).format("DD-MM-YYYY")
                  }
                />
              </Box>
              <Box>
                <TextElement
                  label="Created By"
                  value={
                    cardData?.createdBy &&
                    moment(cardData.createdBy).format("DD-MM-YYYY")
                  }
                />
              </Box>
            </Grid>
          </Grid>
        </Grid>
        <CardActions>
          <Button
            sx={{ display: "inline-flex", color: "#ff5722", p: 1, m: 0, mr: 3 }}
            variant="standard"
            startIcon={<FileDownloadIcon />}
          >
            Download
          </Button>

          <Button
            size="large"
            startIcon={<RepeatOneIcon />}
            sx={{ display: "inline-flex", color: "#ff5722", p: 1, m: 0, mr: 3 }}
          >
            Renew
          </Button>
          <Button
            size="large"
            startIcon={<CancelIcon />}
            sx={{ display: "inline-flex", color: "#ff5722", p: 1 }}
          >
            Discard
          </Button>
        </CardActions>
      </CardContent>
    </Card>
  );
};

export default CardComponent;
