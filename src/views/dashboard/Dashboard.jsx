import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Tab,
  Tabs,
  AppBar,
  Toolbar,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import dashboard from "../../services/dashboard";
import CustomDateRangePicker from "../../components/CustomDateRangePicker";
import CustomDatePicker from "../../components/CustomDatePicker";
import moment from "moment";
import { isEmpty } from "lodash";
import DashboardCard from "./StatsCard";
import PreDashboardCard from "./StatsCardWithPreviousData";
import getCardStack from "../../components/ChipStack";
import { useNavigate } from "react-router-dom";
import ImageComponent from "../../components/ImageComponent";
import CardViewer from "../../components/cardViewer";
import LoadingScreen from "../../components/LoadingScreen";
import TreeChartComponent from "./TreeChartComponent";
import TreeMapChart from "./TreeChart";
import SearchTextinput from "../../components/SearchTextInput";

const defaultPercentages = {
  unverifiedUsersPercentage: 0.0,
  activeUsersPercentage: 0.0,
  inactiveUsersPercentage: 0.0,
  suspendedUsersPercentage: 0.0,
  rejectedUsersPercentage: 0.0,
  totalUsersCombinedPercentage: 0.0,
  totalCardsPercentage: 0.0,
  availableToPrintPercentage: 0.0,
  printedPercentage: 0.0,
  deliveredCardsPercentage: 0.0,
  undeliveredCardsPercentage: 0.0,
  discardCardsPercentage: 0.0,
  totalHospitalPercentage: 0.0,
  hospitalsPercentage: 0.0,
  medicalsPercentage: 0.0,
  diagnosticCentersPercentage: 0.0,
};

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
      {value === index && <Box sx={{ px: 1 }}>{children}</Box>}
    </div>
  );
};

