import Header from "../../components/Header";
import { Grid, Card, TablePagination, Box, Button } from "@mui/material";
import field_executives from "../../services/field_executives";
import { isEmpty } from "lodash";
import { useState } from "react";
import CustomTable from "../../components/CustomTable";
import { useNavigate, useSearchParams } from "react-router-dom";
import EditCardDialog from "./EditCardDialog";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LoadingScreen from "../../components/LaodingScreenWithWhiteBG";
import storageUtil from "../../utils/storage.util";

let typingTimer;

const headers = [
  {
    label: "RANK",
    key: "index",
    indicator: true,
    getColor: ({ last_fetch, status }) => {
      const color =
        status === "Verified"
          ? new Date(last_fetch) >
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            ? "green"
            : "grey"
          : status === "Unverified"
          ? "#ffc107"
          : "red";

      return color;
    },
  },
  { label: "ID", key: "uid" },
  { label: "NAME", key: "name" },
  { label: "MOB NO.", key: "phone" },
  { label: "DISTRICT", key: "district" },
  { label: "EMERGENCY", key: "emergency_contact" },
  { label: "JOINED", key: "created_at" },
  { label: "TOTAL", key: "score" },
  { label: "2P", key: "p2_count" },
  { label: "P", key: "p_count" },
  { label: "D", key: "d_count" },
  { label: "UD", key: "ud_count" },
  { label: "DIS", key: "dis_count" },
  { label: "RATIO", key: "ratio", sort: true },
];

