import Header from "../../components/Header";
import { Grid, Card, TablePagination, Button } from "@mui/material";
import hospitals from "../../services/hospitals";
import { isEmpty } from "lodash";
import { useEffect, useState } from "react";
import CustomTable from "../../components/CustomTable";
import { useNavigate, useSearchParams } from "react-router-dom";
import EditCardDialog from "./EditCardDialog";
import LinearIndeterminate from "../../components/LinearProgress";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

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

  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(0);

  let [urlDateType, setUrlDateType] = useSearchParams();
  const [isPageLoading, setIsPageLoading] = useState(false);

  //   API call to get hospital data
  const getHospitals = ({
    search = "em",
    till_duration,
    duration,
    _status,
    state,
    type,
    tehsil,
    district,
    _page,
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
          page: _page,
          ...(search && search != "em" && { q: search }),
          ...(district && district != "em" && { district }),
          ...(tehsil && tehsil != "em" && { tehsil }),
          ...(((type && type != "em") || urlType) && { type: type || urlType }),
          ...(_status && { status: _status }),
          ...(state && state != "em" && { state }),
          ...(duration && duration != "em" && { duration }),
          ...(till_duration && till_duration != "em" && { till_duration }),
        },
      })
      .then((response) => {
        if (!isEmpty(response)) {
          setPageCount(response.total_results);
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
      <EditCardDialog
        open={addHospitalDialog}
        onClose={() => setAddHospitalDialog(false)}
        mode="Add"
      />
      <Grid item xs={12}>
        <Header
          toTalScoreDetails={{
            totalScore: totalHospitals || 0,
            totalScoreToshow: totalHospitalsToShow || 0,
            text: "Total Hospitals",
            name: "totalHospitals",
          }}
          statusOption={[{ label: "ENABLE" }, { label: "DISABLE" }]}
          apiCallBack={getHospitals}
          showMode={false}
          // defaultStatus={{ label: "ENABLE" }}
          showTehsil={false}
          showGram={false}
          showType
          showOtherCard={true}
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
              getHospitals({ _page: newPage });
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
  );
};

export default HospitalPage;
