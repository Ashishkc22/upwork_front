import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Stack,
  List,
  ListItem,
  ListItemText,
  IconButton,
  ToggleButton,
  Typography,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AddIcon from "@mui/icons-material/Add";
import settings from "../../services/settings";
import Switch from "@mui/material/Switch";
import TextDialog from "./TextDialog";
import Fab from "@mui/material/Fab";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

import { styled } from "@mui/material/styles";

import Divider from "@mui/material/Divider";
import { isEmpty } from "lodash";

const ColoredSwitch = styled(Switch)(({ theme }) => ({
  "& .MuiSwitch-switchBase.Mui-checked": {
    color: "#ff5722",
  },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
    backgroundColor: "#ff5722",
  },
}));

const HospitalSettings = () => {
  const [firstStackItems, setFirstStackItems] = useState([
    {
      name: "Hospital Categories",
      key: "hospital_category",
    },
    {
      name: "Doctor Specialization",
      key: "doctor_specialization",
    },
    {
      name: "Basic Facilities",
      key: "basic_facilities",
    },
    {
      name: "Advance Facilities",
      key: "advance_facilities",
    },
    {
      name: "Hospital Rates",
      key: "hospital_rates",
    },
  ]);

  const [secondStackItems, setSecondStackItems] = useState([]);
  const [selectedSecondStackItems, setSelectedSecondStackItems] = useState([]);
  // State to manage the dialog open/close
  const [dialogOpen, setDialogOpen] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);

  // State to manage the text input value
  const [textValue, setTextValue] = useState("");

  // State to manage the dialog title
  const [addDialogText, setAddDialogText] = useState("Enter Text");
  const [textDialogInUpdatingdetails, setTextDialogInUpdatingdetails] =
    useState({});

  const newListLitemInputText = {
    hospital_category: "Add Hospital Categories",
    doctor_specialization: "Add Doctor Specialization",
    basic_facilities: "Add Basic Facilities",
    advance_facilities: "Add Advance Facilities",
    hospital_rates: "Add Hospital Rates",
  };
  const updateListLitemInputText = {
    hospital_category: "Update Hospital Categories",
    doctor_specialization: "Update Doctor Specialization",
    basic_facilities: "Update Basic Facilities",
    advance_facilities: "Update Advance Facilities",
    hospital_rates: "Update Hospital Rates",
  };

  // Function to open the dialog
  const handleOpenDialog = (isUpdate = false) => {
    if (isUpdate) {
      setAddDialogText(updateListLitemInputText[selectedItem]);
    } else {
      setAddDialogText(newListLitemInputText[selectedItem]);
    }
    setDialogOpen(true);
  };

  // Function to close the dialog
  const handleCloseDialog = () => {
    setTextValue("");
    setTextDialogInUpdatingdetails({});
    setDialogOpen(false);
  };

  // Function to handle text input change
  const handleTextChange = (event) => {
    setTextValue(event);
  };

  const handleAddAction = () => {
    setSelectedSecondStackItems((pre) => {
      const newArray = [...pre];
      if (!isEmpty(textDialogInUpdatingdetails)) {
        newArray[textDialogInUpdatingdetails.index] = {
          active: newArray[textDialogInUpdatingdetails.index].active,
          name: textValue,
        };
      } else {
        newArray.push({
          active: true,
          name: textValue,
        });
      }
      return newArray;
    });

    setTextValue("");
    setTextDialogInUpdatingdetails({});
    handleCloseDialog();
  };

  // Fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await settings.getHospitalAndContactSettings();
        // const response = await axios.get('/api/get-stack-data');
        // const data = response.data;
        let firstStackData = {};
        Object.keys(response).forEach((key) => {
          firstStackData[key] = response[key];
        });
        console.log("response", firstStackData);

        setSelectedItem("hospital_category");
        setSelectedSecondStackItems(firstStackData.hospital_category);
        setSecondStackItems(firstStackData);
      } catch (error) {
        console.error("Error fetching stack data:", error);
      }
    };

    fetchData();
  }, []);

  const handleFirstStackClick = (item) => {
    if (!isEmpty(selectedSecondStackItems)) {
      setSecondStackItems((pre) => {
        return {
          ...pre,
          [selectedItem]: selectedSecondStackItems,
        };
      });
    }
    setSelectedItem(item.key);
    setSelectedSecondStackItems(secondStackItems[item.key]);
  };

  const handleSave = async () => {
    let updatedPayload = {};
    if (!isEmpty(selectedSecondStackItems)) {
      updatedPayload = {
        ...secondStackItems,
        [selectedItem]: selectedSecondStackItems,
      };
    }
    await settings.saveHospitalAndContactSettings({ body: updatedPayload });
  };

  const handleListUpdate = (data, index) => {
    setTextDialogInUpdatingdetails({
      index,
      data,
    });
    handleOpenDialog(true);
  };

  return (
    <Stack direction="row" spacing={4} sx={{ height: "100%" }}>
      {/* First Stack */}
      <Stack
        spacing={2}
        sx={{
          width: {
            lg: "19%",
            md: "30%",
            sm: "50%",
            xs: "50%",
          },
          textAlign: "center",
        }}
      >
        <Typography variant="h5">Fields</Typography>{" "}
        {/* Title for the first stack */}
        <List>
          {firstStackItems.map((item, index) => (
            <ListItem
              key={item.key + index}
              button
              onClick={() => handleFirstStackClick(item)}
              selected={selectedItem === item?.key}
              sx={{
                ...(selectedItem === item?.key && {
                  color: "#ff5722",
                  background: "#fbe9e7 !important",
                }),
                height: "50px",
                borderRadius: "30px",
              }}
            >
              <ListItemText primary={item.name} />
              {selectedItem === item?.key && (
                <IconButton size="xsmall" sx={{ color: "#ff5722" }}>
                  <ArrowForwardIcon />
                </IconButton>
              )}
            </ListItem>
          ))}
        </List>
      </Stack>
      <TextDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        title={addDialogText}
        textValue={textValue}
        onTextChange={handleTextChange}
        onAdd={handleAddAction}
      />
      <Divider orientation="vertical" flexItem />
      {/* Second Stack */}
      {selectedItem !== null && (
        <Stack spacing={2}>
          <Typography variant="h5">Values</Typography>{" "}
          {/* Title for the second stack */}
          <List>
            {selectedSecondStackItems?.map((item, index) => (
              <ListItem
                key={item?.name + index}
                button
                onClick={(e) => {
                  e.stopPropagation();

                  handleListUpdate(item, index);
                }}
                sx={{ borderRadius: "30px" }}
              >
                <ListItemText primary={item.name} />
                <ColoredSwitch
                  checked={item.active}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    e.stopPropagation();
                    setSelectedSecondStackItems((pre) => {
                      const newObject = [...pre];
                      newObject[index].active =
                        !selectedSecondStackItems[index].active;
                      console.log("PRE Updated", newObject);

                      return newObject;
                    });
                  }}
                />
              </ListItem>
            ))}
            <ListItem button onClick={() => handleOpenDialog()}>
              <ListItemText primary="Add new listItem" />
              <IconButton>
                <AddIcon />
              </IconButton>
            </ListItem>
          </List>
        </Stack>
      )}

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
    </Stack>
  );
};

export default HospitalSettings;
