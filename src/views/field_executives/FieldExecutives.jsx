import Header from "./Header";
import { Grid, Button } from "@mui/material";
import field_executives from "../../services/field_executives";
import { isEmpty } from "lodash";
import { useEffect, useState } from "react";
import CustomTable from "../../components/CustomTable";
import { useNavigate } from "react-router-dom";
import EditCardDialog from "./EditCardDialog";

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
  } = {}) => {
    if (!search && searchValue && search != "em") {
      search = searchValue;
    }
    field_executives
      .getUsers({
        params: {
          limit: 100,
          page: 0,
          sortBy: "name",
          ...(search && search != "em" && { q: search }),
          ...(district && district != "em" && { district }),
          ...(tehsil && tehsil != "em" && { tehsil }),
          ...(type && type != "em" && { type }),
          ...(status && status != "em" ? { status } : { statu: "ENABLE" }),
          ...(state && state != "em" && { state }),
          ...(duration && duration != "em" && { duration }),
          ...(till_duration && till_duration != "em" && { till_duration }),
        },
      })
      .then((response) => {
        if (!isEmpty(response)) {
          if (!isEmpty(response.data)) {
            setUsersList(response.data);
          }
          setTotalUsers(response?.total || 0);
          setTotalUsersToShow(response?.total_results || 0);
        } else {
          setUsersList([]);
        }
      });
  };

  const handleSearchChanges = ({ data, payload }) => {
    if (data === "") {
      getUsers({ search: "em" });
    }
    setSearchValue(data);
    if (!/^\s*$/.test(data)) {
      clearTimeout(typingTimer);
      typingTimer = setTimeout(function () {
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
          totalCardDetails={{
            scoreValue: totalUsers,
            secondaryValue: totalusersToShow,
            label: "Total Executives",
            nmae: "Total Executives",
          }}
          callBacks={{
            search: handleSearchChanges,
            getDataOnFilterChange: getUsers,
          }}
          handleRefresh={handleRefresh}
        />
      </Grid>
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
          Add field executive
        </Button>
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
      </Grid>
    </Grid>
  );
};

export default HospitalPage;
