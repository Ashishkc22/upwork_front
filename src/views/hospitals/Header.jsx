import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import TableChartIcon from "@mui/icons-material/TableChart";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Card, CardActionArea, Grid, Select } from "@mui/material";
import CustomAutocompleteDropDown from "../../components/CustomAutocompleteDropDown";
import SearchTextinput from "../../components/SearchTextInput";
import { useNavigate } from "react-router-dom";
import { isElement, isEmpty } from "lodash";
import common from "../../services/common";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import moment from "moment";
import GetCardStack from "../dashboard/ChipStack";
import CustomDateRangePicker from "../../components/CustomDateRangePicker";
import CustomDatePicker from "../../components/CustomDatePicker";
import hospitals from "../../services/hospitals";

const ScoreCard = ({ value, secondValue, text, bgcolor, name }) => {
  return (
    <Card
      elevation={0}
      sx={{
        my: 1,
        flexGrow: 1,
        borderRadius: 3,
      }}
    >
      <CardActionArea>
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

const searchOptionKey = { labelKey: "name" };
const districtOptionKey = { labelKey: "name" };
const createdByKeyMap = { labelKey: "name", codeKey: "uid" };
const statusOptions = [{ label: "ENABLE" }, { label: "DISABLE" }];
const durationOptions = [
  "TODAY",
  "THIS WEEK",
  "THIS MONTH",
  "ALL",
  "CUSTOM",
  "CUSTOM DATE",
];

const Header = ({
  totalCardDetails = {},
  callBacks = {},
  handleRefresh = () => {},
} = {}) => {
  const navigate = useNavigate();
  const [state, setState] = useState({});
  const [stateOptions, setStateOption] = useState([]);
  // District states
  const [districtOption, setDistrictOption] = useState([]);
  const [district, setDistrict] = useState({});

  const [tehsilOption, setTehsilOption] = useState([]);
  const [tehsil, setTehsil] = useState({});

  const [gramOption, setGramOption] = useState([]);
  const [gram, setGram] = useState({});

  const [status, setStatus] = useState({});
  const [categoryOption, setCategoryOption] = useState([]);
  const [category, setCategory] = useState({});

  const [duration, setDuration] = useState();
  const [date, setDate] = useState();

  const [isDatePickerOpened, setIsDatePickerOpened] = useState(false);

  // const handleSearch = (e) => {
  //   const term = e.target.value;
  //   setSearchTerm(term);
  //   addDataToURL({ search: term });
  //   headerData.handleSearch(term);
  // };

  // API call
  function getAddressData(payload) {
    common.getAddressData(payload).then((data) => {
      if (payload?.type == "tehsil" && !data?.error) {
        setTehsilOption(data || []);
      } else if (payload?.type == "district" && !data?.error) {
        setDistrictOption(data);
      } else if (payload?.type == "gram" && !data?.error) {
        setGramOption(data || []);
      } else {
        if (!data?.error) {
          console.log("setStateOption", data);

          setStateOption(data);
        }
      }
    });
  }

  // Update URL params
  function addDataToURL(data) {
    const searchParams = new URLSearchParams(window.location.search);
    // Iterate over the data object and append each key-value pair to the URL
    Object.keys(data).forEach((key) => {
      searchParams.set(key, data[key]);
    });
    // Update the URL with the new query string
    navigate(`?${searchParams.toString()}`, { replace: true });
  }

  // INpute change function
  const handleInputChange = ({ name, data }) => {
    const payload = {
      ...(state?.name && { state: state?.name }),
      ...(tehsil?.name && { tehsil: tehsil?.name }),
      ...(district?.name && { district: district?.name }),
      ...(gram?.name && { gram: gram?.name }),
      ...(status?.label && { status: status?.label }),
      ...(category?.name && { category: category?.name }),
    };
    if (name) {
      addDataToURL({ [name]: data });
    }
    if (callBacks[name]) {
      callBacks[name]({ name, data, ...(payload && { payload }) });
    } else {
      console.log(`${name} function not found`);
    }
  };

  const handleFilterChange = ({
    inputName,
    data,
    _duration,
    till_duration,
  }) => {
    const payload = {
      ...(state?.name && { state: state?.name }),
      ...(tehsil?.name && { tehsil: tehsil?.name }),
      ...(district?.name && { district: district?.name }),
      ...(gram?.name && { gram: gram?.name }),
      ...(status?.label && { status: status?.label }),
      ...(category?.name && { type: category?.name }),
      ...(_duration && { duration: _duration }),
      ...(till_duration && { till_duration }),
    };
    if (inputName === "state" && data) {
      if (!data?.newValue) {
        setState({});
        setDistrictOption([[]]);
        delete payload.state;
        payload[inputName] = callBacks.getDataOnFilterChange();
      } else {
        getAddressData({
          type: "district",
          params: { stateId: data.newValue._id },
        });
        payload["state"] = data.newValue.name;
        setState(data.newValue);
      }
    } else if (inputName == "district" && data) {
      if (!data?.newValue) {
        setDistrict({});
        setTehsilOption([]);
        delete payload.district;
      } else {
        getAddressData({
          type: "tehsil",
          params: { districtId: data.newValue._id },
        });
        payload["district"] = data.newValue.name;
        console.log("data.newValue", data.newValue);

        setDistrict(data.newValue);
      }
    } else if (inputName == "tehsil" && data) {
      if (!data?.newValue) {
        setTehsil({});
        setGramOption([]);
        delete payload.tehsil;
      } else {
        getAddressData({
          type: "gram",
          params: {
            tehsilId: data.newValue?._id,
            showHidden: true,
            display: "Gram",
          },
        });
        payload["tehsil"] = data.newValue.name;

        setTehsil(data.newValue);
      }
    } else if (inputName == "gram" && data) {
      if (!data?.newValue) {
        setGram({});
        delete payload.gram;
      } else {
        payload["gram"] = data.newValue.name;

        setGram(data.newValue);
      }
    } else if (inputName == "status" && data) {
      if (data.newValue) {
        payload["status"] = data.newValue.label;
        setStatus(data.newValue);
      } else {
        delete payload.status;
        setStatus({});
        delete payload["status"];
      }
    } else if (inputName == "type" && data) {
      if (data.newValue) {
        payload["type"] = data.newValue.name;
        setCategory(data.newValue);
      } else {
        setCategory({});
        delete payload.type;
      }
    } else if (inputName == "duration" && data) {
      if (["CUSTOM", "CUSTOM DATE"].includes(data)) {
        setDuration(data);
        setIsDatePickerOpened(true);
      } else {
        setDuration(data);
      }
    }
    if (!["CUSTOM", "CUSTOM DATE"].includes(data)) {
      callBacks.getDataOnFilterChange(payload);
    }
  };

  function handleCloseDialog() {
    setIsDatePickerOpened(false);
    // setDuration(null);
  }

  function handleApply(range) {
    let data = range;
    let _duration = "";
    let till_duration = "";
    if (Array.isArray(data)) {
      _duration = moment(data[0].startDate).startOf("day").valueOf();
      till_duration = moment(data[0].endDate).endOf("day").valueOf();
      data = `${moment(data[0].startDate).format("DD/MM/YYYY")}-${moment(
        data[0].endDate
      ).format("DD/MM/YYYY")}`;
    } else {
      _duration = moment(data).startOf("day").valueOf();
      till_duration = moment().endOf("day").valueOf();
      data = moment(data).format("DD/MM/YYYY");
    }
    setDate(data);
    handleFilterChange({ _duration, till_duration });
  }

  useEffect(() => {
    getAddressData({ type: "state" });
    hospitals.getHospitalCategory().then((data) => {
      setCategoryOption(data.hospital_category);
    });
  }, []);

  return (
    <Grid
      container
      alignItems="center"
      justifyContent="space-between"
      sx={{ mx: 1 }}
    >
      {/* Score Cards on the left */}
      {!isEmpty(totalCardDetails) && (
        <Grid item>
          <Grid container alignItems="center">
            <ScoreCard
              value={totalCardDetails.scoreValue}
              secondValue={totalCardDetails.secondaryValue || 0}
              text={totalCardDetails.label}
              bgcolor="#ffeee8"
              name={totalCardDetails.name}
            />
          </Grid>
        </Grid>
      )}

      <Grid item>
        <Grid container alignItems="center">
          {/* Search and other fields on the right */}
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
              onLoadFocus={true}
              emitSearchChange={(e) => {
                // setSearchInputValue(e.target.value);
                handleInputChange({ name: "search", data: e.target.value });
              }}
            />
          </Box>
          <Box sx={{ mx: 1, minWidth: 130 }}>
            <CustomAutocompleteDropDown
              emitAutoCompleteChange={(data) =>
                handleFilterChange({ inputName: "state", data })
              }
              value={state}
              inputValue="State"
              options={stateOptions.map((option) => {
                const { labelKey, codeKey } = searchOptionKey;
                return {
                  ...option,
                  label: option[labelKey],
                  ...(codeKey && { code: option[codeKey] }),
                };
              })}
              label="State"
            />
          </Box>
          {!isEmpty(districtOption) && (
            <Box sx={{ mx: 1, minWidth: 130 }}>
              <CustomAutocompleteDropDown
                emitAutoCompleteChange={(data) =>
                  handleFilterChange({ inputName: "district", data })
                }
                options={districtOption?.map((option) => {
                  const { labelKey, codeKey } = districtOptionKey;
                  return {
                    ...option,
                    label: option[labelKey],
                    ...(codeKey && { code: option[codeKey] }),
                  };
                })}
                label="District"
              />
            </Box>
          )}
          {!isEmpty(tehsilOption) && (
            <Box sx={{ mx: 1, minWidth: 130 }}>
              <CustomAutocompleteDropDown
                emitAutoCompleteChange={(data) =>
                  handleFilterChange({ inputName: "tehsil", data })
                }
                options={tehsilOption.map((option) => {
                  const { labelKey, codeKey } = districtOptionKey;
                  return {
                    ...option,
                    label: option[labelKey],
                    ...(codeKey && { code: option[codeKey] }),
                  };
                })}
                label="Tehsil"
              />
            </Box>
          )}
          {!isEmpty(gramOption) && (
            <Box sx={{ mx: 1, minWidth: 160 }}>
              <CustomAutocompleteDropDown
                emitAutoCompleteChange={(data) =>
                  handleFilterChange({ inputName: "gram", data })
                }
                options={gramOption.map((option) => {
                  const { labelKey, codeKey } = districtOptionKey;
                  return {
                    ...option,
                    label: option[labelKey],
                    ...(codeKey && { code: option[codeKey] }),
                  };
                })}
                label="Gram"
              />
            </Box>
          )}

          <Box sx={{ mx: 1, minWidth: 140 }}>
            <CustomAutocompleteDropDown
              emitAutoCompleteChange={(data) =>
                handleFilterChange({ inputName: "type", data })
              }
              options={categoryOption.map((option) => {
                return {
                  ...option,
                  label: option["name"],
                };
              })}
              label="Type"
            />
          </Box>

          <Box sx={{ mx: 1, minWidth: 140 }}>
            <CustomAutocompleteDropDown
              emitAutoCompleteChange={(data) =>
                handleFilterChange({ inputName: "status", data })
              }
              defaultValue={{ label: "ENABLE" }}
              options={statusOptions.map((option) => {
                return {
                  ...option,
                  label: option["label"],
                };
              })}
              label="Status"
            />
          </Box>
          {/*


          <Box sx={{ mx: 1, minWidth: 130 }}>
            <CustomAutocompleteDropDown
              emitAutoCompleteChange={emitCreatedByChange}
              options={headerData.createdByOptions.map((option) => {
                const { labelKey, codeKey } = headerData?.createdByKeyMap;
                return {
                  ...option,
                  label: option[labelKey],
                  ...(codeKey && { code: option[codeKey] }),
                };
              })}
              label="Created By"
            />
          </Box>
          */}

          <Box sx={{ mx: 1, minWidth: 130 }}>
            <CustomDateRangePicker
              open={duration === "CUSTOM" && isDatePickerOpened}
              onClose={handleCloseDialog}
              onApply={handleApply}
            />
            <CustomDatePicker
              open={duration === "CUSTOM DATE" && isDatePickerOpened}
              onClose={handleCloseDialog}
              onApply={handleApply}
            />
            <FormControl variant="standard" fullWidth>
              <InputLabel id="duration-select-label">Duration</InputLabel>
              <Select
                value={duration}
                labelId="duration-select-label"
                id="duration-select"
                onChange={(e) =>
                  handleFilterChange({
                    inputName: "duration",
                    data: e.target.value,
                  })
                }
              >
                {durationOptions.map((option, index) => (
                  <MenuItem key={index} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          {/*
           */}
          <Box sx={{ mx: 1 }}>
            <IconButton onClick={() => {}} color="primary" aria-label="refresh">
              <RefreshIcon
                onClick={() => {
                  let data = date;
                  let _duration = "";
                  let till_duration = "";
                  if (!isEmpty(date)) {
                    if (Array.isArray(data)) {
                      _duration = moment(data[0].startDate)
                        .startOf("day")
                        .valueOf();
                      till_duration = moment(data[0].endDate)
                        .endOf("day")
                        .valueOf();
                      data = `${moment(data[0].startDate).format(
                        "DD/MM/YYYY"
                      )}-${moment(data[0].endDate).format("DD/MM/YYYY")}`;
                    } else {
                      _duration = moment(data).startOf("day").valueOf();
                      till_duration = moment().endOf("day").valueOf();
                      data = moment(data).format("DD/MM/YYYY");
                    }
                  }
                  const payload = {
                    ...(state?.name && { state: state?.name }),
                    ...(tehsil?.name && { tehsil: tehsil?.name }),
                    ...(district?.name && { district: district?.name }),
                    ...(gram?.name && { gram: gram?.name }),
                    ...(status?.label && { status: status?.label }),
                    ...(category?.name && { type: category?.name }),
                    ...(_duration && { duration: _duration }),
                    ...(till_duration && { till_duration }),
                  };
                  handleRefresh({ payload });
                }}
              />
            </IconButton>
          </Box>
        </Grid>
      </Grid>
      {date && (
        <Box sx={{ mt: 2 }}>
          {GetCardStack({
            filter: duration,
            setFilter: setDuration,
            date: date,
          })}
        </Box>
      )}
    </Grid>
  );
};

export default Header;
