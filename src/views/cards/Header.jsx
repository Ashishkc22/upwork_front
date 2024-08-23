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
import { useNavigate, useSearchParams } from "react-router-dom";
import { isElement, isEmpty } from "lodash";
import common from "../../services/common";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import moment from "moment";
import getCardStack from "../dashboard/ChipStack";
import CustomDateRangePicker from "../../components/CustomDateRangePicker";
import CustomDatePicker from "../../components/CustomDatePicker";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import ClearIcon from "@mui/icons-material/Clear";

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
      <CardActionArea onClick={() => emitCardSelect(name)}>
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

/* INPUTES
 totalCards={totalCardsAndToBePrinted.totalCards}
          toBePrinted={totalCardsAndToBePrinted.toBePrinted}
          totalPrintCardsShowing={
            totalCardsAndToBePrinted.totalPrintCardsShowing
          }
          totalShowing={totalCardsAndToBePrinted.totalShowing}
          createdByOptions={userDropdownOptions || []}
          createdByKeyMap={{ labelKey: "name", codeKey: "uid" }}
          stateDropdownOptions={stateDropdownOptions || []}
          stateKeyMap={{ labelKey: "name" }}
          durationOptions={[
            "TODAY",
            "THIS WEEK",
            "THIS MONTH",
            "ALL",
            "CUSTOM",
            "CUSTOM DATE",
          ]}
          selectedCard={selectedCard}
          selectedState={state}
          districtOption={districtOption}
          districtKeyMap={{ labelKey: "name" }}
          handleSelectCard={(n) => setSelectedCard(n)}
          handleSearch={handleSearch}
          handleState={handleState}
          handleDistrictChange={handleDistrictChange}
          handleCreatedBYChange={handleCreatedBYChange}
          handleDurationChange={handleDurationChange}
          handleRefresh={handleRefresh}
          statusOption={}
          handleStatusChange={handleStatusChange}
          isImageMode={isImageMode}
          handleViewChange={() => setIsImageMode(!isImageMode)}
*/
const Header = (headerData) => {
  const navigate = useNavigate();
  const [selectedCard, setSelectedCard] = useState("toBePrinted");
  const [searchTerm, setSearchTerm] = useState();
  const [state, setState] = useState(null);
  const [district, setDistrict] = useState(null);
  const [tehsil, setTehsil] = useState("");
  const [gram, setGram] = useState("");
  const [createdBy, setCreatedBy] = useState(null);
  const [duration, setDuration] = useState();
  const [status, setStatus] = useState();

  const [dateType, setDateType] = useState("");
  const [isDatePickerOpened, setIsDatePickerOpened] = useState(false);

  const [tehsilOption, setTehsilOption] = useState([]);
  const [gramOption, setGramOption] = useState([]);
  const [districtOption, setDistrictOption] = useState(
    headerData?.districtOption || []
  );
  const [filterDate, seFilterDate] = useState(null);
  const [urlsParams, setUrlsParams] = useState({});

  let [urlDateType, setUrlDateType] = useSearchParams();

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
    console.log("data $$$$$$$$", range);
    console.log("data String $$$$$$$$", data);
    console.log("dateType $$$$$$$$", dateType);
    seFilterDate(data);
    headerData.handleDurationChange({ type: dateType, value: range });
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
    setSelectedCard(name);
    addDataToURL({ tab: name });
    headerData.handleSelectCard(name);
  };

  const emitStateChange = (data) => {
    addDataToURL({ stateId: data?.newValue?._id || "" });
    if (data?.newValue) {
      setState(data.newValue);
      getAddressData({
        type: "district",
        params: { stateId: data.newValue._id },
      });
    } else {
      setState(null);
    }
    headerData.handleState(data?.newValue || null);
  };

  const emitDistrictChange = (data, callAPI = true) => {
    addDataToURL({ districtId: data?.newValue?._id });
    if (data?.newValue && callAPI) {
      getAddressData({
        type: "tehsil",
        params: { districtId: data?.newValue?._id },
      });
    } else {
      console.log("data district >>>>>", data);
    }
    headerData.handleDistrictChange(data?.newValue || {});
  };

  const emitTehsilChange = (data, callAPI = true) => {
    addDataToURL({ tehsilId: data?.newValue?._id || "" });
    if (data?.newValue && callAPI) {
      getAddressData({
        type: "gram",
        params: {
          tehsilId: data.newValue?._id,
          showHidden: true,
          display: "Gram",
        },
      });
    }
    headerData.handleTehsilChange(data?.newValue || {});
  };
  const emitGramChange = (data) => {
    addDataToURL({ gramId: data?.newValue?._id || "" });
    headerData.handleDistrictChange(data?.newValue || {});
  };

  const emitStatusChange = (data) => {
    addDataToURL({ status: data?.newValue?.label || null });
    headerData.handleStatusChange(data?.newValue || {});
  };

  const emitCreatedByChange = (data) => {
    addDataToURL({ createdById: data?.newValue?._id || null });
    headerData.handleCreatedBYChange(data.newValue);
  };

  const emitDurationChange = ({ value }) => {
    if (value === "CUSTOM" || value === "CUSTOM DATE") {
      addDataToURL({ durationType: value });
      setDateType(value);
      setIsDatePickerOpened(true);
    } else {
      addDataToURL({ duration: "" });
      addDataToURL({ durationType: value });
      setDateType(value);
      headerData.handleDurationChange(value);
    }
  };

  const handleSearch = (e) => {
    const term = e?.target?.value || "";
    setSearchTerm(term);
    addDataToURL({ search: term });
    headerData.handleSearch(term);
  };

  function getAddressData(payload) {
    common.getAddressData(payload).then((data) => {
      if (payload?.type == "tehsil" && !data?.error) {
        const findDis = data.find((d) => d._id === urlsParams?.tehsilId);
        if (findDis) {
          emitTehsilChange({ newValue: findDis }, false);
          setTehsil(findDis);
        }
        setTehsilOption(data || []);
      } else if (payload?.type == "district" && !data?.error) {
        const findDis = data.find((d) => d._id === urlsParams?.districtId);
        if (findDis) {
          emitDistrictChange({ newValue: findDis }, false);
          setDistrict(findDis);
        }
        setDistrictOption(data);
      } else if (payload?.type == "gram" && !data?.error) {
        const findDis = data.find((d) => d._id === urlsParams?.gramId);
        if (findDis) {
          emitGramChange({ newValue: findDis });
          setGram(findDis);
        }
        setGramOption(data || []);
      }
    });
  }

  useEffect(() => {
    const cId = urlDateType.get("createdById");

    if (cId && headerData?.createdByOptions) {
      const _createdBy = headerData.createdByOptions.find(
        (user) => user._id === cId
      );
      if (_createdBy) {
        setCreatedBy(_createdBy);
      }
    }
  }, [headerData.createdByOptions]);

  useEffect(() => {
    if (headerData.selectedState) {
      setState(headerData.selectedState);
    }
    setURLFilters();
  }, [headerData.selectedState]);

  useEffect(() => {
    if (urlsParams?.districtId && urlsParams?.stateId) {
      getAddressData({
        type: "district",
        params: { stateId: urlsParams?.stateId },
      });
    }
    if (urlsParams?.tehsilId && urlsParams?.districtId) {
      getAddressData({
        type: "tehsil",
        params: { districtId: urlsParams?.districtId },
      });
    }
    if (urlsParams?.gramId && urlsParams?.tehsilId) {
      getAddressData({
        type: "gram",
        params: {
          tehsilId: urlsParams?.tehsilId,
          showHidden: true,
          display: "Gram",
        },
      });
    }

    if (urlsParams?.tab) {
      setSelectedCard(urlsParams?.tab);
      emitCardSelect(urlsParams?.tab);
    }
    if (urlsParams?.status) {
      setStatus(urlsParams?.status);
      emitStatusChange({ newValue: { label: urlsParams?.status } });
    }
    if (urlsParams?.durationType) {
      setDateType(urlsParams?.durationType);
      if (
        urlsParams?.durationType != "CUSTOM" &&
        urlsParams?.durationType != "CUSTOM DATE"
      ) {
        emitDurationChange({ value: urlsParams?.durationType });
      }
      if (urlsParams?.duration) {
        let dateFormat = moment(urlsParams.duration, "DD/MM/YYYY");
        if (urlsParams?.durationType === "CUSTOM") {
          dateFormat = [
            {
              startDate: moment(
                urlsParams.duration.split("-")[0],
                "DD/MM/YYYY"
              ),
              endDate: moment(urlsParams.duration.split("-")[1], "DD/MM/YYYY"),
            },
          ];
        }
        handleApply(dateFormat, false);
      }
    }
  }, [urlsParams]);

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
          <ScoreCard
            value={headerData.totalCards}
            secondValue={headerData.totalShowing || 0}
            text="Total Cards"
            name="totalCards"
            bgcolor="#ffeee8"
            emitCardSelect={emitCardSelect}
            isCardSelected={selectedCard === "totalCards"}
          />
          <Divider orientation="vertical" flexItem sx={{ my: 3, mx: 2 }} />
          <ScoreCard
            value={headerData.toBePrinted}
            secondValue={headerData.totalPrintCardsShowing || 0}
            text="To Be Printed"
            bgcolor="#ffeee8"
            isCardSelected={selectedCard === "toBePrinted"}
            name="toBePrinted"
            emitCardSelect={emitCardSelect}
          />
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
              onLoadFocus={selectedCard === "totalCards"}
              emitSearchChange={handleSearch}
            />
          </Box>

          <Box sx={{ mx: 1, minWidth: 130 }}>
            <Autocomplete
              options={headerData.stateDropdownOptions.map((option) => {
                const { labelKey, codeKey } = headerData?.stateKeyMap;
                return {
                  ...option,
                  label: option[labelKey],
                  ...(codeKey && { code: option[codeKey] }),
                };
              })}
              value={state}
              // {...(!isEmpty(state) && { value: state })}
              getOptionLabel={(option) => option.name}
              onChange={(e, newValue, value) => {
                emitStateChange({ e, newValue });
              }}
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
                  </Box>
                );
              }}
              renderInput={(params) => (
                <TextField {...params} label="State" variant="standard" />
              )}
            />
          </Box>
          {!isEmpty(districtOption) && (
            <Box sx={{ mx: 1, minWidth: 130 }}>
              <Autocomplete
                options={districtOption.map((option) => {
                  const { labelKey, codeKey } = headerData?.stateKeyMap;
                  return {
                    ...option,
                    label: option[labelKey],
                    ...(codeKey && { code: option[codeKey] }),
                  };
                })}
                {...(district && { value: district })}
                getOptionLabel={(option) => option.name}
                onChange={(e, newValue, value) => {
                  setDistrict(newValue);
                  emitDistrictChange({ e, newValue });
                }}
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
                    </Box>
                  );
                }}
                renderInput={(params) => (
                  <TextField {...params} label="District" variant="standard" />
                )}
              />
            </Box>
          )}

          {!isEmpty(tehsilOption) && (
            <Box sx={{ mx: 1, minWidth: 130 }}>
              <Autocomplete
                options={tehsilOption.map((option) => {
                  const { labelKey, codeKey } = headerData?.districtKeyMap;
                  const obKey = headerData.tehsilCounts || {};
                  return {
                    ...option,
                    label: `${option[labelKey]}(${
                      obKey?.[option?.[labelKey]] || 0
                    })`,
                    ...(codeKey && { code: option[codeKey] }),
                  };
                })}
                {...(tehsil && { value: tehsil })}
                getOptionLabel={(option) => option.name}
                onChange={(e, newValue, value) => {
                  setTehsil(newValue);
                  emitTehsilChange({ e, newValue });
                }}
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
                    </Box>
                  );
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Tehsil" variant="standard" />
                )}
              />

              {/* <CustomAutocompleteDropDown
                emitAutoCompleteChange={emitTehsilChange}
                options={tehsilOption.map((option) => {
                  const { labelKey, codeKey } = headerData?.districtKeyMap;
                  const obKey = headerData.tehsilCounts || {};
                  return {
                    ...option,
                    label: `${option[labelKey]}(${
                      obKey?.[option?.[labelKey]] || 0
                    })`,
                    ...(codeKey && { code: option[codeKey] }),
                  };
                })}
                label="Tehsil"
              /> */}
            </Box>
          )}

          {!isEmpty(gramOption) && (
            <Box sx={{ mx: 1, minWidth: 160 }}>
              <Autocomplete
                options={gramOption.map((option) => {
                  const { labelKey, codeKey } = headerData?.districtKeyMap;
                  return {
                    ...option,
                    label: option[labelKey],
                    ...(codeKey && { code: option[codeKey] }),
                  };
                })}
                {...(gram && { value: gram })}
                getOptionLabel={(option) => option.name}
                onChange={(e, newValue, value) => {
                  setGram(newValue);
                  emitGramChange({ e, newValue });
                }}
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
                    </Box>
                  );
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Gram" variant="standard" />
                )}
              />

              {/* <CustomAutocompleteDropDown
                emitAutoCompleteChange={emitGramChange}
                options={gramOption.map((option) => {
                  const { labelKey, codeKey } = headerData?.districtKeyMap;
                  return {
                    ...option,
                    label: option[labelKey],
                    ...(codeKey && { code: option[codeKey] }),
                  };
                })}
                label="Gram"
              /> */}
            </Box>
          )}

          {selectedCard === "totalCards" && (
            <Box sx={{ mx: 1, minWidth: 140 }}>
              <Autocomplete
                options={headerData.statusOption.map((option) => {
                  const { labelKey, codeKey } = headerData?.statusKeyMap || {};
                  return {
                    ...option,
                    label: option[labelKey || "label"],
                    ...(codeKey && { code: option[codeKey] }),
                  };
                })}
                {...(status && { value: status })}
                // getOptionLabel={(option) => option.name}
                onChange={(e, newValue, value) => {
                  setStatus(newValue);
                  emitStatusChange({ e, newValue });
                }}
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
                    </Box>
                  );
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Status" variant="standard" />
                )}
              />

              {/* <CustomAutocompleteDropDown
                emitAutoCompleteChange={emitStatusChange}
                options={headerData.statusOption.map((option) => {
                  const { labelKey, codeKey } = headerData?.statusKeyMap || {};
                  return {
                    ...option,
                    label: option[labelKey || "label"],
                    ...(codeKey && { code: option[codeKey] }),
                  };
                })}
                label="Status"
              /> */}
            </Box>
          )}

          <Box sx={{ mx: 1, minWidth: 130 }}>
            <Autocomplete
              options={headerData.createdByOptions.map((option) => {
                const { labelKey, codeKey } = headerData?.createdByKeyMap;
                return {
                  ...option,
                  label: option[labelKey],
                  ...(codeKey && { code: option[codeKey] }),
                };
              })}
              value={createdBy}
              getOptionLabel={(option) => option.name}
              onChange={(e, newValue, value) => {
                setCreatedBy(newValue || null);
                emitCreatedByChange({ e, newValue });
              }}
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
                  </Box>
                );
              }}
              renderInput={(params) => (
                <TextField {...params} label="Created By" variant="standard" />
              )}
            />
            {/* 
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
            /> */}
          </Box>

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
                  value={""}
                  onClick={() => emitDurationChange({ value: "" })}
                >
                  none
                </MenuItem>
                {headerData.durationOptions.map((option, index) => (
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
            <IconButton
              onClick={() => {
                headerData.handleViewChange();
              }}
              color="primary"
              aria-label="table"
            >
              {headerData.isImageMode ? (
                <ViewModuleIcon></ViewModuleIcon>
              ) : (
                <TableChartIcon />
              )}
            </IconButton>

            <IconButton onClick={() => {}} color="primary" aria-label="refresh">
              <RefreshIcon onClick={() => headerData.handleRefresh()} />
            </IconButton>
          </Box>
        </Grid>
        <Grid item xs={12}>
          {filterDate && (
            <Box sx={{ mt: 2 }}>
              {getCardStack({
                filter: dateType,
                setFilter: () => {
                  setDateType("");
                  seFilterDate("");
                },
                date: filterDate,
              })}
            </Box>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Header;
