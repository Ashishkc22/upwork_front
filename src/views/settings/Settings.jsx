import React, { useState } from "react";
import {
  AppBar,
  Tabs,
  Tab,
  IconButton,
  Toolbar,
  Box,
  Typography,
  Grid,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import Stack from "./Stack";
import { useEffect } from "react";
import common from "../../services/common";
import { isEmpty } from "lodash";

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
};

const SettingsPage = () => {
  const [value, setValue] = useState(0);
  //   State
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedStates] = useState({});

  //   District
  const [district, setDistrict] = useState([]);
  const [selectedDistrict, setDistrictStates] = useState({});

  //   District
  const [tehsil, setTehsil] = useState([]);
  const [selectedTehsil, setTehsilStates] = useState({});

  //   Janpad
  const [janpad, setJanpad] = useState([]);
  const [selectedJanpad, setJanpadStates] = useState({});

  //   gramP
  const [gramPanchayat, setGramPanchayat] = useState([]);
  const [selectedGramPanchayat, setGramPanchayatStates] = useState({});
  //   Gram
  const [gram, setGram] = useState([]);
  const [selectedGram, setSelectedGram] = useState({});

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const getAddress = (payload) => {
    return common.getAddressData(payload);
  };

  useEffect(() => {
    getAddress().then((states) => {
      setStates(states);
    });
  }, []);

  function handleStateClick(state) {
    console.log("state ===>>", state);
    setSelectedStates(state);
    getAddress({ type: "district", params: { stateId: state._id } }).then(
      (data) => {
        setDistrict(data);
      }
    );
  }

  function handleDistrictClick(district) {
    setDistrictStates(district);
    getAddress({
      type: "tehsil",
      params: { districtId: district._id },
      showHidden: false,
    }).then((data) => {
      console.log("data tehsil", data);

      setTehsil(data);
    });
    // janpad
    getAddress({
      type: "janPanchayat",
      params: { districtId: district._id },
      showHidden: false,
    }).then((data) => {
      setJanpad(data);
    });
  }

  function handleTehsilClick(tehsil) {
    setTehsilStates(tehsil);
    setJanpadStates({});

    getAddress({
      type: "gramPanchayat",
      params: { tehsilId: tehsil._id, showHidden: false },
    }).then((data) => {
      setGramPanchayat(data);
    });
  }

  function handleJanpad(janpad) {
    setTehsilStates({});
    setJanpadStates(janpad);
    getAddress({
      type: "gramPanchayat",
      params: { janPanchayatId: janpad._id, showHidden: false },
    }).then((data) => {
      setGramPanchayat(data);
    });
  }

  function handleGramPClick(gramP) {
    setGramPanchayatStates(gramP);
    getAddress({
      type: "gram",
      params: { gramPanchayatId: gramP._id, showHidden: false },
    }).then((data) => {
      setGram(data);
    });
  }

  function handleGramClick(gramP) {
    setSelectedGram(gram);
    //   getAddress({
    //     type: "gram",
    //     params: { gramPanchayatId: gramP._id, showHidden: false },
    //   }).then((data) => {
    //       setSelectedGram(data);
    //   });
  }

  return (
    <Box sx={{ width: "100%" }}>
      <AppBar
        position="static"
        sx={{ backgroundColor: "transparent", boxShadow: "none" }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="settings tabs"
            sx={{ flexGrow: 1 }}
          >
            <Tab icon={<LocationOnIcon />} label="Location Settings" />
            <Tab icon={<LocalHospitalIcon />} label="Hospital Settings" />
            <Tab icon={<ContactMailIcon />} label="Contact Settings" />
          </Tabs>
          <IconButton color="primary">
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <TabPanel value={value} index={0}>
        <Grid container>
          <Grid item lg={2} sx={{ m: 0, p: 0 }}>
            <Stack
              addDialogText="Create State"
              searchInputLabel="Search state"
              titleWithCount={`State (${states.length})`}
              stackData={states}
              selectedItem={selectedState}
              handleItemClick={handleStateClick}
            />
          </Grid>
          <Grid item lg={2}>
            <Stack
              addDialogText={`Create District in ${selectedState.name}`}
              searchInputLabel="Search District"
              titleWithCount={`District (${district.length})`}
              stackData={district}
              selectedItem={selectedDistrict}
              handleItemClick={handleDistrictClick}
            />
          </Grid>
          <Grid item lg={2}>
            <Stack
              addDialogText={`Create Tehsil in ${selectedDistrict.name}`}
              searchInputLabel="Search Tehsil"
              titleWithCount={`Tehsil (${tehsil.length})`}
              stackData={tehsil}
              selectedItem={selectedTehsil}
              handleItemClick={handleTehsilClick}
            />
          </Grid>
          <Grid item lg={2}>
            <Stack
              addDialogText={`Create Janpad Panchayat in ${selectedDistrict.name}`}
              searchInputLabel="Search Janpad Panchayat"
              titleWithCount={`Janpad Panchayat (${janpad.length})`}
              stackData={janpad}
              selectedItem={selectedJanpad}
              handleItemClick={handleJanpad}
            />
          </Grid>
          <Grid item lg={2}>
            <Stack
              addDialogText={`Create Gram Panchayat in ${
                selectedTehsil?.name || selectedJanpad?.name
              }`}
              searchInputLabel="Search Gram Panchayat"
              titleWithCount={`Gram Panchayat (${gramPanchayat.length})`}
              stackData={gramPanchayat}
              selectedItem={selectedGramPanchayat}
              handleItemClick={handleGramPClick}
            />
          </Grid>
          <Grid item lg={2}>
            <Stack
              addDialogText={`Create Gram in ${selectedGramPanchayat?.name}`}
              searchInputLabel="Search Gram"
              titleWithCount={`Gram (${gram.length})`}
              stackData={gram}
              selectedItem={selectedGram}
              handleItemClick={handleGramClick}
              selectedDetails={{
                gramPanchayat: "",
                janPanchayat: "",
                tehsil: "",
                pincode: "",
                updatedAdminBy: "",
                sarpanch: selectedGramPanchayat.sarpanch,
                sachiv: selectedGramPanchayat.sachiv,
                rojgarSahayak: selectedGramPanchayat.rojgarSahayak,
              }}
            />
          </Grid>
        </Grid>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Typography>Hospital Settings Content</Typography>
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Typography>Contact Settings Content</Typography>
      </TabPanel>
    </Box>
  );
};

export default SettingsPage;
