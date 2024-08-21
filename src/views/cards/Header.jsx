import React, { useState } from "react";
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
import getCardStack from "../dashboard/ChipStack";
import CustomDateRangePicker from "../../components/CustomDateRangePicker";
import CustomDatePicker from "../../components/CustomDatePicker";

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
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [tehsil, setTehsil] = useState("");
  const [gram, setGram] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [duration, setDuration] = useState();

  const [dateType, setDateType] = useState("");
  const [isDatePickerOpened, setIsDatePickerOpened] = useState(false);

  const [tehsilOption, setTehsilOption] = useState([]);
  const [gramOption, setGramOption] = useState([]);
  const [districtOption, setDistrictOption] = useState([]);
  const [filterDate, seFilterDate] = useState("");

  function handleCloseDialog() {
    setIsDatePickerOpened(false);
    setDateType("");
    seFilterDate("");
  }

  const handleApply = (range) => {
    let data = range;
    if (Array.isArray(data)) {
      data = `${moment(data[0].startDate).format("DD/MM/YYYY")}-${moment(
        data[0].endDate
      ).format("DD/MM/YYYY")}`;
    } else {
      data = moment(data).format("DD/MM/YYYY");
    }
    seFilterDate(data);
    headerData.handleDurationChange({ type: dateType, value: range });
  };

  // Update URL function
  function addDataToURL(data) {
    const searchParams = new URLSearchParams(window.location.search);
    // Iterate over the data object and append each key-value pair to the URL
    Object.keys(data).forEach((key) => {
      searchParams.set(key, data[key]);
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
    if (data?.newValue) {
      setState(data.newValue);
      getAddressData({
        type: "district",
        params: { stateId: data.newValue._id },
      });
      addDataToURL({ stateId: data.newValue._id, state: data.newValue.name });
    } else {
      setState("");
    }
    headerData.handleState(data?.newValue || "");
  };

  const emitDistrictChange = (data) => {
    addDataToURL(data?.newValue || {});

    if (data?.newValue) {
      getAddressData({
        type: "tehsil",
        params: { districtId: data?.newValue?._id },
      });
    }
    headerData.handleDistrictChange(data?.newValue || {});
  };

  const emitTehsilChange = (data) => {
    addDataToURL(data?.newValue || {});
    if (data?.newValue) {
      getAddressData({
        type: "gram",
        params: {
          tehsilId: data.newValue?._id,
          showHidden: true,
          display: "Gram",
        },
      });
    }
    headerData.handleDistrictChange(data?.newValue || {});
  };
  const emitGramChange = (data) => {
    addDataToURL(data?.newValue || {});
    headerData.handleDistrictChange(data?.newValue || {});
  };

  const emitStatusChange = (data) => {
    addDataToURL({ status: data?.newValue?.label || "" } || {});
    headerData.handleStatusChange(data?.newValue || {});
  };

  const emitCreatedByChange = (data) => {
    addDataToURL(data?.newValue || {});
    headerData.handleCreatedBYChange(data.newValue);
  };

  const emitDurationChange = (data) => {
    if (data.target.value === "CUSTOM" || data.target.value === "CUSTOM DATE") {
      setDateType(data.target.value);
      setIsDatePickerOpened(true);
    } else {
      addDataToURL({ duration: data.target.value });
      setDuration(data.target.value);
      headerData.handleDurationChange(data.target.value);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    addDataToURL({ search: term });
    headerData.handleSearch(term);
  };

  function getAddressData(payload) {
    common.getAddressData(payload).then((data) => {
      if (payload?.type == "tehsil" && !data?.error) {
        setTehsilOption(data || []);
      } else if (payload?.type == "district" && !data?.error) {
        setDistrictOption(data);
      } else if (payload?.type == "gram" && !data?.error) {
        setGramOption(data || []);
      }
    });
  }

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
              onLoadFocus={true}
              emitSearchChange={handleSearch}
            />
          </Box>

          <Box sx={{ mx: 1, minWidth: 130 }}>
            <CustomAutocompleteDropDown
              emitAutoCompleteChange={emitStateChange}
              value={state}
              inputValue={state.label}
              options={headerData.stateDropdownOptions.map((option) => {
                const { labelKey, codeKey } = headerData?.stateKeyMap;
                return {
                  ...option,
                  label: option[labelKey],
                  ...(codeKey && { code: option[codeKey] }),
                };
              })}
              label="State"
            />
          </Box>

          {!isEmpty(districtOption) && !isEmpty(state) && (
            <Box sx={{ mx: 1, minWidth: 130 }}>
              <CustomAutocompleteDropDown
                emitAutoCompleteChange={emitDistrictChange}
                options={districtOption.map((option) => {
                  const { labelKey, codeKey } = headerData?.districtKeyMap;
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
              />
            </Box>
          )}

          {!isEmpty(gramOption) && (
            <Box sx={{ mx: 1, minWidth: 160 }}>
              <CustomAutocompleteDropDown
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
              />
            </Box>
          )}

          {selectedCard === "totalCards" && (
            <Box sx={{ mx: 1, minWidth: 140 }}>
              <CustomAutocompleteDropDown
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
              />
            </Box>
          )}

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

          <Box sx={{ mx: 1, minWidth: 130 }}>
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

            <FormControl variant="standard" fullWidth>
              <InputLabel id="duration-select-label">Duration</InputLabel>
              <Select
                value={
                  !["CUSTOM DATE", "CUSTOM"].includes(dateType)
                    ? duration
                    : dateType
                }
                labelId="duration-select-label"
                id="duration-select"
                onChange={emitDurationChange}
              >
                {headerData.durationOptions.map((option, index) => (
                  <MenuItem key={index} value={option}>
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
      </Grid>
      {filterDate && (
        <Box sx={{ mt: 2 }}>
          {getCardStack({
            filter: dateType,
            setFilter: setDateType,
            date: filterDate,
          })}
        </Box>
      )}
    </Grid>
  );
};

export default Header;
