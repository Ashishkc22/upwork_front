import React, { useEffect, useState, memo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import TableChartIcon from "@mui/icons-material/TableChart";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Card, CardActionArea, Grid, Select, Button } from "@mui/material";
import SearchTextinput from "./SearchTextInput";
import { useNavigate, useSearchParams } from "react-router-dom";
import { isElement, isEmpty } from "lodash";
import common from "../services/common";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import moment from "moment";
import getCardStack from "../views/dashboard/ChipStack";
import CustomDateRangePicker from "./CustomDateRangePicker";
import CustomDatePicker from "./CustomDatePicker";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import ClearIcon from "@mui/icons-material/Clear";
import hospitals from "../services/hospitals";
import storageUtil from "../utils/storage.util";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";

const ScoreCard = ({
  value,
  secondValue,
  text,
  bgcolor,
  isCardSelected,
  emitCardSelect,
  name,
}) => {
  return (
    <Card
      elevation={0}
      sx={{
        my: 1,
        ...(isCardSelected && { background: bgcolor }),
        flexGrow: 1,
        borderRadius: 3,
      }}
    >
      <CardActionArea onClick={() => emitCardSelect && emitCardSelect(name)}>
        <Box sx={{ p: 1 }} textAlign="center">
          <Typography fontSize={25} fontWeight={600}>
            {secondValue != value && isCardSelected
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

const OtherScoreCard = ({ value, secondValue, text, emitCardSelect, name }) => {
  return (
    <Card
      elevation={0}
      sx={{
        my: 1,
        flexGrow: 1,
        borderRadius: 3,
      }}
    >
      <CardActionArea onClick={() => emitCardSelect && emitCardSelect(name)}>
        <Box sx={{ p: 1 }} textAlign="center">
          <Typography fontSize={25} fontWeight={600}>
            {secondValue != value ? `${secondValue}/${value}` : value}
          </Typography>
          <Typography fontSize={12} fontWeight={500} color="#00000059">
            {text}
          </Typography>
        </Box>
      </CardActionArea>
    </Card>
  );
};

let typingTimer;
let useEffectTypingTimer;
const Header = memo(
  ({
    toTalScoreDetails = {},
    secondaryTotalDetails = {},
    showSecondaryScoreCard = false,
    apiCallBack,
    // tehsilCounts = {},
    showStatusDropDown = true,
    statusOption = [],
    createdByOptions,
    createdByKeyMap,
    handleViewChange,
    defaultSelectedCard = "",
    handleSelectCard,
    showMode = true,
    defaultStatus = null,
    showTehsil = true,
    showGram = true,
    showType = false,
    showState = false,
    showDistrict = true,
    showOtherCard = false,
    isNavAllowed = () => true,
    pSelectedCard,
    showPrintMode = false,
    showAddHospital = false,
    hanldeAddHospital = () => {},
  }) => {
    const navigate = useNavigate();
    const [selectedCard, setSelectedCard] = useState(defaultSelectedCard);
    const [searchTerm, setSearchTerm] = useState(null);

    // values store
    const [state, setState] = useState(null);
    const [district, setDistrict] = useState(null);
    const [tehsil, setTehsil] = useState(null);
    const [gram, setGram] = useState(null);
    const [createdBy, setCreatedBy] = useState(null);
    const [duration, setDuration] = useState();
    const [status, setStatus] = useState(null);

    const [dateType, setDateType] = useState("");
    const [isDatePickerOpened, setIsDatePickerOpened] = useState(false);

    // DropDown Options
    const [stateOption, setStateOption] = useState([]);
    const [tehsilOption, setTehsilOption] = useState([]);
    const [gramOption, setGramOption] = useState([]);
    const [districtOption, setDistrictOption] = useState([]);
    // headerData?.districtOption || []
    const [filterDate, seFilterDate] = useState([]);
    const [urlsParams, setUrlsParams] = useState({});

    const [categoryOption, setCategoryOption] = useState([]);

    const [isImageMode, setIsImageMode] = useState(false);

    let [urlDateType, setUrlDateType] = useSearchParams();
    const [category, setCategory] = useState(null);
    const [printMode, setPrintMode] = useState(
      urlDateType.get("printMode") || false
    );

    const durationOptions = [
      "TODAY",
      "THIS WEEK",
      "THIS MONTH",
      "ALL",
      "CUSTOM",
      "CUSTOM DATE",
    ];

    const setURLFilters = () => {
      const urls = {};
      urlDateType.entries().forEach(([key, value]) => {
        urls[key] = value;
      });
      setUrlsParams(urls);
    };

    function handleCloseDialog() {
      setIsDatePickerOpened(false);
    }

    const handleApply = (range, addInUrl = true) => {
      let data = range;
      if (Array.isArray(data)) {
        data = `${moment(data[0].startDate).format("DD/MM/YYYY")}-${moment(
          data[0].endDate
        ).format("DD/MM/YYYY")}`;
      } else {
        data = moment(data).format("DD/MM/YYYY");
      }
      if (addInUrl) {
        addDataToURL({ duration: data });
      }
      setDuration(data);
      addInChipList(data, "duration");
      // headerData.handleDurationChange({ type: dateType, value: range });
    };

    // Update URL function
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

    const emitCardSelect = (name) => {
      const tab = urlDateType.get("tab");
      if (tab != name) {
        addDataToURL({ page: null });
      }
      if (isNavAllowed()) {
        setSelectedCard(name);
        addDataToURL({ tab: name });
      }
      handleSelectCard(name, false, {
        seFilterDate,
        setTehsilOption,
        setGramOption,
        setCreatedBy,
        stateMap,
      });
    };

    const emitStateChange = (e, data) => {
      addDataToURL({ stateId: data?._id || "" });
      if (data?.name) {
        setState(data);
        getAddressData({
          type: "district",
          params: { stateId: data._id },
        });
      } else {
        setState(null);
      }
      addInChipList(data.name, "state");
      // headerData.handleState(data?.newValue || null);
    };

    const addInChipList = (data, type) => {
      if (data || type === "duration") {
        seFilterDate((_filterDate) => {
          const s = _filterDate.findIndex((a) => a.type === type);
          console.log("s found", s);
          console.log("datas found", data);
          if (s === -1) {
            _filterDate.push({ type, value: data });
            return _filterDate;
          } else {
            _filterDate.splice(s, 1);
            if (data) {
              _filterDate.push({ type, value: data });
            }
            return _filterDate;
          }
        });
      }
    };

    const emitDistrictChange = (e, data) => {
      addDataToURL({ districtId: data?._id });
      if (data?.name) {
        getAddressData({
          type: "tehsil",
          params: { districtId: data._id },
        });
        setDistrict(data);
      } else {
        setDistrict(null);
      }
      addInChipList(data.name, "district");
      // headerData.handleDistrictChange(data?.newValue || {});
    };

    const emitTehsilChange = (e, data) => {
      addDataToURL({ tehsilId: data?._id || "" });
      if (data?.name) {
        getAddressData({
          type: "gram",
          params: {
            tehsilId: data?._id,
            showHidden: true,
            display: "Gram",
          },
        });
      }
      setTehsil(data?.name ? data : null);
      addInChipList(data?.name, "tehsil");

      // headerData.handleTehsilChange(data?.newValue || {});
    };
    const emitGramChange = (e, data) => {
      addDataToURL({ gramId: data?._id || "" });
      addInChipList(data?.label, "gram");
      setGram(data);
      // headerData.handleDistrictChange(data?.newValue || {});
    };

    const stateMap = {
      state: () => {
        addDataToURL({ stateId: null });
        setState(null);
      },
      district: () => {
        addDataToURL({ districtId: null });
        setDistrict(null);
      },
      tehsil: () => {
        addDataToURL({ tehsilId: null });
        setTehsil(null);
      },
      gram: () => {
        addDataToURL({ gramId: null });
        setGram(null);
      },
      createdBy: () => {
        addDataToURL({ createdById: null });
        setCreatedBy(null);
      },
      duration: () => {
        if (dateType != "CUSTOM" && dateType != "CUSTOM DATE") {
          addDataToURL({ duration: null });
          addDataToURL({ durationType: null });
          setDateType("");
          setDuration(null);
        } else {
          addDataToURL({ duration: null });
          addDataToURL({ durationType: null });
          setDateType("");
          setDuration(null);
        }
      },
      status: () => {
        addDataToURL({ status: null });
        setStatus(null);
      },
      ...(showType && {
        category: () => {
          setCategory(null);
        },
      }),
    };

    const handleFilterChange = (data) => {
      const findFilterIndex = filterDate.findIndex(
        (a) => a.type === data.otherData.type
      );
      if (findFilterIndex != -1) {
        seFilterDate((_filterDate) => {
          const newFilterData = [..._filterDate];
          newFilterData.splice(findFilterIndex, 1);
          stateMap[data.otherData.type]();
          return newFilterData;
        });
      }
    };

    // const emitStatusChange = (data) => {
    //   addDataToURL({ status: data?.newValue?.label || null });
    //   addInChipList(data, "status");
    //   headerData.handleStatusChange(data?.newValue || {});
    // };

    const emitCreatedByChange = (e, data) => {
      setCreatedBy(data || null);
      addDataToURL({ createdById: data?.uid || null });
      addInChipList(data?.name, "createdBy");
    };

    const emitDurationChange = ({ value }) => {
      if (value === "CUSTOM" || value === "CUSTOM DATE") {
        addDataToURL({ durationType: value });
        setDateType(value);
        setIsDatePickerOpened(true);
      } else {
        addDataToURL({ duration: null });
        addDataToURL({ durationType: value });
        setDateType(value);
        addInChipList(value, "duration");
      }
    };

    const triggerAPICallback = ({ search = "" } = {}) => {
      let trimedStatus;
      if (status?.label) {
        trimedStatus = status?.label?.split(" ")?.[0]?.trim();
      }
      const payload = {
        ...(state?.name && { state: state.name }),
        ...(district?.name && { district: district.name }),
        ...(createdBy?.name && { created_by: createdBy.uid }),
        ...(status?.label && { _status: trimedStatus }),
        ...(tehsil?.name && { tehsil: tehsil?.name }),
        ...(gram?.label && { gram_p: gram?.label }),
        ...(category && { type: category.name }),
        ...(printMode && { _isPrintMode: printMode }),
      };

      if (searchTerm) {
        payload.search = searchTerm;
      }
      if (search && search != "em") {
        payload.search = search;
      }
      if (search === "em") {
        delete payload.search;
      }
      if (dateType && dateType != "CUSTOM" && dateType != "CUSTOM DATE") {
        payload.duration = dateType;
      } else if (duration) {
        const [startDate = "", endDate = ""] = duration.split("-");
        payload.duration = moment(startDate, "DD/MM/YYYY")
          .startOf("day")
          .valueOf();
        payload.till_duration = moment(startDate, "DD/MM/YYYY")
          .endOf("day")
          .valueOf();
        if (endDate) {
          payload.till_duration = moment(endDate, "DD/MM/YYYY").valueOf();
        }
      }
      apiCallBack(payload);
    };
    useEffect(() => {
      if (storageUtil.getStorageData("firstHeaderRender")) {
        storageUtil.setStorageData(false, "firstHeaderRender");
      }
      setSelectedCard(pSelectedCard);
    });
    useEffect(() => {
      storageUtil.setStorageData(true, "firstHeaderRender");
      return () => {
        storageUtil.setStorageData(false, "firstHeaderRender");
      };
    }, []);
    const handleSearch = (e) => {
      const term = e?.target?.value || "";
      setSearchTerm(term);
      addDataToURL({ search: term });
      clearTimeout(typingTimer);
      typingTimer = setTimeout(function () {
        // call API
        triggerAPICallback({ search: term ? term : "em" });
      }, 1500);
    };

    function getAddressData(payload) {
      if (payload?.type == "district") {
        const params = { stateId: "63c681806072b29c2133326e" };
        payload.params = params;
      }
      common.getAddressData(payload).then((data) => {
        if (payload?.type == "tehsil" && !data?.error) {
          setTehsilOption(data || []);
          const findDis = data?.find((d) => d._id === urlsParams?.tehsilId);
          if (findDis) {
            setTehsil(findDis);
            addInChipList(findDis.name, "tehsil");
          }
        } else if (payload?.type == "district" && !data?.error) {
          setDistrictOption(data);
          const findDis = data?.find((d) => d._id === urlsParams?.districtId);
          if (findDis) {
            setDistrict(findDis);
            addInChipList(findDis.name, "district");
          }
        } else if (payload?.type == "state" && !data?.error) {
          setStateOption(data);
          const findDis = data?.find(
            (d) => d._id === urlDateType.get("stateId")
          );
          if (findDis) {
            setState(findDis);
            addInChipList(findDis.name, "state");
          }
        } else if (payload?.type == "gram" && !data?.error) {
          const findDis = data?.find((d) => d._id === urlsParams.gramId);
          if (findDis) {
            setGram({
              ...findDis,
              label: `${findDis.name}, ${findDis.grampanchayat_name}`,
            });
            addInChipList(findDis.label, "gram");
          }
          setGramOption(data || []);
        }
      });
    }

    // useEffect(() => {
    //   const cId = urlDateType.get("createdById");

    //   if (cId && headerData?.createdByOptions) {
    //     const _createdBy = headerData.createdByOptions.find(
    //       (user) => user._id === cId
    //     );
    //     if (_createdBy) {
    //       setCreatedBy(_createdBy);
    //     }
    //   }
    // }, [headerData.createdByOptions]);

    // useEffect(() => {
    //   if (headerData.selectedState) {
    //     const s = filterDate.find((a) => a.type === "state");
    //     if (!s) {
    //       const newFilter = [...filterDate];
    //       newFilter.push({ type: "state", value: headerData.selectedState.name });
    //       seFilterDate(newFilter);
    //     }
    //     setState(headerData.selectedState);
    //   }
    //   setURLFilters();
    // }, [headerData.selectedState]);

    useEffect(() => {
      if (urlDateType.get("districtId")) {
        getAddressData({
          type: "district",
          params: { stateId: urlDateType.get("stateId") },
        });
      }
      // if (urlDateType.get("printMode")) {
      //   setPrintMode(urlDateType.get("printMode"));
      // }
      if (urlDateType.get("search")) {
        setSearchTerm(urlDateType.get("search"));
      }
      if (urlDateType?.get("tehsilId") || urlDateType?.get("districtId")) {
        getAddressData({
          type: "tehsil",
          params: { districtId: urlDateType?.get("districtId") },
        });
      }

      if (urlDateType?.get("gramId") && urlDateType?.get("tehsilId")) {
        getAddressData({
          type: "gram",
          params: {
            tehsilId: urlDateType?.get("tehsilId"),
            showHidden: true,
            display: "Gram",
          },
        });
      }
      if (urlDateType?.get("tab")) {
        setSelectedCard(urlDateType?.get("tab"));
        emitCardSelect(urlDateType?.get("tab"));
      }
      if (urlDateType?.get("status")) {
        addInChipList(urlDateType?.get("status"), "status");
        setStatus({ label: urlDateType?.get("status") });
      }
      if (urlDateType?.get("durationType")) {
        setDateType(urlDateType?.get("durationType"));
        if (
          urlDateType?.get("durationType") != "CUSTOM" &&
          urlDateType?.get("durationType") != "CUSTOM DATE"
        ) {
          emitDurationChange({ value: urlDateType?.get("durationType") });
        }
        if (urlDateType?.get("duration")) {
          let dateFormat = moment(urlDateType?.get("duration"), "DD/MM/YYYY");
          if (urlDateType?.get("duration") === "CUSTOM") {
            dateFormat = [
              {
                startDate: moment(
                  urlDateType?.get("duration").split("-")[0],
                  "DD/MM/YYYY"
                ),
                endDate: moment(
                  urlDateType?.get("duration").split("-")[1],
                  "DD/MM/YYYY"
                ),
              },
            ];
          }
          handleApply(dateFormat, false);
        }
      }
    }, [urlsParams]);

    useEffect(() => {
      if (urlDateType?.get("createdById")) {
        const createdByOption = createdByOptions.find(
          (a) => a.uid == urlDateType?.get("createdById")
        );
        if (createdByOption) {
          setCreatedBy({ ...createdByOption, label: createdByOption.name });
          addInChipList(createdByOption.name, "createdBy");
        }
      }
    }, [createdByOptions]);

    useEffect(() => {
      clearTimeout(useEffectTypingTimer);
      useEffectTypingTimer = setTimeout(function () {
        // call API
        triggerAPICallback();
      }, 10);
    }, [
      state,
      district,
      tehsil,
      category,
      gram,
      createdBy,
      duration,
      status,
      dateType,
      printMode,
    ]);

    useEffect(() => {
      if (showDistrict) {
        getAddressData({ type: "district" });
      }
      if (showState) {
        getAddressData({ type: "state" });
      }
      setURLFilters();
      // if (!isEmpty(defaultStatus)) {
      //   setStatus(defaultStatus);
      //   addInChipList(defaultStatus.label, "status");
      // }
      if (showType) {
        hospitals.getHospitalCategory().then((data) => {
          setCategoryOption(data.hospital_category);
          const category = urlDateType?.get("category");
          if (showType && category) {
            const c = data.hospital_category?.find((h) => h.name == category);
            setCategory(c);
            addInChipList(c.name, "category");
          }
        });
      }
    }, []);

    return (
      <Grid
        container
        alignItems="center"
        justifyContent="space-between"
        sx={{ mx: 1 }}
      >
        {/* Score Cards on the left */}
        <Grid item>
          <Grid container alignItems="center">
            {showOtherCard ? (
              <OtherScoreCard
                value={toTalScoreDetails.totalScore}
                secondValue={toTalScoreDetails.totalScoreToshow}
                text={toTalScoreDetails.text}
                name={toTalScoreDetails.name}
                bgcolor="#ffeee8"
              />
            ) : (
              <ScoreCard
                // value={headerData.totalCards}
                value={toTalScoreDetails.totalScore}
                secondValue={toTalScoreDetails.totalScoreToshow}
                text={toTalScoreDetails.text}
                name={toTalScoreDetails.name}
                bgcolor="#ffeee8"
                emitCardSelect={(e) => {
                  addDataToURL({ sortType: "" });
                  addDataToURL({ search: "" });
                  setSearchTerm("");
                  if (!storageUtil.getStorageData("firstHeaderRender")) {
                    storageUtil.setStorageData(true, "firstHeaderRender");
                  }
                  // Object.keys(stateMap).forEach((key) => stateMap[key]());
                  // seFilterDate([]);
                  // setTehsilOption([]);
                  // setGramOption([]);
                  emitCardSelect(e);
                }}
                isCardSelected={selectedCard === toTalScoreDetails.name}
              />
            )}

            {showSecondaryScoreCard && (
              <>
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ my: 3, mx: 2 }}
                />
                <ScoreCard
                  // value={headerData.toBePrinted}
                  value={secondaryTotalDetails.secondaryTotalScore}
                  secondValue={
                    secondaryTotalDetails.secondaryTotalScoreToshow || 0
                  }
                  text={secondaryTotalDetails.text}
                  bgcolor="#ffeee8"
                  name={secondaryTotalDetails.name}
                  isCardSelected={selectedCard === secondaryTotalDetails.name}
                  emitCardSelect={(e) => {
                    addDataToURL({ sortType: "" });
                    addDataToURL({ search: "" });
                    setSearchTerm("");
                    emitCardSelect(e);
                  }}
                />
              </>
            )}
            {showPrintMode && (
              <Grid item>
                <FormControlLabel
                  checked={Boolean(printMode)}
                  control={<Switch color="primary" />}
                  onChange={(e) => {
                    if (e.target.checked) {
                      const date = new Date().valueOf();
                      setPrintMode(date);
                      addDataToURL({ printMode: date });
                    } else {
                      setPrintMode(null);
                      addDataToURL({ printMode: "" });
                    }
                  }}
                  label="Print Mode"
                  labelPlacement="top"
                  sx={{
                    ".css-17w9904-MuiTypography-root": {
                      fontWeight: 600,
                    },
                  }}
                />
                {printMode && (
                  <Typography fontSize={10} sx={{ mx: 2 }}>
                    {moment(parseInt(printMode)).format("DD/MM/YYYY hh:mm")}
                  </Typography>
                )}
              </Grid>
            )}
            {showAddHospital && (
              <Button
                sx={{
                  background: "#ff5722",
                  color: "white",
                  ":hover": {
                    background: "#e23f0c",
                  },
                }}
                onClick={() => hanldeAddHospital()}
              >
                Add hospital
              </Button>
            )}
          </Grid>
        </Grid>

        {/* Search and other fields on the right */}
        <Grid item>
          <Grid container alignItems="center">
            <Box
              sx={{
                mx: 1,
                width: {
                  lg: 420,
                  md: 270,
                  sm: 200,
                  xs: 130,
                },
              }}
            >
              <SearchTextinput
                onLoadFocus={
                  showSecondaryScoreCard && selectedCard === "totalCards"
                }
                value={searchTerm}
                setSearchTerm={setSearchTerm}
                emitSearchChange={handleSearch}
              />
            </Box>

            {showState && (
              <Box sx={{ mx: 1, minWidth: 130 }}>
                <Autocomplete
                  disableClearable
                  options={stateOption}
                  value={state}
                  getOptionLabel={(option) => option.name}
                  onChange={() => {
                    addDataToURL({ sortType: "" });
                    emitStateChange();
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="State" variant="standard" />
                  )}
                />
              </Box>
            )}

            {!isEmpty(districtOption) && (
              <Box sx={{ mx: 1, minWidth: 130 }}>
                <Autocomplete
                  disableClearable
                  options={districtOption}
                  value={district}
                  getOptionLabel={(option) => option.name}
                  onChange={emitDistrictChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="District"
                      variant="standard"
                    />
                  )}
                />
              </Box>
            )}

            {!isEmpty(tehsilOption) && showTehsil && (
              <Box sx={{ mx: 1, minWidth: 130 }}>
                <Autocomplete
                  disableClearable
                  value={tehsil}
                  options={tehsilOption.map((option) => {
                    let label = option.name;
                    // if (!isEmpty(tehsilCounts)) {
                    // const obKey = tehsilCounts || {};
                    label = `${option.name}(${option?.count || 0})`;
                    // }
                    return {
                      ...option,
                      label,
                    };
                  })}
                  getOptionLabel={(option) => option.name}
                  onChange={emitTehsilChange}
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
                            {option.label}
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
            )}

            {!isEmpty(gramOption) && showGram && (
              <Box sx={{ mx: 1, minWidth: 160 }}>
                <Autocomplete
                  options={gramOption.map((option) => {
                    return {
                      ...option,
                      label: `${option.name},${option.grampanchayat_name}`,
                    };
                  })}
                  disableClearable
                  value={gram}
                  getOptionLabel={(option) => option.label}
                  onChange={emitGramChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Gram" variant="standard" />
                  )}
                />
              </Box>
            )}

            {showType && (
              <Box sx={{ mx: 1, minWidth: 140 }}>
                <Autocomplete
                  options={categoryOption}
                  value={category}
                  // {...(!isEmpty(status) && { value: status })}
                  getOptionLabel={(option) => option.name}
                  onChange={(e, newValue, value) => {
                    setCategory(newValue || null);
                    addDataToURL({ category: newValue?.name });
                    addInChipList(newValue?.name, "category");
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Type" variant="standard" />
                  )}
                />
              </Box>
            )}

            {showStatusDropDown && !isEmpty(statusOption) && (
              <Box sx={{ mx: 1, minWidth: 140 }}>
                <Autocomplete
                  options={statusOption}
                  value={status}
                  disableClearable
                  getOptionLabel={(option) => option.label}
                  onChange={(e, newValue) => {
                    setStatus(newValue);
                    addDataToURL({ status: newValue.label });
                    addInChipList(newValue?.label, "status");
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Status" variant="standard" />
                  )}
                />
              </Box>
            )}

            {!isEmpty(createdByOptions) && (
              <Box sx={{ mx: 1, minWidth: 130 }}>
                <Autocomplete
                  disableClearable
                  options={createdByOptions.map((option) => {
                    const { labelKey, codeKey } = createdByKeyMap;
                    return {
                      ...option,
                      label: option[labelKey],
                      ...(codeKey && { code: option[codeKey] }),
                    };
                  })}
                  value={createdBy}
                  onChange={emitCreatedByChange}
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
                    <TextField
                      {...params}
                      label="Created By"
                      variant="standard"
                    />
                  )}
                />
              </Box>
            )}

            <Box
              sx={{
                mx: 1,
                minWidth: 130,
                display: "inline-flex",
              }}
            >
              <CustomDateRangePicker
                open={dateType === "CUSTOM" && isDatePickerOpened}
                onClose={handleCloseDialog}
                onApply={handleApply}
              />
              <CustomDatePicker
                open={dateType === "CUSTOM DATE" && isDatePickerOpened}
                onClose={handleCloseDialog}
                onApply={handleApply}
              />

              <FormControl variant="standard" fullWidth sx={{}}>
                <InputLabel id="duration-select-label">Duration</InputLabel>
                <Select
                  value={dateType}
                  labelId="duration-select-label"
                  id="duration-select"
                >
                  <MenuItem
                    value={null}
                    onClick={() => emitDurationChange({ value: null })}
                  >
                    none
                  </MenuItem>
                  {durationOptions.map((option, index) => (
                    <MenuItem
                      key={index}
                      value={option}
                      onClick={() => emitDurationChange({ value: option })}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ mx: 1 }}>
              {showMode && (
                <IconButton
                  onClick={() => {
                    setIsImageMode(!isImageMode);
                    handleViewChange();
                  }}
                  color="primary"
                  aria-label="table"
                >
                  {isImageMode ? (
                    <ViewModuleIcon></ViewModuleIcon>
                  ) : (
                    <TableChartIcon />
                  )}
                </IconButton>
              )}

              <IconButton
                onClick={() => {}}
                color="primary"
                aria-label="refresh"
              >
                <RefreshIcon onClick={() => triggerAPICallback()} />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
        <Grid
          item
          xs={12}
          display="inline-flex"
          justifyContent="space-between"
          sx={{ mr: 2 }}
        >
          <Box display="inline-flex">
            {Boolean(filterDate?.length) &&
              filterDate.map((data) => (
                <Box sx={{ mt: 2, mx: 1 }}>
                  {getCardStack({
                    setFilter: handleFilterChange,
                    type: dateType,
                    value: data?.value,
                    otherData: data,
                  })}
                </Box>
              ))}
          </Box>
          {Boolean(filterDate?.length) && (
            <Box display="flex" alignItems="end">
              <Button
                variant="outlined"
                size="small"
                startIcon={<ClearIcon />}
                onClick={() => {
                  Object.keys(stateMap).forEach((key) => stateMap[key]());
                  seFilterDate([]);
                  setTehsilOption([]);
                  setGramOption([]);
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
);

export default Header;
