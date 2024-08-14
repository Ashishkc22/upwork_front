import React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import TableChartIcon from "@mui/icons-material/TableChart";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Card,
  Container,
  Grid,
  Select,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CustomAutocompleteDropDown from "../../components/CustomAutocompleteDropDown";
import SearchTextinput from "../../components/SearchTextInput";

const headerData = {
  totalCards: 9373,
  toBePrinted: 67,
  createdByOptions: ["FE84115", "FE84116"],
  durationOptions: ["Last 7 days", "Last 30 days", "Last 90 days"],
  dropdownOptions: ["Option 1", "Option 2", "Option 3"],
};

const ScoreCard = ({ value, text, bgcolor }) => {
  return (
    <Card
      elevation={0}
      sx={{ my: 1, background: bgcolor, flexGrow: 1, borderRadius: 3 }}
    >
      <Box sx={{ p: 1 }} textAlign="center">
        <Typography fontSize={25} fontWeight={600}>
          {value}
        </Typography>
        <Typography fontSize={12} fontWeight={500} color="#00000059">
          {text}
        </Typography>
      </Box>
    </Card>
  );
};

const Header = () => {
  const theme = useTheme();
  const isMidScreen = useMediaQuery(theme.breakpoints.up("md"));
  return (
    // <Box sx={{ flexGrow: 1, mt: 1 }}>
    <AppBar
      position="static"
      sx={{ background: "white", boxShadow: "none", p: 0, mx: 0 }}
    >
      <Toolbar>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={6} sm={2} md={2} lg={1}>
            <ScoreCard value={headerData.totalCards} text="Total Cards" />
          </Grid>
          <Divider orientation="vertical" flexItem sx={{ my: 3 }} />
          <Grid item xs={6} sm={2} md={2} lg={1}>
            <ScoreCard
              value={headerData.toBePrinted}
              text="To Be Printed"
              bgcolor="#ffeee8"
            />
          </Grid>
          {isMidScreen && <Grid item xs={2} md={1}></Grid>}
          <Grid
            item
            xs={12}
            sm={12}
            md={12}
            lg={8}
            container
            justifyContent="flex-end"
            spacing={2}
          >
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <SearchTextinput />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <CustomAutocompleteDropDown
                options={headerData.dropdownOptions.map((option) => ({
                  label: option,
                  code: option,
                }))}
                label="State"
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <CustomAutocompleteDropDown
                options={headerData.createdByOptions.map((option) => ({
                  label: option,
                  code: option,
                }))}
                label="Created By"
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <FormControl variant="standard" fullWidth>
                <InputLabel id="duration-select-label">Duration</InputLabel>
                <Select
                  labelId="duration-select-label"
                  id="duration-select"
                  value=""
                  onChange={() => {}}
                >
                  {headerData.durationOptions.map((option, index) => (
                    <MenuItem key={index} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={3} sm={2} md={1} container justifyContent="flex-end">
              <IconButton onClick={() => {}} color="primary" aria-label="table">
                <TableChartIcon />
              </IconButton>
            </Grid>
            <Grid item xs={3} sm={2} md={1} container justifyContent="flex-end">
              <IconButton
                onClick={() => {}}
                color="primary"
                aria-label="refresh"
              >
                <RefreshIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
    // </Box>
  );
};

export default Header;
