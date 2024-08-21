// src/components/ThreeDotsDynamicMenu.js
import React, { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Home as HomeIcon,
  Info as InfoIcon,
  ContactMail as ContactIcon,
} from "@mui/icons-material";

const ThreeDotsDynamicMenu = ({ row, handleMenuSelect }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const menuItems = [
    {
      key: "SUBMITTED",
      label: "SUBMITTED",
      icon: "SUBMITTED",
      onClick: () => console.log("Home clicked"),
    },
    {
      key: "PRINTED",
      label: "PRINTED",
      icon: "PRINTED",
      onClick: () => console.log("About clicked"),
    },
    {
      key: "UNDELIVERED",
      label: "UNDELIVERED",
      icon: "UNDELIVERED",
      onClick: () => console.log("Contact clicked"),
    },
    {
      key: "DELIVERED",
      label: "DELIVERED",
      icon: "DELIVERED",
      onClick: () => console.log("Contact clicked"),
    },
    {
      key: "DISCARDED",
      label: "DISCARDED",
      icon: "DISCARDED",
      onClick: () => console.log("Contact clicked"),
    },
    {
      key: "RTO",
      label: "RTO",
      icon: "RTO",
      onClick: () => console.log("Contact clicked"),
    },
    {
      key: "REPRINT",
      label: "REPRINT",
      icon: "REPRINT",
      onClick: () => console.log("Contact clicked"),
    },
  ];

  // Handle click event to open the menu
  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  // Handle close event to close the menu
  const handleClose = (event) => {
    event?.stopPropagation();
    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton
        edge="end"
        color="inherit"
        aria-label="more"
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{ style: { maxHeight: 300, width: "200px" } }}
      >
        {menuItems.map((item) => (
          <MenuItem
            key={item.key}
            onClick={(event) => {
              event.stopPropagation();
              handleMenuSelect(item.key, row);
              //   item.onClick();
              handleClose();
            }}
          >
            <ListItemText value={item.label} primary={item.label} />
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export default ThreeDotsDynamicMenu;
