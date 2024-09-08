import Header from "../../components/Header";
import {
  Grid,
  Card,
  TablePagination,
  Box,
  Button,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import field_executives from "../../services/field_executives";
import { isEmpty } from "lodash";
import { useEffect, useState } from "react";
import CustomTable from "../../components/CustomTable";
import { useNavigate, useSearchParams } from "react-router-dom";
import LinearIndeterminate from "../../components/LinearProgress";
import RestoreIcon from "@mui/icons-material/Restore";
import bin from "../../services/bin";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { tokens } from "../../theme";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CardBin from "./CardBin";

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
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  // Hospital Table Data
  const [binData, setBinData] = useState([]);

  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(0);

  const [tab, setTab] = useState(0);

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

  function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`full-width-tabpanel-${index}`}
        aria-labelledby={`full-width-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }

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
      <Grid item xs={12}>
        <Tabs
          value={tab}
          onChange={(e, value) => {
            console.log("tabe", value);

            setTab(value);
          }}
          sx={{
            ".css-1042ldp-MuiButtonBase-root-MuiTab-root.Mui-selected": {
              color: colors.primary[500],
            },
            ".css-1aquho2-MuiTabs-indicator": {
              backgroundColor: colors.primary[500],
            },
          }}
        >
          <Tab label="Cards Bin" />
          {/* <Tab label="Item Two" />
          <Tab label="Item Three" /> */}
        </Tabs>
      </Grid>
      {isPageLoading ? (
        <Grid item xs={12}>
          <LinearIndeterminate />
        </Grid>
      ) : (
        <Grid item xs={12}>
          {/* {!isEmpty(hospitalList) && ( */}
          <TabPanel value={tab} index={0} dir={theme.direction}>
            <CardBin
              setPageCount={setPageCount}
              setIsPageLoading={setIsPageLoading}
              binData={binData}
              handleDataRestore={handleDataRestore}
            />
            <Box sx={{ height: "20px" }}></Box>
          </TabPanel>

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