const HospitalPage = () => {
  const navigate = useNavigate();
  // Hospital Table Data
  const [usersList, setUsersList] = useState([]);
  //   Total cards value
  const [totalUsers, setTotalUsers] = useState(0);
  // This secondary value
  const [totalusersToShow, setTotalUsersToShow] = useState(0);
  //   Search value
  const [searchValue, setSearchValue] = useState(0);

  const [addUsersDialog, setAddUsersDialog] = useState(false);

  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(0);

  let [urlDateType, setUrlDateType] = useSearchParams();
  const [isPageLoading, setIsPageLoading] = useState(false);

  //   API call to get hospital data
  const getUsers = ({
    search,
    till_duration,
    duration,
    status,
    state,
    type,
    tehsil,
    district,
    _page,
    sortBy,
  } = {}) => {
    const urlStatus = urlDateType.get("status");
    console.log("search", search);

    if (!search && searchValue && search != "em") {
      search = searchValue;
    }
    setIsPageLoading(true);
    field_executives
      .getUsers({
        params: {
          limit: 100,
          page: _page,
          ...(search && search != "em" && { q: search }),
          ...(district && district != "em" && { district }),
          ...(tehsil && tehsil != "em" && { tehsil }),
          ...(type && type != "em" && { type }),
          ...((status && status != "em") || urlStatus
            ? { status: status || urlStatus }
            : {}),
          sortBy: sortBy ? sortBy : "created_at",
          // ...(sortBy && { sortBy }),
          ...(state && state != "em" && { state }),
          ...(duration && duration != "em" && { duration }),
          ...(till_duration && till_duration != "em" && { till_duration }),
        },
      })
      .then((response) => {
        if (!isEmpty(response)) {
          console.log("response FE", response);
          setPageCount(response.total_results);
          if (!isEmpty(response.data)) {
            setUsersList(response.data);
          }
          setTotalUsers(() => response?.total);
          setTotalUsersToShow(() => response?.total_results);
        } else {
          setTotalUsers(0);
          setTotalUsersToShow(0);
          setUsersList([]);
        }
        setIsPageLoading(false);
      });
  };

  const handleSearchChanges = ({ data, payload }) => {
    if (data === "") {
      getUsers({ search: "em" });
    }
    // setSearchValue(data);
    if (!/^\s*$/.test(data)) {
      clearTimeout(typingTimer);
      typingTimer = setTimeout(() => {
        getUsers({ search: data, ...payload });
      }, 1500);
    }
  };

  const handleRefresh = ({ payload }) => {
    getUsers({ ...payload });
  };
  function addDataToURL(data) {
    const searchParams = new URLSearchParams(window.location.search);
    // Iterate over the data object and append each key-value pair to the URL
    Object.keys(data).forEach((key) => {
      if (!data[key]) {
        searchParams.delete(key);
      } else {
        searchParams.set(key, data[key]);
      }
    });
    // Update the URL with the new query string
    navigate(`?${searchParams.toString()}`, { replace: true });
  }
  const handleRowClick = (row) => {
    storageUtil.setStorageData(row._id, "FE-highlightedRow");
    navigate(`${row.uid}`);
  };
  const handleSort = ({ colName, type }) => {
    if (type === "des") {
      getUsers({ sortBy: colName });
    } else {
      getUsers({});
    }

    addDataToURL({ sortType: type === "des" ? "des" : "" });
  };
  // useEffect(() => {
  //   getUsers();
  // }, []);

  const customPrevioudButton = (porps) => (
    <Button
      {...porps}
      sx={{ mx: 1 }}
      size="small"
      variant="standard"
      startIcon={<ArrowBackIcon />}
    >
      Previous
    </Button>
  );

  const customNextButton = (porps) => (
    <Button
      {...porps}
      sx={{ mx: 1 }}
      size="small"
      variant="standard"
      startIcon={<ArrowForwardIcon />}
    >
      Next
    </Button>
  );

  return (
    <Grid
      container
      sx={{
        mx: {
          lg: 1,
        },
      }}
      rowSpacing={3}
    >
      {addUsersDialog && (
        <EditCardDialog
          open={addUsersDialog}
          onClose={() => setAddUsersDialog(false)}
          addTLMode
        />
      )}
      <Grid item xs={12}>
        <Header
          currentComponentName="FE"
          toTalScoreDetails={{
            totalScore: totalUsers,
            totalScoreToshow: totalusersToShow,
            text: "Total Executives",
            name: "totalExecutives",
          }}
          statusOption={[
            { label: "Unverified" },
            { label: "Active" },
            { label: "Inactive" },
            { label: "Suspended" },
            { label: "Rejected" },
          ]}
          apiCallBack={getUsers}
          showGram={false}
          showMode={false}
          showOtherCard={true}
        />
      </Grid>
      {isPageLoading && <LoadingScreen />}
      <Grid
        item
        xs={12}
        sx={{
          display: "flex",
          justifyContent: "end",
          mt: 0,
          mx: 1,
          p: 0,
        }}
        justifyContent="end"
      >
        <Button
          sx={{
            background: "#ff5722",
            color: "white",
            ":hover": {
              background: "#e23f0c",
            },
          }}
          onClick={() => setAddUsersDialog(true)}
        >
          Add TL
        </Button>
      </Grid>
      <Grid item xs={12}>
        {/* {!isEmpty(hospitalList) && ( */}
        <CustomTable
          headers={headers}
          rows={usersList}
          highlightedRow={storageUtil.getStorageData("FE-highlightedRow")}
          tbCellStyle={{ py: "9px" }}
          dataForSmallScreen={{
            use: true,
            title: { keys: ["name", "ID"] },
          }}
          rowClick={handleRowClick}
          showPagiantion
          statusIndicator
          handleSort={handleSort}
        />
        <Box sx={{ height: "20px" }}></Box>

        {/* )} */}
        <Grid item xs={12} sx={{ height: "39px" }}>
          <Card
            sx={{
              position: "fixed",
              bottom: "5px",
              width: "100%",
              right: "1px",
            }}
          >
            <TablePagination
              component="div"
              count={pageCount}
              page={page}
              rowsPerPage={100}
              onPageChange={(e, newPage) => {
                setPage(newPage);
                getUsers({ _page: newPage });
              }}
              onRowsPerPageChange={() => {}}
              slots={{
                actions: {
                  nextButton: customNextButton,
                  previousButton: customPrevioudButton,
                },
              }}
            />
          </Card>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default HospitalPage;
