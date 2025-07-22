import { memo, useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  Card,
  CardActionArea,
  Typography,
  Box,
  Grid,
  Divider,
  FormControlLabel,
  Switch,
  Autocomplete,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Button,
  InputAdornment,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  ViewModule as ViewModuleIcon,
  TableChart as TableChartIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import CustomDatePicker from "./CustomDatePicker";
import CustomDateRangePicker from "./CustomDateRangePicker";
import { enqueueSnackbar } from "notistack";
import commonAPIServices from "../services/common";
import ChipStack from "../views/dashboard/ChipStack";
import { debounce, isEmpty, set } from "lodash";
import moment from "moment";
import cardService from "../services/cards";
import { useSearchParams } from "react-router-dom";
import { useCardContext2 } from "../views/cards/context/CardContext2";
import SearchComponent from "./SearchComponent";
import storageUtil from "../utils/storage.util";

const ScoreCard = ({
  value,
  secondValue,
  text,
  isCardSelected,
  actionHandler,
}) => {
  return (
    <Card
      elevation={0}
      sx={{
        my: 1,
        ...(isCardSelected && { background: "#ffeee8" }),
        flexGrow: 1,
        borderRadius: 3,
      }}
    >
      <CardActionArea {...actionHandler}>
        <Box sx={{ p: 1 }} textAlign="center">
          <Typography fontSize={25} fontWeight={600}>
            {secondValue !== value && isCardSelected
              ? `${secondValue}/${value}`
              : value}
          </Typography>
          <Typography fontSize={12} fontWeight={500} color="#00000059">
            {text}
          </Typography>
        </Box>
      </CardActionArea>
    </Card>
  );
};

const CustomTextField = styled(TextField)(({ theme }) => ({
  backgroundColor: "#f0f0f0", // Light grey background
  borderRadius: 50,
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      border: "none", // Remove border
    },
    "&:hover fieldset": {
      border: "none",
      borderRadius: 50,
    },
    "&.Mui-focused fieldset": {
      border: "none",
      borderRadius: 50,
    },
  },
}));

