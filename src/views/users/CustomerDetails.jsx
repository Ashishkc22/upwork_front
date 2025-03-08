import React, { useRef } from "react";
import { Tabs, Tab, Box, IconButton, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import UserDetailsTab from "./UserDetailsTab";
import CardTab from "./CardDetails";
import { useNavigate } from "react-router-dom";
import { verifyUser } from "../../services/users";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useParams } from "react-router-dom";

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const ref = useRef();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleVerify = async () => {
    try {
      const response = await verifyUser({ id });
      ref.current.triggerChildFunction();
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {" "}
        <IconButton onClick={handleBack}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ display: "flex" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "end",
              alignItems: "center",
              m: 1,
            }}
          >
            <Button
              variant="contained"
              endIcon={<CheckCircleOutlineIcon />}
              onClick={handleVerify}
            >
              Verify
            </Button>
          </Box>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
          >
            <Tab label="User Details" />
            <Tab label="Cards" />
          </Tabs>
        </Box>
      </Box>

      {value === 0 && <UserDetailsTab ref={ref} />}
      {value === 1 && <CardTab ref={ref} />}
    </Box>
  );
}
