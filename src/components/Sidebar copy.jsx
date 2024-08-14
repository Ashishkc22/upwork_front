import { useState } from "react";
import { Sidebar as ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
// import "react-pro-sidebar/dist/";
import { tokens } from "../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import SupervisedUserCircleOutlinedIcon from "@mui/icons-material/SupervisedUserCircleOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import cookiesUtil from "../utils/cookies.util";

const Item = ({ title, to, icon, selected, setSelected, nav }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <MenuItem
      active={selected === title}
      style={{
        borderRadius: "30px",
        ...(selected === title && {
          background: colors.red[100],
          color: colors.red[500],
        }),
      }}
      onClick={() => {
        setSelected(title);
        if (nav && title === "Logout") {
          cookiesUtil.clearAllCookies();
        }
        if (nav) {
          nav(to);
        }
      }}
      icon={icon}
    >
      <Typography>{title}</Typography>
    </MenuItem>
  );
};

const Sidebar = () => {
  const nav = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [selected, setSelected] = useState("Dashboard");

  return (
    <Box
      sx={{
        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important",
        },
        "& .pro-menu-item.active": {
          color: "#6870fa !important",
        },
        ".ps-sidebar-container": {
          height: "100vh !important", //to overwrite default css use !important
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed} sx={{ position: "fixed" }}>
        <Menu iconShape="square">
          {/* LOGO AND MENU ICON */}
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              //   color: colors.grey[100],
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Typography
                  variant="h3"
                  // color={colors.grey[100]}
                >
                  {selected}
                </Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Item
              title="Dashboard"
              to="dashboard"
              icon={<HomeOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              nav={nav}
            />

            <Item
              title="Cards"
              to="cards"
              icon={<CreditCardIcon />}
              selected={selected}
              setSelected={setSelected}
              nav={nav}
            />
            <Item
              title="Hospitals"
              to="/hospitals"
              icon={<LocalHospitalIcon />}
              selected={selected}
              setSelected={setSelected}
              nav={nav}
            />
            <Item
              title="Field Executives"
              to="/field_executives"
              icon={<SupervisedUserCircleOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              nav={nav}
            />

            <Item
              title="Settings"
              to="/settings"
              icon={<SettingsOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              nav={nav}
            />
            <Item
              title="Logout"
              to="/"
              icon={<LogoutOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              nav={nav}
            />
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