// temp props
const applyMargin = false;
const durationOptions = [
  "TODAY",
  "THIS WEEK",
  "THIS MONTH",
  "ALL",
  "CUSTOM",
  "CUSTOM DATE",
];
function Header({
  selectedCardType = "totalCards",
  totalCardScoreDetails = {},
  pendindgCardScoreDetails = {},
  toBePrintedCardScoreDetails = {},
  handleScoreCardClick = () => {},
  statusOptions = [
    { label: "SUBMITTED" },
    { label: "PRINTED" },
    { label: "UNDELIVERED" },
    { label: "DELIVERED" },
    { label: "DISCARDED" },
    { label: "RTO" },
    { label: "PENDING" },
  ],
  callBackFunction = async () => {},
}) {
  // Use context
  const {
    filterValues,
    handleFilterChanges,
    mode,
    setMode,
    printModeDateTime,
    setPrintModeDateTime,
    setFilterValues,
    setIsPageLoading,
  } = useCardContext2();

  // URL search params
  // This is used to manage the state of the URL parameters
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState(() =>
    searchParams.get("search")
  );
  // ##USESTATE_BLOCK State management for various filters
  const [state, setState] = useState(null);
  const [district, setDistrict] = useState(null);
  const [tehsil, setTehsil] = useState(null);
  const [gram, setGram] = useState(null);

  const [stateOptions, setStateOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [tehsilOptions, setTehsilOptions] = useState([]);
  const [gramOptions, setGramOptions] = useState([]);

  const [status, setStatus] = useState(null);

  const [filterChips, setFilterChips] = useState([]);

  const [searchInputValue, setSearchInputValue] = useState(null);
  const [dateType, setDateType] = useState("");
  const [customDateValue, setCustomDateValue] = useState(null);
  const [isDatePickerOpened, setIsDatePickerOpened] = useState(false);
  const [createdByOptions, setCreatedByOPtions] = useState([]);
  const [createdBy, setCreatedBy] = useState(null);

  // ##END_STATE_BLOCK

  // ## MAPPERS
  const locationURLParamMap = {
    districtId: () => {
      setDistrict(null);
      setFilterValues((p) => ({ ...p, district: null }));
      setIsPageLoading(true);
      setTimeout(callBackFunction, 1000);
    },
    tehsilId: () => {
      setTehsil(null);
      setFilterValues((p) => ({ ...p, tehsil: null }));
      setIsPageLoading(true);
      setTimeout(callBackFunction, 1000);
    },
    gramId: () => {
      setGram(null);
      setFilterValues((p) => ({ ...p, gram: null }));
      setIsPageLoading(true);
      setTimeout(callBackFunction, 1000);
    },
    stateId: () => {
      setState(null);
      setFilterValues((p) => ({ ...p, state: null }));
      setIsPageLoading(true);
      setTimeout(callBackFunction, 1000);
    },
    duration: () => {
      setDateType(null);
      setCustomDateValue(null);
      setFilterValues((p) => ({ ...p, duration: null, till_duration: null }));
      setIsPageLoading(true);
      setTimeout(callBackFunction, 1000);
    },
    dateType: () => {
      setDateType(null);
      setFilterValues((p) => ({ ...p, duration: null, till_duration: null }));
      setIsPageLoading(true);
      setTimeout(callBackFunction, 1000);
    },
    status: () => {
      setStatus(null);
      setFilterValues((p) => ({ ...p, status: null }));
      setIsPageLoading(true);
      setTimeout(callBackFunction, 1000);
    },
    createdById: () => {
      setCreatedBy();
      setFilterValues((p) => ({ ...p, created_by: null }));
      setIsPageLoading(true);
      setTimeout(callBackFunction, 1000);
    },
  };
  // ## param to filter mapper
  const paramsToFilterMapper = {
    districtId: "district",
    tehsilId: "tehsil",
    gramId: "gram",
  };

  // ##HELPER_FUNCTIONS_BLOCK
  const getAddressData = (payload, selectedId) => {
    if (payload?.type === "district") {
      payload.params = { refId: "63c681806072b29c2133326e" };
    }
    if (payload?.type === "tehsil") {
      payload.params.showCardCount = true;
    }

    commonAPIServices.getAddressData(payload).then((data) => {
      if (data?.error) {
        console.error("Error in header address data");
        enqueueSnackbar("Failed to fetch address data", {
          variant: "error",
        });
        return;
      }
      switch (payload.type) {
        case "state":
          if (data && data.length) setStateOptions(data);
          if (selectedId)
            setSelectedLocation({
              valueId: selectedId,
              options: data,
              setFn: setState,
              type: payload.type,
            });
          break;
        case "district":
          if (data && data.length) setDistrictOptions(data);
          if (selectedId)
            setSelectedLocation({
              valueId: selectedId,
              options: data,
              setFn: setDistrict,
              type: payload.type,
            });
          break;
        case "tehsil":
          if (data && data.length) setTehsilOptions(data);
          if (selectedId)
            setSelectedLocation({
              valueId: selectedId,
              options: data,
              setFn: setTehsil,
              type: payload.type,
            });
          break;
        case "gram":
          if (data && data.length) setGramOptions(data);
          if (selectedId)
            setSelectedLocation({
              valueId: selectedId,
              options: data,
              setFn: setGram,
              type: payload.type,
            });
          break;
        default:
          break;
      }
    });
  };

  function setURLParams(name, value) {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (value === null || value === "") {
        newParams.delete(name);
      } else {
        newParams.set(name, value);
      }
      return newParams;
    });
  }

  function clearUrlParams(name, value) {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (value === "pendingCards") {
        prev
          .keys()
          .forEach(
            (key) => key !== name && key !== "status" && newParams.delete(key)
          );
        newParams.set("status", "PENDING");
      } else {
        prev.keys().forEach((key) => key !== name && newParams.delete(key));
      }
      newParams.set(name, value);
      return newParams;
    });
  }

  function handleFilterChange({ type, value }) {
    setFilterChips((prev) => {
      const existingIndex = prev.findIndex((chip) => chip.type === type);
      if (existingIndex > -1) {
        const updatedChips = [...prev];
        if (updatedChips[existingIndex].type === type) {
          if (prev[existingIndex].value !== value) {
            updatedChips.splice(existingIndex, 1, { type: type, value });
          } else {
            // remove chip if the value is the same
            updatedChips.splice(existingIndex, 1);
            setURLParams(type, null);
            // set location state to null
            locationURLParamMap[type] && locationURLParamMap[type](null);
          }
        }
        return updatedChips;
      } else {
        let existingDateDurationIndex = null;
        if (type === "dateType" || type === "duration") {
          existingDateDurationIndex = prev.findIndex(
            (chip) => chip.type === "dateType" || chip.type === "duration"
          );
        }
        if (
          existingDateDurationIndex !== null &&
          existingDateDurationIndex !== -1
        ) {
          prev.splice(existingDateDurationIndex, 1);
        }
        return [...prev, { type, value }];
      }
    });
  }

  const handleChange = (
    type,
    value,
    setFn,
    paraName,
    skipAddressAPI = false,
    isDate = false,
    skipChip = false
  ) => {
    if (setFn) {
      setFn(value);
    }
    if (value?._id) {
      setURLParams(paraName, value._id);
      if (!skipAddressAPI) {
        getAddressData({ type, params: { refId: value._id } });
      }
      handleFilterChange({ type: paraName, value: value.name });
    } else {
      let data = value;
      if (isDate) {
        if (Array.isArray(data)) {
          data = `${moment(data[0].startDate).format("DD/MM/YYYY")}-${moment(
            data[0].endDate
          ).format("DD/MM/YYYY")}`;
        } else {
          data = moment(data).format("DD/MM/YYYY");
        }
      }
      if (!skipChip) {
        handleFilterChange({ type: paraName, value: data });
      }
      setURLParams(paraName, data);
    }
    if (value !== "CUSTOM" && value !== "CUSTOM DATE") {
      handleCallBackAPIcall({ paraName, value, isDate });
    }
  };

  function handleCallBackAPIcall({ paraName, value }) {
    const filter = {};
    if (paraName === "status" && value) {
      // PENDING (5) -> PENDING
      filter.status = value?.split(" ")?.[0];
    } else if (paraName === "dateType") {
      filter.duration = value;
    } else if (paraName === "duration") {
      const { startDate, endDate } = Array.isArray(value)
        ? value?.[0] || {}
        : { startDate: value, endDate: value };
      filter.duration = moment(startDate).startOf("day").valueOf();
      filter.till_duration = moment(endDate).endOf("day").valueOf();
    } else if (paraName === "createdById") {
      filter.created_by = value.uid;
    } else if (paramsToFilterMapper[paraName]) {
      filter[paramsToFilterMapper[paraName]] = value.name;
    } else if (paraName === "printMode") {
      filter.isPrintMode = value;
    } else {
      filter[paraName] = value;
    }
    // call parent function with filter data
    handleFilterChanges({ filter });
    callBackFunction({ ...filterValues, ...filter });
    console.log("Setting filterValue", filter);
  }

  function setSelectedLocation({ valueId, options, setFn, type = "" }) {
    const value = options.find((item) => item._id === valueId);
    if (value) {
      setFn(value);
    }
    handleFilterChange({ type: `${type}Id`, value: value?.name || null });
    setFilterValues((p) => ({ ...p, [type]: value?.name || null }));
  }

  const getUsersList = useCallback(async () => {
    const userList = await cardService.getUsersList({
      ...(selectedCardType === "toBePrinted" && { _status: "SUBMITTED" }),
    });
    const preSelectedValue = searchParams.get("createdById");
    setCreatedByOPtions(userList);
    if (preSelectedValue && !isEmpty(userList)) {
      const results = userList.find((user) => user._id === preSelectedValue);
      setCreatedBy({
        ...results,
        label: results["name"],
        code: results["uid"],
      });
      handleFilterChange({ type: "createdById", value: results?.name || null });
      setFilterValues((p) => ({ ...p, created_by: results.uid }));
    }
  }, [selectedCardType, searchParams]);

  const emitScoreCardClick = (type) => {
    if (selectedCardType === type) {
      return;
    }
    clearSelectedFilters();
    if (type === "pendingCards") {
      handleFilterChange({ type: "status", value: "PENDING" });
      setStatus(statusOptions.find((s) => s?.label?.includes("PENDING")));
    }
    clearUrlParams("tab", type);
    handleScoreCardClick(type);
  };

  const clearLocationFilters = () => {
    setDistrict(null);
    setTehsil(null);
    setGram(null);
  };
  const clearURLParams = () => {
    setSearchParams((p) => {
      ["districtId", "tehsilId", "createdById", "dateType"].forEach((k) =>
        p.delete(k)
      );
      console.log(Object.fromEntries(p.entries()));
      return p;
    });
  };
  const clearSelectedFilters = () => {
    clearLocationFilters();
    setStatus(null);
    setFilterChips([]);
    setSearchInputValue(null);
    setDateType("");
    setCustomDateValue(null);
    setIsDatePickerOpened(false);
    setMode("table");
    console.log("clearing filterValue");
    setFilterValues({});
  };

  const restoreScroll = () => {
    const searchParams = new URLSearchParams(window.location.search).get("tab");
    const scrollValue = storageUtil.getStorageData(
      `${location.pathname}-${searchParams}`
    );
    if (scrollValue) {
      window.scrollTo({
        top: scrollValue,
      });
    }
  };

  // ##END_HELPER_FUNCTIONS_BLOCK

  // ##USE_EFFECT_BLOCK
  useEffect(() => {
    const apiCallQueue = [];
    const districtId = searchParams.get("districtId");
    apiCallQueue.push(getAddressData({ type: "district" }, districtId));
    const tehsilId = searchParams.get("tehsilId");
    const gramId = searchParams.get("gramId");
    const dateType = searchParams.get("dateType");
    const printMode = searchParams.get("printMode");
    const urlStatus = searchParams.get("status");
    const clearnedStatus = urlStatus
      ? urlStatus?.split(" ")?.[0]?.toUpperCase()
      : null;
    if (tehsilId || districtId) {
      apiCallQueue.push(
        getAddressData(
          { type: "tehsil", params: { refId: districtId } },
          tehsilId
        )
      );
    }
    if (gramId || tehsilId) {
      apiCallQueue.push(
        getAddressData({ type: "gram", params: { refId: tehsilId } }, gramId)
      );
    }
    if (dateType) {
      setDateType(dateType);
      const duration = searchParams.get("duration");
      if (duration) {
        const [start, end] = duration.split("-");
        setFilterValues((p) => ({
          ...p,
          duration: moment(start, "DD/MM/YYYY").startOf("day").valueOf(),
          till_duration: moment(end || start, "DD/MM/YYYY")
            .endOf("day")
            .valueOf(),
        }));
        handleFilterChange({ type: "duration", value: duration || null });
      } else {
        handleFilterChange({ type: "dateType", value: dateType || null });
      }
    }
    if (printMode || clearnedStatus) {
      // setPrintModeDateTime();
      console.log("clearnedStatus", clearnedStatus);
      setFilterValues((p) => ({
        ...p,
        ...(printMode && { isPrintMode: printMode }),
        ...(clearnedStatus && { status: clearnedStatus }),
      }));
    }
    if (clearnedStatus) {
      setStatus(clearnedStatus);
      setFilterChips((p) => {
        const valueExists = p?.find((chip) => chip.type === "status");
        if (valueExists) {
          return p;
        } else {
          p.push({ type: "status", value: clearnedStatus });
          return [...p];
        }
      });
    }
    // if(searchParams.get("createdById")){
    apiCallQueue.push(getUsersList());
    // }
    Promise.all(apiCallQueue).then(() => {
      setTimeout(
        () =>
          callBackFunction({ status: clearnedStatus }).then(() => {
            restoreScroll();
          }),
        1000
      );
    });
  }, []);

  const handleClearChipFilter = () => {
    setFilterValues(() => ({}));
    setCreatedBy(null);
    clearLocationFilters();
    setStatus(null);
    setFilterChips([]);
    setDateType("");
    setCustomDateValue(null);
    setIsDatePickerOpened(false);
    callBackFunction({});
  };

  // ##END_USE_EFFECT_BLOCK
  // Create debounced function

  const debouncedSearch = debounce((query) => {
    // handleChange("", query, setSearchTerm, "search", false, false, true);
    callBackFunction({ search: query });
  }, 500); // 500ms delay

  const handleSearchChanges = (value) => {
    // setSearchTerm(e.target?.value ? value : "");
    setURLParams("search", value ? value : null);
    setFilterValues((p) => ({ ...p, search: value ? value : null }));
    callBackFunction({ search: value });
  };

  return (
    <Grid container alignItems="center" sx={{ mx: 1, columnGap: "2px" }}>
      <Grid item display="flex" alignItems={"center"} flexWrap="wrap">
        <ScoreCard
          text="Total Cards"
          value={totalCardScoreDetails.value || 0}
          secondValue={totalCardScoreDetails.secondValue || 0}
          isCardSelected={selectedCardType === "totalCards"}
          actionHandler={{
            onClick: emitScoreCardClick.bind(null, "totalCards"),
          }}
        />

        <Divider orientation="vertical" flexItem sx={{ my: 3, mx: 2 }} />
        <ScoreCard
          text="Pending Cards"
          value={pendindgCardScoreDetails.value || 0}
          secondValue={pendindgCardScoreDetails.value || 0}
          isCardSelected={selectedCardType === "pendingCards"}
          actionHandler={{
            onClick: emitScoreCardClick.bind(null, "pendingCards"),
          }}
        />
        <Divider orientation="vertical" flexItem sx={{ my: 3, mx: 2 }} />
        <ScoreCard
          value={toBePrintedCardScoreDetails.value || 0}
          secondValue={toBePrintedCardScoreDetails.value || 0}
          text={"To be Printed"}
          bgcolor="#ffeee8"
          isCardSelected={selectedCardType === "toBePrinted"}
          actionHandler={{
            onClick: emitScoreCardClick.bind(null, "toBePrinted"),
          }}
        />
        {selectedCardType === "toBePrinted" && (
          <Grid item>
            <FormControlLabel
              checked={Boolean(printModeDateTime || null)}
              control={<Switch color="primary" />}
              onChange={(e) => {
                handleChange(
                  "",
                  printModeDateTime ? null : new Date().valueOf(),
                  setPrintModeDateTime,
                  "printMode",
                  false,
                  false,
                  true
                );
              }}
              label="Print Mode"
              labelPlacement="top"
              sx={{
                ".css-17w9904-MuiTypography-root": {
                  fontWeight: 600,
                },
              }}
            />
            {printModeDateTime && (
              <Typography fontSize={10} sx={{ mx: 2 }}>
                {moment(parseInt(printModeDateTime)).format("DD/MM/YYYY hh:mm")}
              </Typography>
            )}
          </Grid>
        )}
        {/* <Button
          sx={{
            background: "#ff5722",
            color: "white",
            ":hover": {
              background: "#e23f0c",
            },
          }}
          onClick={() => {}}
        >
          Add Button 
        </Button> */}
      </Grid>
      <Grid
        item
        sx={{ ...(applyMargin && { ml: { lg: 18, md: 0, sm: 0, xs: 0 } }) }}
      >
        {/* <Grid container alignItems="center"> */}
        <Box
          sx={{
            mx: 1,
            width: {
              lg: 400,
              md: 270,
              sm: 200,
              xs: 130,
            },
          }}
        >
          <SearchComponent
            selectedCardType={selectedCardType}
            handleSearchChanges={handleSearchChanges}
          ></SearchComponent>
        </Box>
      </Grid>
      {/* <Grid item>
        <Box sx={{ mx: 1, minWidth: 130 }}>
          <Autocomplete
            disableClearable
            options={[]}
            value={""}
            getOptionLabel={(option) => option.name}
            onChange={() => {}}
            renderInput={(params) => (
              <TextField {...params} label="State" variant="standard" />
            )}
          />
        </Box>
      </Grid> */}
      <Grid item>
        <Box sx={{ mx: 1, minWidth: 130 }}>
          <Autocomplete
            disableClearable
            options={districtOptions}
            value={district}
            getOptionLabel={(option) => option.name}
            onChange={(e, data) =>
              handleChange("tehsil", data, setDistrict, "districtId")
            }
            renderInput={(params) => (
              <TextField {...params} label="District" variant="standard" />
            )}
          />
        </Box>
      </Grid>
      {district && (
        <Grid item>
          <Box sx={{ mx: 1, minWidth: 130 }}>
            <Autocomplete
              disableClearable
              value={tehsil}
              options={tehsilOptions}
              getOptionLabel={(option) => option.name}
              onChange={(_, data) =>
                handleChange("gram", data, setTehsil, "tehsilId")
              }
              renderOption={(props, option) => {
                const { key, ...optionProps } = props;
                return (
                  <Box
                    key={key}
                    sx={{ p: "3px", display: "block" }}
                    {...optionProps}
                  >
                    <Grid container>
                      <Typography fontSize={12} fontWeight={500}>
                        {option.name + ` (${option?.count || 0})`}
                      </Typography>
                    </Grid>
                  </Box>
                );
              }}
              renderInput={(params) => (
                <TextField {...params} label="Tehsil" variant="standard" />
              )}
            />
          </Box>
        </Grid>
      )}
      {tehsil && (
        <Grid item>
          <Box sx={{ mx: 1, minWidth: 160 }}>
            <Autocomplete
              options={gramOptions}
              disableClearable
              value={gram}
              getOptionLabel={(option) => option.label}
              onChange={(e, data) =>
                handleChange("", data, setGram, "gramId", true)
              }
              renderInput={(params) => (
                <TextField {...params} label="Gram" variant="standard" />
              )}
            />
          </Box>
        </Grid>
      )}
      {selectedCardType !== "toBePrinted" && (
        <Grid item>
          <Box sx={{ mx: 1, minWidth: 140 }}>
            <Autocomplete
              options={statusOptions}
              disableClearable
              value={status}
              onChange={(e, newValue, value) =>
                handleChange("", newValue.label, setStatus, "status")
              }
              renderInput={(params) => (
                <TextField {...params} label="Status" variant="standard" />
              )}
            />
          </Box>
        </Grid>
      )}
      <Grid item>
        <Box sx={{ mx: 1, minWidth: 130 }}>
          <Autocomplete
            disableClearable
            options={createdByOptions.map((option) => {
              return {
                ...option,
                label: option["name"],
                code: option["uid"],
              };
            })}
            value={createdBy}
            onChange={(_, data) =>
              handleChange("", data, setCreatedBy, "createdById", true)
            }
            renderOption={(props, option) => {
              const { key, ...optionProps } = props;
              return (
                <Box
                  key={option._id}
                  sx={{ p: "3px", display: "block" }}
                  {...optionProps}
                >
                  <Grid container>
                    <Typography fontSize={12} fontWeight={500}>
                      {option.label}
                    </Typography>
                    {option.code && (
                      <Typography
                        fontSize={12}
                        fontWeight={500}
                        color="#000000b0"
                      >
                        ({`#${option.code}`})
                      </Typography>
                    )}
                  </Grid>
                  {option?.count && (
                    <Typography fontSize={12} fontWeight={500}>
                      {" ("}
                      {option.count}
                      {")"}
                    </Typography>
                  )}
                </Box>
              );
            }}
            renderInput={(params) => (
              <TextField {...params} label="Created By" variant="standard" />
            )}
          />
        </Box>
      </Grid>
      <Grid item>
        <Box
          sx={{
            mx: 1,
            minWidth: 130,
            display: "inline-flex",
          }}
        >
          <CustomDateRangePicker
            open={dateType === "CUSTOM" && isDatePickerOpened}
            onClose={() => setIsDatePickerOpened(false)}
            onApply={(range) =>
              handleChange(
                "",
                range,
                setCustomDateValue,
                "duration",
                false,
                true
              )
            }
          />
          <CustomDatePicker
            open={dateType === "CUSTOM DATE" && isDatePickerOpened}
            onClose={() => setIsDatePickerOpened(false)}
            onApply={(range) =>
              handleChange(
                "",
                range,
                setCustomDateValue,
                "duration",
                false,
                true
              )
            }
          />

          <FormControl variant="standard" fullWidth>
            <InputLabel id="duration-select-label">Duration</InputLabel>
            <Select
              value={dateType}
              labelId="duration-select-label"
              id="duration-select"
            >
              {durationOptions.map((option, index) => (
                <MenuItem
                  key={option + index}
                  value={option}
                  onClick={() => {
                    const isDatePicker =
                      option === "CUSTOM" || option === "CUSTOM DATE";
                    if (isDatePicker) {
                      setIsDatePickerOpened(true);
                    }
                    handleChange(
                      "",
                      option,
                      setDateType,
                      "dateType",
                      false,
                      false,
                      isDatePicker
                    );
                  }}
                >
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Grid>
      <Grid item>
        <Box sx={{ mx: 1 }}>
          <IconButton
            onClick={() => setMode((m) => (m === "card" ? "table" : "card"))}
            color="primary"
            aria-label="table"
          >
            {mode === "table" ? <TableChartIcon /> : <ViewModuleIcon />}
          </IconButton>

          <IconButton onClick={null} color="primary" aria-label="refresh">
            <RefreshIcon
              onClick={() => {
                setIsPageLoading(true);
                callBackFunction({});
              }}
            />
          </IconButton>
        </Box>
        {/* </Grid> */}
      </Grid>
      {/* Filter Chips */}
      <Grid
        item
        xs={12}
        display="inline-flex"
        justifyContent="space-between"
        sx={{ mr: 2 }}
      >
        <Box display="inline-flex">
          {Boolean(filterChips?.length) &&
            filterChips.map((data, index) => (
              <Box sx={{ mt: 2, mx: 1 }}>
                <ChipStack
                  key={data.type + index}
                  setFilter={handleFilterChange}
                  type={data.type}
                  value={data.value}
                  otherData={data}
                />
              </Box>
            ))}
        </Box>
        {Boolean(filterChips?.length) && (
          <Box display="flex" alignItems="end">
            <Button
              variant="outlined"
              size="small"
              startIcon={<ClearIcon />}
              onClick={() => {
                handleClearChipFilter();
                clearURLParams();
              }}
            >
              Clear
            </Button>
          </Box>
        )}
      </Grid>
    </Grid>
  );
}

export default memo(Header);
