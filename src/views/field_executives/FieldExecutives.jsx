import Header from "../../components/Header";
import { Grid, Card, TablePagination } from "@mui/material";
import field_executives from "../../services/field_executives";
import { isEmpty } from "lodash";
import { useEffect, useState } from "react";
import CustomTable from "../../components/CustomTable";
import { useNavigate, useSearchParams } from "react-router-dom";
import EditCardDialog from "./EditCardDialog";
import LinearIndeterminate from "../../components/LinearProgress";

let typingTimer;

const headers = [
  { label: "RANK", key: "index" },
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
  { label: "RATIO", key: "ratio" },
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
    search = "em",
    till_duration,
    duration,
    status,
    state,
    type,
    tehsil,
    district,
    _page,
  } = {}) => {
    const urlStatus = urlDateType.get("status");
    if (!search && searchValue && search != "em") {
      search = searchValue;
    }
    setIsPageLoading(true);
    field_executives
      .getUsers({
        params: {
          limit: 100,
          page: _page,
          sortBy: "name",
          ...(search && search != "em" && { q: search }),
          ...(district && district != "em" && { district }),
          ...(tehsil && tehsil != "em" && { tehsil }),
          ...(type && type != "em" && { type }),
          ...((status && status != "em") || urlStatus
            ? { status: status || urlStatus }
            : {}),
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
          setTotalUsers(response?.total || 0);
          setTotalUsersToShow(response?.total_results || 0);
        } else {
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

  const handleRowClick = (row) => {
    navigate(`${row.uid}`);
  };

  useEffect(() => {
    getUsers();
  }, []);

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
      <EditCardDialog
        open={addUsersDialog}
        onClose={() => setAddUsersDialog(false)}
        mode="Add"
      />
      <Grid item xs={12}>
        <Header
          toTalScoreDetails={{
            totalScore: totalUsers || 0,
            totalScoreToshow: totalusersToShow || 0,
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
        />
      </Grid>
      {isPageLoading ? (
        <LinearIndeterminate />
      ) : (
        <>
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
            {/* <Button
          sx={{
            background: "#ff5722",
            color: "white",
            ":hover": {
              background: "#e23f0c",
            },
          }}
          onClick={() => setAddUsersDialog(true)}
        >
          Add field executive
        </Button> */}
          </Grid>
          <Grid item xs={12}>
            {/* {!isEmpty(hospitalList) && ( */}
            <CustomTable
              headers={headers}
              rows={usersList}
              tbCellStyle={{ py: "9px" }}
              dataForSmallScreen={{
                use: true,
                title: { keys: ["name", "ID"] },
              }}
              rowClick={handleRowClick}
              showPagiantion
            />
            {/* )} */}
            <Grid item xs={12} sx={{ height: "39px" }}>
              <Card>
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
                />
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default HospitalPage;
