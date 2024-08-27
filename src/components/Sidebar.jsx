import React, { useEffect, useState } from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import cookiesUtil from "../utils/cookies.util";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import { Outlet, useLocation } from "react-router-dom";
import { tokens } from "../theme";
import { useNavigate } from "react-router-dom";
import storageUtil from "../utils/storage.util";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import SupervisedUserCircleOutlinedIcon from "@mui/icons-material/SupervisedUserCircleOutlined";
import { isEmpty } from "lodash";

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

const Item = ({
  title,
  to,
  icon,
  isSelected,
  setSelected,
  nav,
  isDrawerOpen,
  params,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <ListItemButton
      active={isSelected}
      sx={{
        minHeight: 50,
        // px: 2.5,
        borderRadius: 30,
        ...(isSelected && {
          background: colors.red[100],
          ":hover": {
            background: colors.red[200],
          },
        }),
      }}
      onClick={() => {
        setSelected(title);
        if (nav && title === "Logout") {
          cookiesUtil.clearAllCookies();
        }
        if (nav) {
          let path = to;
          if (!isEmpty(params)) {
            const _params = new URLSearchParams(params);
            path = `${to}?${_params.toString()}`;
          }
          nav(path);
        }
      }}
      icon={icon}
    >
      <ListItemIcon
        sx={{ color: isSelected ? colors.red[500] : colors.black[900] }}
      >
        {icon}
      </ListItemIcon>
      {isDrawerOpen && <Typography>{title}</Typography>}
    </ListItemButton>
  );
};

const navList = [
  { title: "Dashboard", icon: <HomeOutlinedIcon />, path: "dashboard" },
  {
    title: "Cards",
    icon: <CreditCardIcon />,
    path: "cards",
    params: {
      tab: "toBePrinted",
    },
  },
  {
    title: "Hospitals",
    icon: <LocalHospitalIcon />,
    path: "hospitals",
    params: {
      status: "ENABLE",
    },
  },
  {
    title: "Field Executives",
    icon: <SupervisedUserCircleOutlinedIcon />,
    path: "field-executives",
  },
  { title: "Settings", icon: <SettingsOutlinedIcon />, path: "settings" },
  { title: "Logout", icon: <LogoutOutlinedIcon />, path: "/" },
];

export default function MiniDrawer() {
  const nav = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [selected, setSelected] = useState("Dashboard");
  const [open, setOpen] = React.useState(false);

  const location = useLocation();
  const currentPath = location.pathname;

  const handleDrawerOpen = () => {
    setOpen(!open);
  };

  useEffect(() => {
    if (!location.pathname.includes("/cards")) {
      console.log("Changing the page");
      storageUtil.removeItem("/cards-totalCards");
      storageUtil.removeItem("/cards-toBePrinted");
    }
  }, [location.pathname]);

  return (
    <Box sx={{ display: "flex", flexGrow: 1 }}>
      <CssBaseline />
      <Drawer variant="permanent" open={open}>
        <DrawerHeader sx={{ ...(open && { justifyContent: "space-between" }) }}>
          {open && (
            <Typography variant="h4" fontWeight={600}>
              {selected}
            </Typography>
          )}
          <IconButton color="inherit" onClick={handleDrawerOpen}>
            {!open ? <MenuIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {navList.map((data, index) => (
            <ListItem
              key={data.path}
              disablePadding
              sx={{
                display: "block",
                justifyContent: "center",
                ml: 1,
                my: 1,
                width: open ? "200px" : "50px",
              }}
            >
              <Item
                title={data.title}
                to={data.path}
                icon={data.icon}
                isSelected={Boolean(currentPath.startsWith(`/${data.path}`))}
                setSelected={setSelected}
                nav={nav}
                params={data?.params}
                isDrawerOpen={open}
              />
            </ListItem>
          ))}
        </List>
      </Drawer>
      {/* <DrawerHeader /> */}
      <Outlet />
    </Box>
  );
}
