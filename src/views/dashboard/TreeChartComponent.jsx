import { useEffect } from "react";
import { Grid, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import SearchTextinput from "../../components/SearchTextInput";
import React, { useState } from "react";
import TreeMapChart from "./TreeChart";
import CustomDateRangePicker from "../../components/CustomDateRangePicker";
import moment from "moment";
import dashboardService from "../../services/dashboard";

const TreeChartComponent = () => {
  const [filter, setFilter] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [date, setDate] = useState();
  const [treeFilterData, setTreeFilterData] = useState();
  const [treeData, setTreeData] = useState();

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);
  const handleFilterChange = (event) => {
    setFilter(event.target.value);
    if (["CUSTOM", "CUSTOM DATE"]?.includes(event.target.value)) {
      handleOpenDialog();
    }
  };
  const handleApply = (range) => {
    let data = range;
    if (Array.isArray(data)) {
      data = `${moment(data[0].startDate).format("DD/MM/YYYY")}-${moment(
        data[0].endDate
      ).format("DD/MM/YYYY")}`;
    } else {
      data = moment(data).format("DD/MM/YYYY");
    }
    setDate(data);
  };

  useEffect(() => {
    dashboardService.getTreeChartData().then((data) => {
      console.log("setTreeFilterData", data);
      setTreeData(data);
      setTreeFilterData(data);
    });
  }, []);

  return (
    <>
      <Grid container>
        <CustomDateRangePicker
          open={filter === "CUSTOM" && openDialog}
          onClose={handleCloseDialog}
          onApply={handleApply}
        />
        <Grid item xs={4}>
          <SearchTextinput
            onLoadFocus={false}
            value={""}
            setSearchTerm={""}
            emitSearchChange={""}
          />
        </Grid>
        <Grid item xs={2}></Grid>
        <Grid item xs={6} display="flex" justifyContent="end">
          <FormControl sx={{ minWidth: "10rem", m: 2 }}>
            <InputLabel>Date Range</InputLabel>
            <Select
              value={filter}
              onChange={handleFilterChange}
              label="Date Range"
            >
              <MenuItem value="ALL">All</MenuItem>
              <MenuItem value="TODAY">Current Year</MenuItem>
              <MenuItem value="THIS WEEK">Last Year</MenuItem>
              <MenuItem value="CUSTOM" onClick={() => handleOpenDialog()}>
                Custom Date Range
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <TreeMapChart
        data={[
          {
            name: "Vidisha",
            children: [
              { name: "Ganj Basoda", size: 360 },
              { name: "Kurwai", size: 120 },
              { name: "Gyaraspur", size: 363 },
              { name: "Sironj", size: 109 },
              { name: "Aadhaar", size: 111 },
            ],
            size: 500,
          },
          {
            name: "Raisen",
            children: [
              { name: "Begumganj", size: 299 },
              { name: "Raisen", size: 444 },
              { name: "Udaipura", size: 280 },
              { name: "Gairatganj", size: 204 },
              { name: "Silwani", size: 200 },
            ],
            size: 660,
          },
          {
            name: "Agar Malwa",
            children: [{ name: "Tehsil1", size: 222 }],
            size: 222,
          },
        ]}
        width={1400}
        height={550}
      />
    </>
  );
};
export default TreeChartComponent;
