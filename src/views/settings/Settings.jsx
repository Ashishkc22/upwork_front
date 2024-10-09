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
  Button,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import Stack from "./Stack";
import { useEffect } from "react";
import common from "../../services/common";
import { isEmpty } from "lodash";
import HospitalSettings from "./HospitalSettings";
import ContactSettings from "./ContactSettings";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import settings from "../../services/settings";
import { tokens } from "../../theme";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import UploadLocation from "./UploadLocations";

import { useTheme } from "@mui/material/styles";

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

  const [showHidden, setShowHidden] = useState(false);

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const handleChange = (event, newValue) => {
    console.log("newValue", newValue);

    setValue(newValue);
  };

  const getAddress = (payload) => {
    return common.getAddressData(payload);
  };

  useEffect(() => {
    setSelectedStates({
      _id: "63c681806072b29c2133326e",
      name: "MP",
      __v: 0,
      active: true,
    });
    getAddress({
      type: "district",
      params: {
        stateId: "63c681806072b29c2133326e",
        ...(showHidden && { showHidden }),
      },
    }).then((district) => {
      // setStates(district);
      // console.log("data", district);
      setDistrict(district);
    });
  }, [showHidden]);

  function handleStateClick(state) {
    console.log("state ===>>", state);
    setSelectedStates(state);
    getAddress({
      type: "district",
      params: { stateId: state._id, ...(showHidden && { showHidden }) },
    }).then((data) => {
      setDistrict(data);
    });
  }

  function handleDistrictClick(district) {
    setDistrictStates(district);
    getAddress({
      type: "tehsil",
      params: { districtId: district._id, ...(showHidden && { showHidden }) },
      showHidden: false,
    }).then((data) => {
      console.log("data tehsil", data);

      setTehsil(data);
    });
    // janpad
    getAddress({
      type: "janPanchayat",
      params: { districtId: district._id, ...(showHidden && { showHidden }) },
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
      params: { tehsilId: tehsil._id, ...(showHidden && { showHidden }) },
    }).then((data) => {
      console.log("gram", data);
      if (data?.length) {
        setGramPanchayat(data);
      } else {
        setGramPanchayat([]);
      }
    });
  }

  function handleJanpad(janpad) {
    setTehsilStates({});
    setJanpadStates(janpad);
    getAddress({
      type: "gramPanchayat",
      params: { janPanchayatId: janpad._id, ...(showHidden && { showHidden }) },
    }).then((data) => {
      if (!isEmpty(selectedGramPanchayat)) {
        const newData = data.find((g) => g._id === selectedGramPanchayat._id);
        console.log("newData", newData);
        if (!isEmpty(newData)) {
          setGramPanchayatStates(newData);
        }
      }
      setGramPanchayat(data);
    });
  }

  function handleGramPClick(gramP) {
    setGramPanchayatStates(gramP);
    getAddress({
      type: "gram",
      params: { gramPanchayatId: gramP._id, ...(showHidden && { showHidden }) },
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

  function handleApiCallback(stackName) {
    const apiMap = {
      state: () => getAddress(),
      district: () => handleStateClick(selectedState),
      tehsil: () =>
        !isEmpty(selectedDistrict) && handleDistrictClick(selectedDistrict),
      janPanchayat:
        !isEmpty(selectedDistrict) && handleDistrictClick(selectedDistrict),
      gramPanchayat: () =>
        !isEmpty(selectedTehsil)
          ? handleJanpad(selectedTehsil)
          : handleJanpad(selectedJanpad),
      gram: function () {
        if (!isEmpty(selectedGramPanchayat)) {
          handleGramPClick(selectedGramPanchayat);
          console.log("this", this);

          this.gramPanchayat();
        }
      },
    };
    if (apiMap[stackName]) apiMap[stackName]();
  }

  function handleShowHidden() {
    setShowHidden((pre) => !pre);
    setSelectedStates({});
    setDistrictStates({});
    setTehsilStates({});
    setJanpadStates({});
    setGramPanchayatStates({});
    setSelectedGram({});
  }
  function handleActiveDeactivateAddress({ stackName, id, active }) {
    console.log("stackName", stackName);
    console.log("id", id);
    console.log("active", active);

    settings.activeAndDeactivateAddress({
      type: stackName,
      body: {
        id,
        active,
      },
    });
    // handleApiCallback(stackName);
  }

  return (
    <Box sx={{ width: "100%", p: 0 }}>
      <AppBar
        position="static"
        sx={{ backgroundColor: "transparent", boxShadow: "none" }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="settings tabs"
            indicatorColor="secondary"
            textColor="secondary"
            sx={{
              flexGrow: 1,
              // ".css-4dupt5-MuiButtonBase-root-MuiTab-root.Mui-selected": {
              //   color: colors.primary[500],
              // },
              // ".css-1aquho2-MuiTabs-indicator": {
              //   backgroundColor: colors.primary[500],
              // },
            }}
          >
            <Tab icon={<LocationOnIcon />} label="Location Settings" />
            <Tab icon={<LocalHospitalIcon />} label="Hospital Settings" />
            <Tab icon={<ContactMailIcon />} label="Contact Settings" />
            {/* <Tab icon={<CloudUploadIcon />} label="Upload Loactions" /> */}
          </Tabs>
          <Button
            size="large"
            sx={{ color: colors.primary[500] }}
            startIcon={showHidden ? <VisibilityIcon /> : <VisibilityOffIcon />}
            onClick={handleShowHidden}
          >
            {showHidden ? "Show All" : "Show Only Active"}
          </Button>
        </Toolbar>
      </AppBar>

      {value === 0 && (
        <Grid container sx={{ p: 0, px: 1 }}>
          {/* <Grid item lg={2} sx={{ m: 0, p: 0 }}>
            <Stack
              handleSwitchChange={handleActiveDeactivateAddress}
              showHidden={showHidden}
              addDialogText="Create State"
              searchInputLabel="Search state"
              titleWithCount={`State (${states?.length})`}
              stackData={states}
              selectedItem={selectedState}
              handleItemClick={handleStateClick}
              stackName="state"
              apiCallBack={handleApiCallback}
            />
          </Grid> */}
          <Grid item lg={2} sx={{ p: 0 }}>
            <Stack
              handleSwitchChange={handleActiveDeactivateAddress}
              showHidden={showHidden}
              addDialogTitle={`Create District in MP`}
              searchInputLabel="Search District"
              titleWithCount={`District (${district?.length})`}
              stackData={district}
              selectedItem={selectedDistrict}
              handleItemClick={handleDistrictClick}
              stackName="district"
              apiCallBack={handleApiCallback}
            />
          </Grid>
          <Grid item lg={2}>
            <Stack
              handleSwitchChange={handleActiveDeactivateAddress}
              showHidden={showHidden}
              addDialogTitle={`Create Tehsil in ${selectedDistrict.name}`}
              searchInputLabel="Search Tehsil"
              titleWithCount={`Tehsil (${tehsil?.length || 0})`}
              stackData={tehsil}
              selectedItem={selectedTehsil}
              handleItemClick={handleTehsilClick}
              stackName="tehsil"
              preSelectedDetails={selectedDistrict}
              apiCallBack={handleApiCallback}
            />
          </Grid>
          <Grid item lg={2}>
            <Stack
              handleSwitchChange={handleActiveDeactivateAddress}
              showHidden={showHidden}
              addDialogTitle={`Create Janpad Panchayat in ${selectedDistrict.name}`}
              searchInputLabel="Search Janpad Panchayat"
              titleWithCount={`Janpad Panchayat (${janpad?.length || 0})`}
              stackData={janpad}
              selectedItem={selectedJanpad}
              handleItemClick={handleJanpad}
              stackName="janPanchayat"
              preSelectedDetails={selectedDistrict}
              apiCallBack={handleApiCallback}
            />
          </Grid>
          <Grid item lg={2}>
            <Stack
              handleSwitchChange={handleActiveDeactivateAddress}
              showHidden={showHidden}
              addDialogTitle={`Create Gram Panchayat in ${
                selectedTehsil?.name || selectedJanpad?.name
              }`}
              updateDialogText={`Update Gram Panchayat in ${
                selectedTehsil?.name || selectedJanpad?.name
              }`}
              tehsilOption={tehsil}
              searchInputLabel="Search Gram Panchayat"
              titleWithCount={`Gram Panchayat (${gramPanchayat?.length || 0})`}
              stackData={gramPanchayat}
              selectedItem={selectedGramPanchayat}
              handleItemClick={handleGramPClick}
              stackName="gramPanchayat"
              preSelectedDetails={
                isEmpty(selectedJanpad) ? selectedTehsil : selectedJanpad
              }
              apiCallBack={handleApiCallback}
            />
          </Grid>
          <Grid item lg={2}>
            <Stack
              handleSwitchChange={handleActiveDeactivateAddress}
              showHidden={showHidden}
              addDialogTitle={`Create Gram in ${selectedGramPanchayat?.name}`}
              updateDialogText={`Update Gram in ${selectedGramPanchayat?.name}`}
              searchInputLabel="Search Gram"
              titleWithCount={`Gram (${gram?.length || 0})`}
              stackData={gram}
              selectedItem={selectedGram}
              handleItemClick={handleGramClick}
              gramPanchayat={selectedGramPanchayat}
              janPanchayat={selectedJanpad?.name}
              tehsil={
                tehsil?.find((t) => t._id === selectedGramPanchayat?.tehsil) ||
                selectedTehsil ||
                {}
              }
              pincode={selectedGramPanchayat.pincode}
              updatedAdminBy={selectedGramPanchayat.updatedBy || "Admin"}
              sarpanch={{
                name: selectedGramPanchayat?.sarpanch?.name,
                phone: selectedGramPanchayat?.sarpanch?.phone,
              }}
              sachiv={{
                name: selectedGramPanchayat?.sachiv?.name,
                phone: selectedGramPanchayat?.sachiv?.phone,
              }}
              rojgarSahayak={{
                name: selectedGramPanchayat?.rojgar_sahayak?.name,
                phone: selectedGramPanchayat?.rojgar_sahayak?.phone,
              }}
              isVerified={selectedGramPanchayat?.verified}
              apiCallBack={handleApiCallback}
              preSelectedDetails={selectedGramPanchayat}
              stackName="gram"
            />
          </Grid>
        </Grid>
      )}
      <TabPanel value={value} index={1}>
        <HospitalSettings />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <ContactSettings />
      </TabPanel>
      {/* <TabPanel value={value} index={3}>
        <UploadLocation />
      </TabPanel> */}
    </Box>
  );
};

export default SettingsPage;
