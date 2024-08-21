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
  selectedDetails,
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
    console.log("stackData", stackData);

    if (!isEmpty(stackData)) {
      setStates(stackData);
    }
    if (!isEmpty(stackData) && isEmpty(searchTerm)) {
      setFilteredStates(stackData);
    }
  }, [stackData]);

  const handleFilter = (e) => {
    let value = e.target.value;
    if (value === "") {
      console.log("valuevalue", value);

      setFilteredStates(states);
      setSearchTerm("");
    }
    if (!/^\s*$/.test(value)) {
      clearTimeout(typingTimer);
      setSearchTerm(value);
      typingTimer = setTimeout(function () {
        setFilteredStates(
          states.filter((state) =>
            state.name.toLowerCase().includes(e.target.value.toLowerCase())
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

  const handleAddAction = () => {
    console.log("Text value:", textValue);
    // Implement the logic for the Add action here
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
    return (
      <InputAdornment position="end">
        <IconButton edge="end" onClick={handleOpenDialog}>
          <AddIcon />
        </IconButton>
      </InputAdornment>
    );
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
          maxHeight: "583px",
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
        <List>
          {filteredStates.map((state) => (
            <ListItemButton
              key={state}
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
                secondaryAction={
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
              >
                <ListItemText primary={state.name} />
              </ListItem>
            </ListItemButton>
          ))}
        </List>
      </Stack>
      {!isEmpty(selectedDetails) && (
        <Container maxWidth="md" sx={{ marginTop: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <InfoCard title="Gram Panchayat" value="" />
            </Grid>
            <Grid item xs={12} md={6}>
              <InfoCard title="Jan Panchayat" value="NA" />
            </Grid>
            <Grid item xs={12} md={6}>
              <InfoCard title="Tehsil" value="Tehsil1" />
            </Grid>
            <Grid item xs={12} md={6}>
              <InfoCard title="Pincode" value="9752741" />
            </Grid>
            <Grid item xs={12} md={6}>
              <InfoCard title="Updated Admin By" value="REKHA" />
            </Grid>
            <Grid item xs={12} md={6}>
              <InfoCard title="Sarpanch" value="MAN SINGH" phone="8668266350" />
            </Grid>
            <Grid item xs={12} md={6}>
              <InfoCard title="Sachiv" value="YADAV" phone="8668266350" />
            </Grid>
            <Grid item xs={12} md={6}>
              <InfoCard
                title="Rojgar Sahayak"
                value="SATYANARAYAN YADAV"
                phone="8668266350"
              />
            </Grid>
          </Grid>
          <Divider sx={{ marginY: 4 }} />
          <Grid container justifyContent="center">
            <Button variant="contained" color="primary">
              Verify Now
            </Button>
          </Grid>
        </Container>
      )}
    </Box>
  );
};

export default StateList;
