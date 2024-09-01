import Header from "../../components/Header";
import { Grid, Card, TablePagination, Box, Button } from "@mui/material";
import field_executives from "../../services/field_executives";
import { isEmpty } from "lodash";
import { useEffect, useState } from "react";
import CustomTable from "../../components/CustomTable";
import { useNavigate, useSearchParams } from "react-router-dom";
import LinearIndeterminate from "../../components/LinearProgress";
import RestoreIcon from "@mui/icons-material/Restore";
import bin from "../../services/bin";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

let typingTimer;

const headers = [
  { label: "SNO", key: "index" },
  { label: "NAME", key: "name" },
  { label: "CREATED BY", key: "created_by_uid" },
  { label: "UID", key: "unique_number" },

  { label: "F/H NAME", key: "father_husband_name" },
  {
    label: "AGE",
    key: "birth_year",
    isFunction: true,
  },
  { label: "MOB NO.", key: "phone" },
  { label: "DELETED AT", key: "deleted_at" },
  // { label: "EXPIRY", key: "expiry_date" },
  { label: "STATUS", key: "status" },
  { label: "", key: "ACTION" },
];

const Bin = () => {
  const navigate = useNavigate();
  // Hospital Table Data
  const [binData, setBinData] = useState([]);

  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(0);

  let [urlDateType, setUrlDateType] = useSearchParams();
  const [isPageLoading, setIsPageLoading] = useState(false);

  //   API call to get hospital data
  const getBinData = ({ _page } = {}) => {
    setIsPageLoading(true);
    bin
      .getBinData({
        params: {
          limit: 100,
          page: _page,
        },
      })
      .then((response) => {
        if (!isEmpty(response)) {
          setPageCount(response.total_results);
          if (!isEmpty(response.data)) {
            setPageCount(response.docCount);
            setBinData(response.data);
          }
        } else {
          setBinData([]);
        }
        setIsPageLoading(false);
      });
  };

  const handleDataRestore = async (row) => {
    setIsPageLoading(true);
    await bin.restoreData({ id: row._id });
    setIsPageLoading(false);
    getBinData();
  };

  useEffect(() => {
    getBinData();
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
        mt: 1,
        mx: {
          lg: 1,
          md: "auto",
          sm: "auto",
          xs: "auto",
        },
      }}
      rowSpacing={3}
    >
      {isPageLoading ? (
        <LinearIndeterminate />
      ) : (
        <Grid item xs={12}>
          {/* {!isEmpty(hospitalList) && ( */}
          <CustomTable
            headers={headers}
            rows={binData}
            dataForSmallScreen={{
              use: true,
              title: { keys: ["name", "created_by_uid", "deleted_at"] },
            }}
            showPagiantion
            showActionMenu={false}
            actions={[
              {
                label: "Restore",
                smallIcon: <RestoreIcon size="small" />,
                icon: <RestoreIcon />,
                handler: handleDataRestore,
              },
            ]}
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
                  getBinData({ _page: newPage });
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
      )}
    </Grid>
  );
};

export default Bin;
