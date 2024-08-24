import Header from "./Header";
import { Grid, Button } from "@mui/material";
import hospitals from "../../services/hospitals";
import { isEmpty } from "lodash";
import { useEffect, useState } from "react";
import CustomTable from "../../components/CustomTable";
import { useNavigate, useSearchParams } from "react-router-dom";
import EditCardDialog from "./EditCardDialog";
import LinearIndeterminate from "../../components/LinearProgress";

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

  const [addHospitalDialog, setAddHospitalDialog] = useState(false);

  let [urlDateType, setUrlDateType] = useSearchParams();
  const [isPageLoading, setIsPageLoading] = useState(false);

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
    const urlType = urlDateType.get("hospitalCategory");

    if (!search && searchValue && search != "em") {
      search = searchValue;
    }
    setIsPageLoading(true);
    hospitals
      .getHospitals({
        params: {
          limit: 100,
          page: 0,
          ...(search && search != "em" && { q: search }),
          ...(district && district != "em" && { district }),
          ...(tehsil && tehsil != "em" && { tehsil }),
          ...(((type && type != "em") || urlType) && { type: type || urlType }),
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
        setIsPageLoading(false);
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
      <EditCardDialog
        open={addHospitalDialog}
        onClose={() => setAddHospitalDialog(false)}
        mode="Add"
      />
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
          onClick={() => setAddHospitalDialog(true)}
        >
          Add hospital
        </Button> */}
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
              showPagiantion
            />
            {/* )} */}
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default HospitalPage;
