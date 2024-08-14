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

const ScoreCard = ({
  value,
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
            {value}
          </Typography>
          <Typography fontSize={12} fontWeight={500} color="#00000059">
            {text}
          </Typography>
        </Box>
      </CardActionArea>
    </Card>
  );
};

const Header = (headerData) => {
  const navigate = useNavigate();
  const [selectedCard, setSelectedCard] = useState("toBePrinted");
  const [searchTerm, setSearchTerm] = useState();
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [duration, setDuration] = useState();

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
      addDataToURL({ stateId: data.newValue._id, state: data.newValue.name });
    } else {
      setState("");
    }
    headerData.handleState(data?.newValue || "");
  };

  const emitDistrictChange = (data) => {
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
    addDataToURL({ duration: data.target.value });
    setDuration(data.target.value);
    headerData.handleDurationChange(data.target.value);
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    addDataToURL({ search: term });
    headerData.handleSearch(term);
  };

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
            text="Total Cards"
            name="totalCards"
            bgcolor="#ffeee8"
            emitCardSelect={emitCardSelect}
            isCardSelected={selectedCard === "totalCards"}
          />
          <Divider orientation="vertical" flexItem sx={{ my: 3, mx: 2 }} />
          <ScoreCard
            value={headerData.toBePrinted}
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

          {!isEmpty(headerData?.selectedState) && (
            <Box sx={{ mx: 1, minWidth: 130 }}>
              <CustomAutocompleteDropDown
                emitAutoCompleteChange={emitDistrictChange}
                options={headerData.districtOption.map((option) => {
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
            <FormControl variant="standard" fullWidth>
              <InputLabel id="duration-select-label">Duration</InputLabel>
              <Select
                value={duration}
                labelId="duration-select-label"
                id="duration-select"
                onChange={emitDurationChange}
              >
                <MenuItem value={""}>none</MenuItem>
                {headerData.durationOptions.map((option, index) => (
                  <MenuItem key={index} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ mx: 1 }}>
            <IconButton onClick={() => {}} color="primary" aria-label="table">
              <TableChartIcon />
            </IconButton>

            <IconButton onClick={() => {}} color="primary" aria-label="refresh">
              <RefreshIcon onClick={() => headerData.handleRefresh()} />
            </IconButton>
          </Box>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Header;
