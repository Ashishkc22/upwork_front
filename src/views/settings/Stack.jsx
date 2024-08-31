import React, { useState } from "react";
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
  Card,
  CardContent,
  Typography,
  Divider,
  Link,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import TextDialog from "./TextDialog";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { isEmpty } from "lodash";
import { useEffect } from "react";
import settings from "../../services/settings";
import Switch from "@mui/material/Switch";
import { styled } from "@mui/material/styles";

const ColoredSwitch = styled(Switch)(({ theme }) => ({
  "& .MuiSwitch-switchBase.Mui-checked": {
    color: "#ff5722",
  },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
    backgroundColor: "#ff5722",
  },
}));

let typingTimer;

const InfoCard = ({ title, value, phone }) => (
  <Grid container>
    <Grid
      item
      xs={12}
      style={{
        fontWeight: "bold",
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
          }}
        >
          {value}
        </Grid>
        <Link
          onClick={() => window.open(`https://wa.me/${phone}`)}
          underline="none"
        >
          <Box mb={1}>
            <Typography
              variant="h6"
              fontSize="12px"
              fontWeight={600}
              gutterBottom
            >
              {phone}
            </Typography>
          </Box>
        </Link>
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
  showHidden,
  handleSwitchChange,
}) => {
  const [states, setStates] = useState([]);
  const [filteredStates, setFilteredStates] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [newState, setNewState] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

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
  const [textValue, setTextValue] = useState("");

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleAddAction = async () => {
    console.log("Text value:", textValue);
    // Implement the logic for the Add action here
    const keyMap = {
      district: "stateId",
      tehsil: "districtId",
      janPanchayat: "districtId",
      gramPanchayat: "janPanchayatId",
      gram: "gramPanchayatId",
    };
    await settings.addAddressType({
      type: stackName,
      body: {
        ...(!isEmpty(preSelectedDetails) && {
          [keyMap[stackName]]: preSelectedDetails._id,
        }),
        name: textValue,
        active: true,
      },
    });

    apiCallBack(stackName);
    handleCloseDialog(); // Optionally close the dialog after adding
  };

  const handleTextChange = (value) => {
    setTextValue(value);
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

    if (stackName === "state") isButtonDisable = false;

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
    apiCallBack(stackName);
  };

  return (
    <Box>
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
          width: "100%",
          maxWidth: 360,
          maxHeight: "550px",
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
        <TextDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          title={addDialogText}
          textValue={textValue}
          onTextChange={handleTextChange}
          onAdd={handleAddAction}
        />
        {(!isEmpty(preSelectedDetails) || stackName === "state") && (
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
                onClick={() => handleItemClick(state)}
              >
                <ListItem
                  sx={{
                    m: 0,
                    p: 0,
                    ...(selectedItem._id === state._id && { color: "#ff5722" }),
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
                  {
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
                  }
                </ListItem>
              </ListItemButton>
            ))}
          </List>
        )}
      </Stack>

      {!isEmpty(gramPanchayat) && (
        <Container maxWidth="md" sx={{ marginTop: 4 }} justifyContent="center">
          <Grid container spacing={2}>
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
