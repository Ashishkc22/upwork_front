import Header from "./Header";
import { Grid } from "@mui/material";
import hospitals from "../../services/hospitals";
import { isEmpty } from "lodash";
import { useEffect, useState } from "react";
import CustomTable from "../../components/CustomTable";
import { useNavigate } from "react-router-dom";

let typingTimer;

const headers = [
  { label: "SNO", key: "index" },
  { label: "UID", key: "uid" },
  { label: "NAME", key: "entity_name" },
  { label: "REG NO", key: "reg_no" },
  { label: "MOB NO.", key: "mobile_no" },
  { label: "DISTRICT", key: "district" },
  { label: "CITY", key: "city" },
  { label: "JOINED DATE", key: "created_at" },
];

const HospitalPage = () => {
  const navigate = useNavigate();
  // Hospital Table Data
  const [hospitalList, setHospitalList] = useState([]);
  //   Total cards value
  const [totalHospitals, setTotalHospital] = useState(0);
  // This secondary value
  const [totalHospitalsToShow, setTotalHospitalsToShow] = useState(0);
  //   Search value
  const [searchValue, setSearchValue] = useState(0);

  //   API call to get hospital data
  const getHospitals = ({
    search = "em",
    till_duration,
    duration,
    status,
    state,
    type,
    tehsil,
    district,
  } = {}) => {
    console.log("status", status);
    console.log("type", type);
    console.log("tehsil", tehsil);
    console.log("state", state);
    console.log("district", district);

    if (!search && searchValue && search != "em") {
      search = searchValue;
    }
    hospitals
      .getHospitals({
        params: {
          limit: 100,
          page: 0,
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
            setHospitalList(response.data);
          }
          setTotalHospital(response?.total || 0);
          setTotalHospitalsToShow(response?.total_results || 0);
        } else {
          setHospitalList([]);
        }
      });
  };

  const handleSearchChanges = ({ data, payload }) => {
    if (data === "") {
      getHospitals({ search: "em" });
    }
    setSearchValue(data);
    if (!/^\s*$/.test(data)) {
      clearTimeout(typingTimer);
      typingTimer = setTimeout(function () {
        getHospitals({ search: data, ...payload });
      }, 1500);
    }
  };

  const handleRefresh = ({ payload }) => {
    getHospitals({ ...payload });
  };

  const handleRowClick = (row) => {
    navigate(`${row._id}`);
  };

  useEffect(() => {
    getHospitals();
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
      <Grid item xs={12}>
        <Header
          totalCardDetails={{
            scoreValue: totalHospitals,
            secondaryValue: totalHospitalsToShow,
            label: "Total Hospitals",
            nmae: "Total Hospitals",
          }}
          callBacks={{
            search: handleSearchChanges,
            getDataOnFilterChange: getHospitals,
          }}
          handleRefresh={handleRefresh}
        />
      </Grid>
      <Grid item xs={12}>
        {/* {!isEmpty(hospitalList) && ( */}
        <CustomTable
          headers={headers}
          rows={hospitalList}
          tbCellStyle={{ py: "9px" }}
          dataForSmallScreen={{
            use: true,
            title: { keys: ["entity_name", "district"] },
          }}
          rowClick={handleRowClick}
        />
        {/* )} */}
      </Grid>
    </Grid>
  );
};

export default HospitalPage;