const Dashboard = () => {
  const [filter, setFilter] = useState("");
  const [date, setDate] = useState();
  const [openDialog, setOpenDialog] = useState(false);
  const [dashboardData, setDashboardData] = useState({});
  const [cardPercentage, setCardPercentage] = useState(defaultPercentages);
  const [isScreenLoading, setIsSreenLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const nav = useNavigate();

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
    if (["CUSTOM", "CUSTOM DATE"]?.includes(event.target.value)) {
      handleOpenDialog();
    }
  };

  // Get dashboard data
  const getDashboardData = () => {
    setIsSreenLoading(true);
    let data = {
      duration: filter,
    };
    if (filter === "CUSTOM DATE") {
      data = {
        duration: moment(date).valueOf(),
        till_duration: moment().valueOf(),
      };
    }
    if (filter === "CUSTOM") {
      data = {
        duration: moment(date?.split("-")?.[0], "DD/MM/YYYY")
          .startOf("day")
          .valueOf(),
        till_duration: moment(date?.split("-")?.[1], "DD/MM/YYYY")
          .endOf("day")
          .valueOf(),
      };
    }

    dashboard.getDashboardData(data).then((data) => {
      if (data?.error) {
      } else {
        setDashboardData(data);
        setTimeout(() => {
          setIsSreenLoading(false);
        }, 50);
      }
    });

    // setDashboardData({
    //   total_users: 142,
    //   un_verified_users: 2,
    //   verified_users: 12,
    //   active_users: 1,
    //   inactive_users: 11,
    //   suspended_users: 107,
    //   rejected_users: 14,

    //   total_cards: 9373,
    //   available_to_print: 67,
    //   printed: 8502,
    //   undelivered_cards: 166,
    //   delivered_cards: 323,
    //   discard_cards: 315,
    //   total_hospital: 31,
    //   hospitals: 18,
    //   diagnostic_centers: 1,
    //   medicals: 11,
    // });
  };

  function calculatePercentages() {
    if (!isEmpty(dashboard)) {
      function getPercentage(count, total) {
        return (
          ((parseInt(count) || 0) / Math.max(1, parseInt(total) || 0)) *
          100
        ).toFixed(2);
      }

      function getTotalUsersPercentage(data) {
        const totalUsersCount =
          (parseInt(data?.un_verified_users) || 0) +
          (parseInt(data?.active_users) || 0) +
          (parseInt(data?.inactive_users) || 0) +
          (parseInt(data?.suspended_users) || 0) +
          (parseInt(data?.rejected_users) || 0);

        return getPercentage(totalUsersCount, data?.total_users);
      }

      setCardPercentage({
        totalUsersCombinedPercentage: getTotalUsersPercentage(dashboardData),
        unverifiedUsersPercentage: getPercentage(
          dashboardData?.un_verified_users || 0,
          dashboardData?.total_users || 0
        ),
        activeUsersPercentage: getPercentage(
          dashboardData?.active_users || 0,
          dashboardData?.total_users || 0
        ),
        inactiveUsersPercentage: getPercentage(
          dashboardData?.inactive_users || 0,
          dashboardData?.total_users || 0
        ),
        suspendedUsersPercentage: getPercentage(
          dashboardData?.suspended_users || 0,
          dashboardData?.total_users || 0
        ),
        rejectedUsersPercentage: getPercentage(
          dashboardData?.rejected_users || 0,
          dashboardData?.total_users || 0
        ),
        totalCardsPercentage: getPercentage(
          (parseInt(dashboardData?.available_to_print) || 0) +
            (parseInt(dashboardData?.printed) || 0) +
            (parseInt(dashboardData?.delivered_cards) || 0) +
            (parseInt(dashboardData?.undelivered_cards) || 0) +
            (parseInt(dashboardData?.discard_cards) || 0),
          dashboardData?.total_cards || 0
        ),
        availableToPrintPercentage: getPercentage(
          dashboardData?.available_to_print || 0,
          dashboardData?.total_cards || 0
        ),
        printedPercentage: getPercentage(
          dashboardData?.printed || 0,
          dashboardData?.total_cards || 0
        ),
        deliveredCardsPercentage: getPercentage(
          dashboardData?.delivered_cards || 0,
          dashboardData?.total_cards || 0
        ),
        undeliveredCardsPercentage: getPercentage(
          dashboardData?.undelivered_cards || 0,
          dashboardData?.total_cards || 0
        ),
        discardCardsPercentage: getPercentage(
          dashboardData?.discard_cards || 0,
          dashboardData?.total_cards || 0
        ),
        totalHospitalPercentage: getPercentage(
          (parseInt(dashboardData?.hospitals || 0) || 0) +
            (parseInt(dashboardData?.medicals || 0) || 0) +
            (parseInt(dashboardData?.diagnostic_centers || 0) || 0),
          dashboardData?.total_hospital || 0
        ),
        hospitalsPercentage: getPercentage(
          dashboardData?.hospitals || 0,
          dashboardData?.total_hospital || 0
        ),
        medicalsPercentage: getPercentage(
          dashboardData?.medicals || 0,
          dashboardData?.total_hospital || 0
        ),
        diagnosticCentersPercentage: getPercentage(
          dashboardData?.diagnostic_centers || 0,
          dashboardData?.total_hospital || 0
        ),
      });
    } else {
      setCardPercentage(defaultPercentages);
    }
  }

  useEffect(() => {
    if ((filter === "CUSTOM" || filter === "CUSTOM DATE") && !date) {
      return;
    } else {
      getDashboardData();
    }
  }, [filter, date]);

  useEffect(() => {
    calculatePercentages();
  }, [dashboardData]);

  const handleRefresh = () => {
    // Logic to refresh data goes here
    getDashboardData();
  };

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

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
  const handleChange = (event, newValue) => {
    console.log("newValue", newValue);

    setSelectedTab(newValue);
  };

  const todayScore = 80;
  const todayPercentage = 12.5;
  const yesterdayScore = 75;
  const yesterdayPercentage = 10.0;
  return (
    <Box
      sx={{ width: "100%", m: 1 }}
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      {/* <AppBar
        position="static"
        sx={{ backgroundColor: "transparent", boxShadow: "none" }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Tabs
            value={selectedTab}
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
            <Tab label="Cards" />
            <Tab label="Location Analytics" />
            <Tab icon={<CloudUploadIcon />} label="Upload Loactions" /> 
          </Tabs>
        </Toolbar>
      </AppBar> */}

      {/* <TabPanel value={selectedTab} index={0}> */}
      {isScreenLoading ? (
        <LoadingScreen />
      ) : (
        <Container maxWidth={false} sx={{ padding: 0 }} disableGutters>
          {/* <ImageComponent
        url={
          "https://storage.googleapis.com/download/storage/v1/b/arogyam-super.appspot.com/o/1720941908699.png?generation=1720941911109063&alt=media"
        }
      /> */}
          {/* <CardViewer
        cardId={"66937e7e6c40d43cd5381b6e?token=6vTmn8wGx8PAvtNVDRKHyP"}
      /> */}
          <Box
            display="flex"
            justifyContent="flex-end"
            alignItems="center"
            mb={3}
          >
            <FormControl sx={{ minWidth: 120, mr: 2 }}>
              <InputLabel>Filter</InputLabel>
              <Select
                value={filter}
                onChange={handleFilterChange}
                label="Filter"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value="TODAY">TODAY</MenuItem>
                <MenuItem value="THIS WEEK">THIS WEEK</MenuItem>
                <MenuItem value="THIS MONTH">THIS MONTH</MenuItem>
                <MenuItem value="ALL">ALL</MenuItem>
                <MenuItem value="CUSTOM" onClick={() => handleOpenDialog()}>
                  CUSTOM
                </MenuItem>
                <MenuItem
                  value="CUSTOM DATE"
                  onClick={() => handleOpenDialog()}
                >
                  CUSTOM DATE
                </MenuItem>
              </Select>
            </FormControl>
            <IconButton
              onClick={handleRefresh}
              color="primary"
              aria-label="refresh"
            >
              <RefreshIcon />
            </IconButton>
          </Box>
          <CustomDateRangePicker
            open={filter === "CUSTOM" && openDialog}
            onClose={handleCloseDialog}
            onApply={handleApply}
          />
          <CustomDatePicker
            open={filter === "CUSTOM DATE" && openDialog}
            onClose={handleCloseDialog}
            onApply={handleApply}
          />
          <Grid
            maxWidth={false}
            container
            spacing={3}
            sx={{ maxWidth: "100vw" }}
            disableGutters
          >
            {getCardStack({
              value: filter?.includes("CUSTOM") ? date : filter,
              setFilter: () => setFilter(null),
            })}
            {!isEmpty(dashboardData) && (
              <>
                {/* <Grid item xs={12} sm={4} md={3} lg={2}>
                  <PreDashboardCard
                    title="Total FE"
                    todayScore={dashboardData.total_users}
                    todayPercentage={
                      cardPercentage?.totalUsersCombinedPercentage || "0.0"
                    }
                    yesterdayScore=""
                    yesterdayPercentage=""
                  />
                </Grid> */}
                <Grid item xs={12} sm={4} md={3} lg={2}>
                  <DashboardCard
                    total={dashboardData.total_users}
                    title="Total FE"
                    percentageChange={
                      cardPercentage?.totalUsersCombinedPercentage || "0.0"
                    }
                    height="120px" // Greater height for the first card
                    bgcolor="#ff5722"
                    handleCardClick={() => nav("/field-executives")}
                  />
                </Grid>
                <Grid item xs={12} sm={4} md={3} lg={2}>
                  <DashboardCard
                    total={dashboardData.un_verified_users}
                    title="To Be Verified"
                    percentageChange={cardPercentage.unverifiedUsersPercentage}
                    bgcolor="#ffc107"
                    handleCardClick={() =>
                      nav("/field-executives?status=Unverified")
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={4} md={3} lg={2}>
                  <DashboardCard
                    total={dashboardData.active_users}
                    title="Active"
                    percentageChange={cardPercentage.activeUsersPercentage}
                    bgcolor="#4caf50"
                    handleCardClick={() =>
                      nav("/field-executives?status=Active")
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={4} md={3} lg={2}>
                  <DashboardCard
                    total={dashboardData.inactive_users}
                    title="Inactive Users"
                    percentageChange={cardPercentage.inactiveUsersPercentage}
                    bgcolor="#9e9e9e"
                    handleCardClick={() =>
                      nav("/field-executives?status=Inactive")
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={4} md={3} lg={2}>
                  <DashboardCard
                    total={dashboardData.suspended_users}
                    title="Suspended"
                    percentageChange={cardPercentage.suspendedUsersPercentage}
                    bgcolor="#f44336"
                    handleCardClick={() =>
                      nav("/field-executives?status=Suspended")
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={4} md={3} lg={2}>
                  <DashboardCard
                    total={dashboardData.rejected_users}
                    title="Rejected"
                    percentageChange={cardPercentage.rejectedUsersPercentage}
                    bgcolor="#f44336"
                    handleCardClick={() =>
                      nav("/field-executives?status=Rejected")
                    }
                  />
                </Grid>

                <Grid item xs={12} sm={4} md={3} lg={2}>
                  <DashboardCard
                    total={dashboardData.total_cards}
                    title="Total Cards"
                    percentageChange={cardPercentage.totalCardsPercentage}
                    height="120px" // Greater height for the first card
                    bgcolor="#ff5722"
                    handleCardClick={() => nav("/cards?tab=totalCards")}
                    todayScore={dashboardData.todayTotalCards}
                    yesterdayScore={dashboardData.yesterdayTotalCards}
                  />
                </Grid>
                <Grid item xs={12} sm={4} md={3} lg={2}>
                  <DashboardCard
                    total={dashboardData.available_to_print}
                    title="Available to print"
                    percentageChange={cardPercentage.availableToPrintPercentage}
                    bgcolor="#ffc107"
                    handleCardClick={() =>
                      nav("/cards?page=Cards&tab=toBePrinted")
                    }
                    todayScore={dashboardData.availableToPrintTodayCount}
                    yesterdayScore={
                      dashboardData.availableToPrintYesterdayCount
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={4} md={3} lg={2}>
                  <DashboardCard
                    total={dashboardData.printed}
                    title="Printed"
                    percentageChange={cardPercentage.printedPercentage}
                    bgcolor="linear-gradient(79deg, #ffc107, white, #4caf50)"
                    handleCardClick={() =>
                      nav("/cards?tab=totalCards&status=PRINTED")
                    }
                    todayScore={dashboardData.printedTodayCount}
                    yesterdayScore={dashboardData.printedYesterdayCount}
                  />
                </Grid>
                <Grid item xs={12} sm={4} md={3} lg={2}>
                  <DashboardCard
                    total={dashboardData.delivered_cards}
                    title="Delivered"
                    percentageChange={cardPercentage.deliveredCardsPercentage}
                    bgcolor="#4caf50"
                    handleCardClick={() =>
                      nav("/cards?tab=totalCards&status=DELIVERED")
                    }
                    todayScore={dashboardData.deliveredCardsTodayCount}
                    yesterdayScore={dashboardData.deliveredCardsYesterdayCount}
                  />
                </Grid>
                <Grid item xs={12} sm={4} md={3} lg={2}>
                  <DashboardCard
                    total={dashboardData.undelivered_cards}
                    title="Undelivered"
                    percentageChange={cardPercentage.undeliveredCardsPercentage}
                    bgcolor="#f44336"
                    handleCardClick={() =>
                      nav("/cards?tab=totalCards&status=UNDELIVERED")
                    }
                    todayScore={dashboardData.undeliveredCardsTodayCount}
                    yesterdayScore={
                      dashboardData.undeliveredCardsYesterdayCount
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={4} md={3} lg={2}>
                  <DashboardCard
                    total={dashboardData.discard_cards}
                    title="Discarded"
                    percentageChange={cardPercentage.discardCardsPercentage}
                    bgcolor="#9e9e9e"
                    handleCardClick={() =>
                      nav("/cards?tab=totalCards&status=DISCARDED")
                    }
                    todayScore={dashboardData.discardedCardsTodayCount}
                    yesterdayScore={dashboardData.discardedCardsYesterdayCount}
                  />
                </Grid>

                <Grid item xs={12} sm={4} md={3} lg={2}>
                  <DashboardCard
                    total={dashboardData.total_hospital}
                    title="Total"
                    percentageChange={cardPercentage.totalHospitalPercentage}
                    height="120px" // Greater height for the first card
                    bgcolor="#ff5722"
                    handleCardClick={() => nav("/hospitals")}
                    todayScore={dashboardData.totalHospitalTodayCount}
                    yesterdayScore={dashboardData.totalHospitalYesterdayCount}
                  />
                </Grid>
                <Grid item xs={12} sm={4} md={3} lg={2}>
                  <DashboardCard
                    total={dashboardData.hospitals}
                    title="Hospitals"
                    percentageChange={cardPercentage.hospitalsPercentage}
                    bgcolor="#ff5722"
                    handleCardClick={() => nav("/hospitals?category=Hospital")}
                    todayScore={dashboardData.hospitalTodayCount}
                    yesterdayScore={dashboardData.hospitalYesterdayCount}
                  />
                </Grid>
                <Grid item xs={12} sm={4} md={3} lg={2}>
                  <DashboardCard
                    total={dashboardData.medicals}
                    title="Medicals"
                    percentageChange={cardPercentage.medicalsPercentage}
                    bgcolor="#ff5722"
                    handleCardClick={() => nav("/hospitals?category=Medical")}
                    todayScore={dashboardData.totalMedicalTodayCount}
                    yesterdayScore={dashboardData.totalMedicalYesterdayCount}
                  />
                </Grid>
                <Grid item xs={12} sm={4} md={3} lg={2}>
                  <DashboardCard
                    total={dashboardData.diagnostic_centers}
                    title="Labs & Diagnostic Centers"
                    percentageChange={
                      cardPercentage.diagnosticCentersPercentage
                    }
                    bgcolor="#ff5722"
                    handleCardClick={() =>
                      nav("/hospitals?category=Labs+%26+Diagnostic+Centers")
                    }
                    todayScore={dashboardData.totalDCTodayCount}
                    yesterdayScore={dashboardData.totalDCYesterdayCount}
                  />
                </Grid>
                {/* <Grid item xs={12} sm={4} md={3} lg={2}>
                  <DashboardCard
                    total={dashboardData.pathology_lab}
                    title="Pathology Lab"
                    percentageChange={
                      cardPercentage.diagnosticCentersPercentage
                    }
                    bgcolor="#ff5722"
                    handleCardClick={() =>
                      nav("/hospitals?category=Pathology+Lab")
                    }
                    todayScore={dashboardData.pathologyLabTodayCount}
                    yesterdayScore={dashboardData.pathologyLabYesterdayCount}
                  />
                </Grid> */}
              </>
            )}
            {/* Add more cards as needed */}
          </Grid>
        </Container>
      )}
      {/* </TabPanel> */}
      {/* <TabPanel value={selectedTab} index={1}>
        <TreeChartComponent />
      </TabPanel> */}
    </Box>
  );
};

export default Dashboard;
