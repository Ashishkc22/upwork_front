import React, { useState, useRef } from "react";
import {
  Box,
  Stack,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  InputAdornment,
  ListItemButton,
  Container,
  Grid,
  CircularProgress,
  Backdrop,
  Typography,
  Divider,
  Link,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import TextDialog from "./TextDialog";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { isEmpty } from "lodash";
import { useEffect } from "react";
import settings from "../../services/settings";
import Switch from "@mui/material/Switch";
import { styled } from "@mui/material/styles";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import commonService from "../../services/common";
import { read, utils } from "xlsx";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const ColoredSwitch = styled(Switch)(({ theme }) => ({
  "& .MuiSwitch-switchBase.Mui-checked": {
    color: "#ff5722",
  },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
    backgroundColor: "#ff5722",
  },
}));

let typingTimer;
let timeoutInstance;
const InfoCard = ({ title, value, phone }) => (
  <Grid container>
    <Grid
      item
      xs={12}
      style={{
        fontWeight: "bold",
        fontSize: "10px",
      }}
    >
      {title}:
    </Grid>

    {phone ? (
      <Grid
        item
        xs={12}
        style={{
          textOverflow: "ellipsis",
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        <Grid
          item
          xs={12}
          style={{
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
            fontSize: "10px",
          }}
        >
          {value}
        </Grid>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography
            variant="body1"
            fontSize="10px"
            fontWeight={500}
            gutterBottom
          >
            {phone}
          </Typography>

          <WhatsAppIcon
            sx={{
              color: "#23e223",
              fontSize: "15px",
              mx: 2,
              ":hover": {
                cursor: "pointer",
              },
            }}
            onClick={() => window.open(`https://wa.me/+91${phone}`)}
          />
        </Box>
      </Grid>
    ) : (
      <Grid
        item
        xs={12}
        style={{
          textOverflow: "ellipsis",
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </Grid>
    )}
  </Grid>
);

const StateList = ({
  addDialogText,
  selectedItem,
  searchInputLabel,
  titleWithCount,
  stackData,
  handleItemClick,
  gramPanchayat,
  janPanchayat,
  tehsil,
  pincode,
  updatedAdminBy,
  sarpanch,
  sachiv,
  rojgarSahayak,
  isVerified,
  apiCallBack = () => {},
  stackName,
  preSelectedDetails,
  districtDetails,
  addDialogTitle,
  showHidden,
  handleSwitchChange,
  updateDialogText = "",
  tehsilOption,
}) => {
  const [states, setStates] = useState([]);
  const [filteredStates, setFilteredStates] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [newState, setNewState] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [dialogMode, setDialogMode] = useState("add");
  const [isBackDropOpen, setIsBackDropOpen] = useState(false);
  const fileRef = useRef(null);

  const handleAddState = () => {
    if (newState && !states.includes(newState)) {
      setStates([...states, newState]);
      setNewState("");
    }
  };

  const handleDeleteState = (stateToDelete) => {
    setStates(states.filter((state) => state !== stateToDelete));
  };

  useEffect(() => {
    if (!isEmpty(stackData)) {
      setStates(stackData);
    }
    if (isEmpty(stackData)) {
      setStates([]);
      setFilteredStates([]);
    }
    if (!isEmpty(stackData) && isEmpty(searchTerm)) {
      setFilteredStates(stackData);
    }
  }, [stackData]);

  const handleFilter = (e) => {
    let value = e?.target?.value;
    console.log("valuevalue", value);
    if (value === "") {
      setFilteredStates(states);
      setSearchTerm("");
    }
    if (!/^\s*$/.test(value)) {
      clearTimeout(typingTimer);
      setSearchTerm(value);
      typingTimer = setTimeout(function () {
        setFilteredStates(
          states.filter(
            (state) =>
              state?.name &&
              state.name.toLowerCase().includes(e?.target?.value?.toLowerCase())
          )
        );
      }, 1500);
    }
  };

  /*
Text Dialog  logic
*/

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({});

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleAddAction = async () => {
    const keyMap = {
      district: "stateId",
      tehsil: "districtId",
      janPanchayat: "districtId",
      gramPanchayat: "janPanchayatId",
      gram: "gramPanchayatId",
    };
    console.log("dialogMode", dialogMode);

    if (dialogMode === "add") {
      // Implement the logic for the Add action here
      await settings.addAddressType({
        type: stackName,
        body: {
          ...(!isEmpty(preSelectedDetails) && {
            [keyMap[stackName]]: preSelectedDetails._id,
          }),
          name: formData.name,
          active: true,
        },
      });
    } else {
      const payload = {
        name: formData.name,
        ...(formData.pincode && { pincode: formData.pincode }),
        ...(formData.tehsil && { tehsil: formData.tehsil }),
        ...(formData.map_link && { map_link: formData.map_link }),
      };
      if (formData.rojgarSahayak) {
        payload.rojgar_sahayak = {
          name: formData.rojgarSahayak,
        };
      }
      if (formData.rojgarSahayakPhone) {
        if (!payload.rojgar_sahayak) {
          payload.rojgar_sahayak = { phone: formData.rojgarSahayakPhone };
        } else {
          payload.rojgar_sahayak.phone = formData.rojgarSahayakPhone;
        }
      }
      if (formData.sachiv) {
        payload.sachiv = {
          name: formData.rojgarSahayak,
        };
      }
      if (formData.sachivPhone) {
        if (!payload.sachiv) {
          payload.sachiv = { phone: formData.sachivPhone };
        } else {
          payload.sachiv.phone = formData.sachivPhone;
        }
      }

      if (formData.sarpanch) {
        payload.sarpanch = {
          name: formData.sarpanch,
        };
      }
      if (formData.sarpanchPhone) {
        if (!payload.sarpanch) {
          payload.sarpanch = { phone: formData.sarpanchPhone };
        } else {
          payload.sarpanch.phone = formData.sarpanchPhone;
        }
      }

      await settings.updateLocation({
        type: stackName,
        body: {
          id: formData.id,
          ...(!isEmpty(preSelectedDetails) && {
            [keyMap[stackName]]: preSelectedDetails._id,
          }),
          ...payload,
          active: true,
        },
      });
    }

    apiCallBack(stackName);
    handleCloseDialog(); // Optionally close the dialog after adding
  };

  const handleTextChange = (value, name) => {
    setFormData((p) => {
      const t = { ...p };
      t[name] = value;
      return t;
    });
  };

  const getSearchIcons = () => {
    if (isSearchFocused) {
      return (
        <InputAdornment position="end">
          <IconButton
            edge="end"
            onClick={() => {
              setSearchTerm("");
              setFilteredStates(states);
              setIsSearchFocused(false);
            }}
          >
            <CloseIcon />
          </IconButton>
        </InputAdornment>
      );
    }

    let isButtonDisable = false;

    if (isEmpty(preSelectedDetails)) isButtonDisable = true;

    if (stackName === "state" || stackName === "district")
      isButtonDisable = false;

    return (
      <InputAdornment position="end">
        <IconButton
          edge="end"
          onClick={handleOpenDialog}
          disabled={isButtonDisable}
        >
          <AddIcon />
        </IconButton>
      </InputAdornment>
    );
  };

  const handleGramVerify = async () => {
    // call -- settings
    await settings.varifyGramPanchayat({
      id: gramPanchayat._id,
      verified: true,
    });
    apiCallBack("district");
    apiCallBack(stackName);
  };

  const arrangeExcelData = (data) => {
    const formatedData = [];
    let districtIndex = -1;
    let janpadIndex = 0;
    let gramPanchayatIndex = 0;
    let gramIndex = 0;
    for (let i = 0; i < data.length; i++) {
      const index = i;
      const row = data[index];
      let obj = {
        janpadPanchyat: [],
        gramPanchayat: [],
        gram: [],
      };
      if (!row?.District) {
        console.log("Incorrect data");
        // enqueueSnackbar("Incorrect Data.", {
        //   variant: "error",
        //   autoHideDuration: 2000,
        // });
        return;
      }

      if (
        row.District &&
        formatedData?.[districtIndex]?.district != row.District
      ) {
        obj = {
          district: row?.District || "",
          janpadPanchyat: [],
        };
        // formatedData.push();
        districtIndex += 1;
        janpadIndex = -1;
        gramPanchayatIndex = -1;
        gramIndex = -1;
      } else {
        obj = formatedData[districtIndex];
      }
      if (
        row["Janpad Panchayat"] &&
        formatedData?.[districtIndex]?.janpadPanchyat?.[janpadIndex].name !=
          row["Janpad Panchayat"]
      ) {
        obj.janpadPanchyat.push({
          name: row["Janpad Panchayat"],
        });
        janpadIndex += 1;
      }
      if (row["Gram Panchayat"]) {
        if (!obj.janpadPanchyat[janpadIndex]?.gramPanchayat)
          obj.janpadPanchyat[janpadIndex].gramPanchayat = [];
        obj.janpadPanchyat[janpadIndex].gramPanchayat.push({
          name: row["Gram Panchayat"],
          rojgar_sahayak: {
            name: row["Rojgar Sahayak"],
            phone: row["Mob No._2"],
          },
          sachiv: {
            name: row.Sachiv,
            phone: row["Mob No._1"],
          },
          sarpanch: { name: row.Sarpanch, phone: row["Mob No."] },
          pincode: "",
        });
        gramPanchayatIndex += 1;
      }
      if (row.Gram) {
        if (
          !obj.janpadPanchyat[janpadIndex]?.gramPanchayat[gramPanchayatIndex]
            ?.gram
        )
          obj.janpadPanchyat[janpadIndex].gramPanchayat[
            gramPanchayatIndex
          ].gram = [];
        obj.janpadPanchyat[janpadIndex].gramPanchayat[
          gramPanchayatIndex
        ].gram.push({
          name: row.Gram,
        });
        gramIndex += 1;
      }
      formatedData[districtIndex] = obj;
    }
    console.log("formatedData", formatedData);
    return formatedData;
  };

  const handleFileUpload = async (e) => {
    setIsBackDropOpen(true);
    const file = e.target?.files?.[0];
    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = async function (e) {
        const fileBuffer = e.target.result;
        const wb = read(fileBuffer);
        const ws = wb.Sheets[wb.SheetNames[0]];
        const fileJSONData = utils.sheet_to_json(ws);
        const formatedData = arrangeExcelData(fileJSONData);
        await commonService.uploadLocation(formatedData, {
          skip: ["district"],
        });
        fileRef.current.value = "";
        apiCallBack(stackName);
        setIsBackDropOpen(false);
      };
      fileReader.onerror = () => {
        setIsBackDropOpen(false);
      };
      fileReader.readAsArrayBuffer(file);
    } else {
      setIsBackDropOpen(false);
    }
  };

  return (
    <Box sx={{ position: "relative" }}>
      <TextField
        //   label={searchInputLabel}
        variant="standard"
        fullWidth
        placeholder={!isSearchFocused ? titleWithCount : searchInputLabel}
        onFocus={() => setIsSearchFocused(true)}
        onBlur={() => {
          setTimeout(() => {
            setIsSearchFocused(false);
          }, 100);
        }}
        margin="normal"
        value={searchTerm}
        InputProps={{
          endAdornment: getSearchIcons(),
          startAdornment: (
            <InputAdornment position="start">
              <IconButton edge="end">
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        onChange={(e) => handleFilter(e)}
      />
      <Stack
        sx={{
          height: stackName === "gram" ? "25vh" : "calc(100vh - 152px)",
          // height:
          //   window.visualViewport.height - window.visualViewport.height * 0.25,
          overflow: "scroll",
          overflowX: "hidden",
          "::-webkit-scrollbar": {
            width: "3px",
          },
          "::-webkit-scrollbar-track": {
            borderRadius: "20px",
          },
        }}
      >
        <Backdrop
          sx={(theme) => ({
            color: "#fff",
            zIndex: theme.zIndex.drawer + 1,
            height: stackName === "gram" ? "26vh" : "calc(100vh - 73px)",
            position: "absolute",
            width: "100%",
          })}
          open={isBackDropOpen}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <TextDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          title={addDialogTitle}
          updateTitle={updateDialogText}
          formData={formData}
          onTextChange={handleTextChange}
          onAdd={handleAddAction}
          stackName={stackName}
          tehsilOptions={tehsilOption}
          mode={dialogMode}
          setDialogMode={setDialogMode}
          setFormData={setFormData}
        />

        {(!isEmpty(preSelectedDetails) || stackName === "district") && (
          <List>
            {filteredStates.map((state, index) => (
              <ListItemButton
                key={state?._id + index + searchInputLabel}
                sx={{
                  borderRadius: "30px",
                  ...(selectedItem._id === state._id && {
                    background: "#fbe9e7",
                  }),
                }}
                onClick={() => {
                  if (selectedItem._id != state._id) {
                    timeoutInstance = setTimeout(() => {
                      handleItemClick(state);
                    }, 100);
                  }
                }}
                onDoubleClick={() => {
                  console.log("double click");
                  clearTimeout(timeoutInstance);
                  setFormData({
                    id: state._id,
                    name: state.name,
                    sarpanch: state?.sarpanch?.name,
                    sarpanchPhone: state?.sarpanch?.phone,
                    sachiv: state.sachiv?.name,
                    sachivPhone: state.sachiv?.phone,
                    rojgarSahayak: state.rojgar_sahayak?.name,
                    rojgarSahayakPhone: state.rojgar_sahayak?.phone,
                    pincode: state?.pincode,
                    tehsil: state?.tehsil,
                    map_link: state?.map_link,
                  });
                  setDialogMode("edit");
                  setDialogOpen(true);
                }}
              >
                <ListItem
                  sx={{
                    m: 0,
                    p: 0,
                    ...(selectedItem._id === state._id && {
                      color: "#ff5722",
                    }),
                  }}
                >
                  <ListItemText primary={state.name} s />
                  {showHidden && (
                    <ColoredSwitch
                      checked={state?.active || false}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSwitchChange({
                          stackName,
                          id: state._id,
                          active: !state.active,
                        });
                        setFilteredStates((pre) => {
                          const newObject = [...pre];
                          newObject[index].active = !pre[index].active;
                          return newObject;
                        });
                      }}
                    />
                  )}

                  {stackName !== "gram" ? (
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      sx={{
                        ...(selectedItem._id === state._id && {
                          color: "#ff5722",
                        }),
                      }}
                      onClick={() => handleDeleteState(state)}
                    >
                      <ArrowForwardIcon />
                    </IconButton>
                  ) : (
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      disabled={!state?.map_link}
                      sx={{
                        color: "blue",
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        console.log("map_link", state);
                        let link = `https://${state.map_link}`;
                        if (state?.map_link?.includes("https://")) {
                          link = state.map_link;
                        }
                        window.open(link, "_blank");
                      }}
                    >
                      <LocationOnIcon />
                    </IconButton>
                  )}
                </ListItem>
              </ListItemButton>
            ))}
          </List>
        )}
      </Stack>
      {!isEmpty(preSelectedDetails) &&
        stackName === "janPanchayat" &&
        fileRef && (
          <Box
            sx={{
              position: "sticky",
              bottom: 0,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Button
              onClick={() => {
                fileRef.current.click();
              }}
            >
              Upload File
            </Button>
            <input
              type="file"
              hidden
              ref={fileRef}
              accept=".xlsx"
              onChange={handleFileUpload}
            />
          </Box>
        )}
      {/* </Box> */}
      {!isEmpty(gramPanchayat) && (
        <Container sx={{ py: 1 }}>
          <Grid container rowGap={1}>
            {!isEmpty(gramPanchayat) && (
              <Grid item xs={12}>
                <InfoCard title="Gram Panchayat" value={gramPanchayat.name} />
              </Grid>
            )}
            {!isEmpty(janPanchayat) && (
              <Grid item xs={12}>
                <InfoCard title="Jan Panchayat" value={janPanchayat} />
              </Grid>
            )}
            {!isEmpty(tehsil?.name) && (
              <Grid item xs={12}>
                <InfoCard title="Tehsil" value={tehsil?.name} />
              </Grid>
            )}
            {!isEmpty(pincode) && (
              <Grid item xs={12}>
                <InfoCard title="Pincode" value={pincode} />
              </Grid>
            )}
            {!isEmpty(updatedAdminBy) && (
              <Grid item xs={12}>
                <InfoCard title="Updated Admin By" value={updatedAdminBy} />
              </Grid>
            )}
            {!isEmpty(sarpanch?.name) && (
              <Grid item xs={12}>
                <InfoCard
                  title="Sarpanch"
                  value={sarpanch.name}
                  phone={sarpanch.phone}
                />
              </Grid>
            )}
            {!isEmpty(sachiv?.name) && (
              <Grid item xs={12}>
                <InfoCard
                  title="Sachiv"
                  value={sachiv.name}
                  phone={sachiv.phone}
                />
              </Grid>
            )}
            {!isEmpty(rojgarSahayak.name) && (
              <Grid item xs={12}>
                <InfoCard
                  title="Rojgar Sahayak"
                  value={rojgarSahayak.name}
                  phone={rojgarSahayak.phone}
                />
              </Grid>
            )}
            <Divider sx={{ marginY: 4 }} />
            <Grid item xs={12}>
              <Button
                variant="contained"
                disabled={isVerified}
                sx={{
                  background: "#4caf50",
                  ":hover": { background: "#016c06" },
                }}
                onClick={handleGramVerify}
              >
                {isVerified ? "Verified" : "Verify Now"}
              </Button>
            </Grid>
          </Grid>
        </Container>
      )}
    </Box>
  );
};

export default StateList;
