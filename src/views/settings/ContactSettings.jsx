import React, { useState, useEffect } from "react";
import {
  TextField,
  Box,
  Typography,
  InputAdornment,
  IconButton,
} from "@mui/material";
import LaunchIcon from "@mui/icons-material/Launch";
import settings from "../../services/settings";
import Fab from "@mui/material/Fab";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const ContactSettings = () => {
  const [links, setLinks] = useState({
    telegram: "",
    contactUs: "",
    youtube: "",
    whatsapp: "",
    instagram: "",
    facebook: "",
    twitter: "",
  });

  const [response, setResponse] = useState({});

  const handleInputChange = (field, event) => {
    setLinks({
      ...links,
      [field]: event.target.value,
    });
  };

  // Fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await settings.getHospitalAndContactSettings();

        console.log("response", response);
        setLinks({
          telegram: response?.tele_gram || "",
          contactUs: response?.contact_us || "",
          youtube: response?.youtube || "",
          whatsapp: response?.whatsapp || "",
          instagram: response?.ig || "",
          facebook: response?.fb || "",
          twitter: response?.tw || "",
        });
        setResponse(response);
      } catch (error) {
        console.error("Error fetching stack data:", error);
      }
    };

    fetchData();
  }, []);

  const handleSave = async () => {
    const body = {
      ...response,
      id: response._id,
      tele_gram: links.telegram,
      contact_us: links.contactUs,
      youtube: links.youtube,
      whatsapp: links.whatsapp,
      ig: links.instagram,
      fb: links.facebook,
      tw: links.twitter,
    };
    delete body._id;
    await settings.saveHospitalAndContactSettings({ body: body });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        padding: 2,
        width: {
          lg: "30%",
          md: "65%",
          sm: "75%",
          xs: "100%",
        },
      }}
    >
      {Object.keys(links).map((key) => (
        <TextField
          key={key}
          label={
            key.charAt(0).toUpperCase() +
            key.slice(1).replace(/([A-Z])/g, " $1")
          }
          variant="outlined"
          value={links[key]}
          onChange={(event) => handleInputChange(key, event)}
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  edge="end"
                  onClick={(e) => {
                    if (key == "contactUs") {
                      window.open(`tel:${links[key]}`);
                    } else {
                      window.open(links[key]);
                    }
                  }}
                >
                  <LaunchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      ))}
      <Fab
        variant="extended"
        size="large"
        onClick={handleSave}
        sx={{
          position: "absolute",
          right: 20,
          bottom: 20,
          background: "#ff5722",
          color: "white",
          ":hover": {
            background: "#e83c05",
          },
        }}
      >
        <CheckCircleOutlineIcon sx={{ marginRight: "8px" }} />
        Save
      </Fab>
    </Box>
  );
};

export default ContactSettings;
