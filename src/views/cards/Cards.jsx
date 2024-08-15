import React, { useEffect, useState } from "react";
import Header from "./Header";
import { Grid, Typography, Button, useTheme, Box } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import Checkbox from "@mui/material/Checkbox";
import CustomTable from "../../components/CustomTable";
import { tokens } from "../../theme";
import IconButton from "@mui/material/IconButton";
import cards from "../../services/cards";
import common from "../../services/common";
import { isEmpty } from "lodash";
import PrintIcon from "@mui/icons-material/Print";
import { useNavigate } from "react-router-dom";
import ArogyamComponent from "../../components/ArogyaCard";
import Tooltip from "@mui/material/Tooltip";
import downloadCards from "../../utils/downloadCards";
import Fab from "@mui/material/Fab";
import CheckIcon from "@mui/icons-material/Check";

let typingTimer;

const tableHeaders = [
  { label: "SNO", key: "s_no" },
  { label: "NAME", key: "name" },
  { label: "F/H NAME", key: "father_husband_name" },
  { label: "UID", key: "unique_number" },
  { label: "GENDER", key: "gender" },
  {
    label: "AGE",
    key: "birth_year",
    isFunction: true,
  },
  { label: "MOB NO.", key: "phone" },
  { label: "BLOOD", key: "blood_group" },
  { label: "CREATED BY", key: "created_by_uid" },
  { label: "CREATED ON", key: "created_at" },
  { label: "EXPIRY", key: "expiry_date" },
  { label: "STATUS", key: "status" },
  { label: "ACTION" },
];

const actions = [
  // {
  //   label: "Edit",
  //   icon: <EditIcon />,
  //   smallIcon: <EditIcon sx={{ fontSize: "19px !important" }} />,
  //   // handler: (row) => console.log("Edit row:", row),
  // },
  {
    label: "Download",
    icon: <DownloadIcon />,
    smallIcon: <DownloadIcon sx={{ fontSize: "18px !important" }} />,
    handler: (row) => {
      console.log("Download row:", row);
      downloadCards.downloadSingleCard({
        Element: <ArogyamComponent showCardTag cardData={row} />,
        cardData: row,
      });
    },
  },
  // {
  //   label: "Reprint",
  //   icon: <PrintIcon />,
  //   smallIcon: <PrintIcon sx={{ fontSize: "18px !important" }} />,
  //   // handler: (row) => console.log("Download row:", row),
  // },
  // Add more actions as needed
];

// CheckBox Row And Table
const TableWithCheckBox = ({
  firtsData,
  dataLength,
  colors,
  groupedData,
  actions,
  id,
  checkBoxClicked,
  isCheckBoxChecked = false,
  isImageMode = false,
}) => {
  const [checkBox, setCheckBox] = useState(false);
  const navigate = useNavigate();
  const [isDownloadCompleted, setIsDownloadCompleted] = useState(false);

  const handleRowClick = (row) => {
    navigate(`${row._id}`);
  };

  useEffect(() => {
    setCheckBox(isCheckBoxChecked);
  }, [isCheckBoxChecked]);
  return (
    <Grid container>
      <Grid item xs={12}>
        <Button sx={{ width: "100%", justifyContent: "start" }}>
          <Grid
            container
            justifyContent="space-between"
            onClick={() => {
              setCheckBox(!checkBox);
              checkBoxClicked(id, !checkBox);
            }}
          >
            <Grid item>
              <Checkbox
                checked={checkBox}
                onChange={() => {
                  setCheckBox(!checkBox);
                  checkBoxClicked(id, !checkBox);
                }}
              />
              <Typography
                sx={{ display: "inline-flex", mr: 1, color: "black" }}
              >
                {firtsData?.created_by_name && `${firtsData?.created_by_name}`}
                {`(${firtsData?.created_by_uid})`}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  display: "inline-flex",
                  mr: 1,
                  color: "black",
                  fontWeight: 600,
                }}
              >
                {`#${dataLength}`}
              </Typography>
            </Grid>
            <Grid item display="flex" alignItems="center">
              <Typography
                sx={{
                  mr: {
                    lg: 2,
                    md: 2,
                    textTransform: "none",
                    color: "Black",
                  },
                }}
              >
                (Page)
              </Typography>
              <Button
                sx={{ color: colors.primary[500] }}
                startIcon={<DownloadIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  downloadCards.downloadMultipleCard({
                    cardData: groupedData,
                    Element: ArogyamComponent,
                    handleDownloadCompleted: () => setIsDownloadCompleted(true),
                  });
                }}
              >
                Download
              </Button>
              {isDownloadCompleted && (
                <Typography
                  variant="h6"
                  sx={{
                    display: "inline-flex",
                    paddingBottom: 0,
                    color: colors.primary[500],
                    py: 1,
                  }}
                >
                  <CheckIcon />
                  Mark Printed
                </Typography>
              )}
            </Grid>
          </Grid>
        </Button>
      </Grid>
      {isImageMode ? (
        <Box sx={{ width: "100%" }}>
          {groupedData.map((cardData, index) => {
            return (
              <ArogyamComponent
                key={cardData._id + index + "ImageMode"}
                cardData={cardData}
                enableClick={true}
                handleClick={handleRowClick}
              />
            );
          })}
        </Box>
      ) : (
        <Grid item xs={12} sx={{ mb: 3 }}>
          <CustomTable
            headers={tableHeaders}
            rows={groupedData}
            actions={actions}
            rowClick={handleRowClick}
          />
        </Grid>
      )}
    </Grid>
  );
};

// Extra Elements
const TableWithExtraElements = ({
  groupName = "",
  groupedData = {},
  isImageMode,
  handleMultipleCheckBox,
  isDownloadCompleted = {},
  setIsDownloadCompleted,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [districtCheckbox, setDistrictCheckbox] = useState(false);
  const [tableCheckedBox, setTableCheckedBox] = useState({});

  const getGroupDataLenght = () => {
    return Object.keys(groupedData).reduce(
      (value, key) => groupedData[key]?.length + value,
      0
    );
  };

  useEffect(() => {
    if (isDownloadCompleted) {
      setDistrictCheckbox(false);
      if (Object.keys(groupedData)) {
        const newCheckedBox = {};
        Object.keys(groupedData).forEach((key) => (newCheckedBox[key] = false));
        setTableCheckedBox(newCheckedBox);
      }
    }
  }, [isDownloadCompleted]);

  useEffect(() => {
    if (Object.keys(groupedData)) {
      const newCheckedBox = {};
      Object.keys(groupedData).forEach((key) => (newCheckedBox[key] = false));
      setTableCheckedBox(newCheckedBox);
    }
  }, []);

  return (
    <Grid container sx={{ mx: 2 }} rowGap={2}>
      <Grid item xs={12} alignItems="cenetr">
        <Button
          sx={{ background: colors.grey[100], px: 1 }}
          startIcon={
            <Checkbox
              checked={
                districtCheckbox
                // Object.entries(tableCheckedBox).some(
                //   ([key, value]) => value === true
                // )
              }
              indeterminate={
                Object.entries(tableCheckedBox).every(
                  ([key, value]) => value === true
                ) !=
                Object.entries(tableCheckedBox).some(
                  ([key, value]) => value === true
                )
              }
            />
          }
          onClick={() => {
            setDistrictCheckbox(!districtCheckbox);
            if (!districtCheckbox) {
              handleMultipleCheckBox({
                type: "all",
                value: Object.keys(groupedData),
                groupName,
              });
            }

            if (!!districtCheckbox) {
              handleMultipleCheckBox({ type: "all", value: [], groupName });
            }

            // reset value
            const newCheckedBox = {};
            Object.keys(tableCheckedBox).forEach(
              (key) => (newCheckedBox[key] = !districtCheckbox)
            );
            setTableCheckedBox(newCheckedBox);
          }}
        >{`${groupName} (Total: ${getGroupDataLenght()})`}</Button>
        <Tooltip title="Download full tehsil">
          <IconButton
            aria-label="Download full tehsil"
            sx={{
              color: colors.primary[500],
            }}
            onClick={() => {
              downloadCards.downloadMultipleCardWithMultipleAgent({
                Element: ArogyamComponent,
                cardData: groupedData,
                handleDownloadCompleted: () => {
                  setIsDownloadCompleted({ [groupName]: true });
                },
              });
            }}
          >
            <DownloadIcon />
          </IconButton>
        </Tooltip>
        {isDownloadCompleted[groupName] && (
          <Typography
            variant="h6"
            sx={{
              display: "inline-flex",
              paddingBottom: 0,
              color: colors.primary[500],
              py: 1,
            }}
          >
            <CheckIcon />
            MARK PRINTED
          </Typography>
        )}
      </Grid>

      {Object.keys(groupedData).map((key, index) => {
        const [firtsData] = groupedData[key];
        const dataLength = groupedData[key].length;
        return (
          <TableWithCheckBox
            key={key + index + dataLength}
            firtsData={firtsData}
            dataLength={dataLength}
            colors={colors}
            groupedData={groupedData[key]}
            id={key}
            actions={actions}
            isCheckBoxChecked={tableCheckedBox[key]}
            checkBoxClicked={(id, value) => {
              handleMultipleCheckBox({
                type: value ? "add" : "remove",
                value: key,
                groupName,
              });
              let isEveryValueFalse = true;
              Object.keys(groupedData).forEach((lockey) => {
                if (key != lockey) {
                  isEveryValueFalse = !tableCheckedBox[lockey];
                } else {
                  isEveryValueFalse = !value;
                }
              });
              if (isEveryValueFalse) {
                setDistrictCheckbox(false);
              }

              let isEveryValueTrue = false;
              Object.keys(groupedData).forEach((lockey) => {
                if (key != lockey) {
                  isEveryValueTrue = tableCheckedBox[lockey];
                } else {
                  isEveryValueTrue = value;
                }
              });
              if (isEveryValueTrue) {
                setDistrictCheckbox(true);
              }
              setTableCheckedBox({
                ...tableCheckedBox,
                [key]: value,
              });
            }}
            isImageMode={isImageMode}
            isDownloadCompleted={isDownloadCompleted || {}}
          />
        );
      })}
    </Grid>
  );
};

const Cards = () => {
  const [stateDropdownOptions, setStateDropdownOptions] = useState([]);
  const [userDropdownOptions, setUserDropdownOptions] = useState([]);
  const [totalCardsAndToBePrinted, setTotalCardsAndToBePrinted] = useState({
    totalCards: 0,
    toBePrinted: 0,
  });
  const [cardsDataGroupedBy, setCardsDataGroupBy] = useState({});
  const [totalCardsData, setTotalCardsData] = useState([]);
  const [selectedCard, setSelectedCard] = useState("toBePrinted");
  const [state, setState] = useState("");
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [duration, setDuration] = useState("");
  const [status, setStatus] = useState("");
  const [districtOption, setDistrictOption] = useState([]);
  const [downloadCardMaps, setDownloadCardMaps] = useState({});
  const [isDownloadCompleted, setIsDownloadCompleted] = useState({});
  // const [cardsToDownload, setCardsToDownload] = useState({});
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // view mode state
  const [isImageMode, setIsImageMode] = useState(false);
  const navigate = useNavigate();
  const handleRowClick = (row) => {
    navigate(`${row._id}`);
  };

  const handleMultipleCheckBox = (data) => {
    if (data.type == "all") {
      setDownloadCardMaps({
        ...downloadCardMaps,
        [data.groupName]: data.value,
      });
    }
    if (data.type == "add") {
      const newObject = [].concat(downloadCardMaps?.[data.groupName] || []);
      newObject.push(data.value);
      setDownloadCardMaps({
        ...downloadCardMaps,
        [data.groupName]: newObject,
      });
    }
    if (data.type == "remove") {
      const tempObj = { ...downloadCardMaps };
      let newObject = [].concat(downloadCardMaps?.[data.groupName] || []);
      newObject = newObject.filter((key) => key != data.value);
      if (!newObject.length) {
        delete tempObj[data.groupName];
        setDownloadCardMaps({
          ...tempObj,
        });
      } else {
        setDownloadCardMaps({
          ...downloadCardMaps,
          [data.groupName]: newObject,
        });
      }
    }
  };

  const getTableData = ({
    search = null,
    state = null,
    district = null,
    duration,
    created_by,
    _status,
  } = {}) => {
    // fetch cards data
    cards
      .getCardsData({
        ...(selectedCard === "totalCards" && { _status }),
        ...(selectedCard === "toBePrinted" && { _status: "SUBMITTED" }),
        ...(search && { q: search }),
        ...(state && { state: state }),
        ...(district && { district }),
        ...(duration && { duration }),
        ...(created_by && { created_by }),
        selectedCard,
      })
      .then((data) => {
        if (!isEmpty(data)) {
          // debugger;
          if (selectedCard === "toBePrinted") {
            setCardsDataGroupBy(data.groupedData);
            setTotalCardsAndToBePrinted({
              totalCards: data.totalCards,
              toBePrinted: data.totalPrintedCards,
            });
            const ids = new Set();
            Object.keys(data.groupedData).forEach((key) => {
              const keyArray = Object.keys(data.groupedData[key]);
              keyArray.forEach((id) => ids.add(id));
            });
            cards.getUsersByIds({ ids }).then((users) => {
              setUserDropdownOptions(users);
            });
          } else {
            setTotalCardsData(data.groupedData);
          }
          setTotalCardsAndToBePrinted({
            totalCards: data.totalCards,
            toBePrinted: data.totalPrintedCards,
          });
        } else {
          setCardsDataGroupBy([]);
        }
      });
  };

  const getDistrictData = ({ stateId }) => {
    cards.getDistrictData({ stateId }).then((data) => {
      setDistrictOption(data);
    });
  };

  const handleSearch = (value) => {
    if (value === "") {
      getTableData();
    }
    setSearch(value);
    if (!/^\s*$/.test(value)) {
      clearTimeout(typingTimer);
      typingTimer = setTimeout(function () {
        getTableData({ search: value });
      }, 1500);
    }
  };

  const handleState = (value) => {
    setState(value || {});
    getTableData({ state: value.name });
    getDistrictData({ stateId: value._id });
  };

  const handleDistrictChange = (data) => {
    setDistrict(data.name || "");
    getTableData({ q: search, state: state.name, district: data?.name || "" });
  };

  const handleCreatedBYChange = (data) => {
    setCreatedBy(data || "");
    getTableData({
      created_by: data?._id,
      q: search,
      state: state?.name,
      district: data?.name || "",
    });
  };
  const handleDurationChange = (data) => {
    setDuration(data || "");
    getTableData({
      created_by: createdBy._id,
      duration: data,
      q: search,
      state: state.name,
      district: district?.name || "",
    });
  };

  const handleRefresh = () => {
    getTableData({
      created_by: createdBy._id,
      duration: duration,
      q: search,
      state: state.name,
      district: district?.name || "",
    });
  };

  const handleStatusChange = (data) => {
    setStatus(data?.label);
    getTableData({
      created_by: createdBy._id,
      duration: duration,
      q: search,
      state: state.name,
      district: district?.name || "",
      _status: data?.label || "",
    });
  };

  const handleGroupCardsDownload = () => {
    const cardsToDownload = {};
    const _isDownloadCompleted = {};
    // setIsDownloadCompleted
    console.log("downloadCardMaps", downloadCardMaps);
    console.log("cardsDataGroupedBy", cardsDataGroupedBy);

    Object.keys(downloadCardMaps).forEach((groupName) => {
      const selectedCardData = {};
      _isDownloadCompleted[groupName] = true;
      Object.keys(cardsDataGroupedBy[groupName]).forEach((key) => {
        if (downloadCardMaps[groupName].includes(key)) {
          _isDownloadCompleted[key] = true;
          selectedCardData[key] = cardsDataGroupedBy[groupName][key];
        }
      });
      cardsToDownload[groupName] = selectedCardData;
    });
    downloadCards.downloadMultipleLevelCardData({
      Element: ArogyamComponent,
      cardData: cardsToDownload,
      downloadCompleted: () => {
        setIsDownloadCompleted(_isDownloadCompleted);
      },
    });
  };

  useEffect(() => {
    // call state data
    common.getState().then((states) => {
      setStateDropdownOptions(states);
    });
  }, []);

  useEffect(() => {
    getTableData();
  }, [selectedCard]);

  return (
    <Grid component="main" sx={{ width: "94%" }}>
      <Grid item sx={{ mb: 2 }}>
        <Header
          totalCards={totalCardsAndToBePrinted.totalCards}
          toBePrinted={totalCardsAndToBePrinted.toBePrinted}
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
          statusOption={[
            { label: "SUBMITTED" },
            { label: "PRINTED" },
            { label: "UNDELIVERED" },
            { label: "DELIVERED" },
            { label: "DISCARDED" },
          ]}
          handleStatusChange={handleStatusChange}
          isImageMode={isImageMode}
          handleViewChange={() => setIsImageMode(!isImageMode)}
        />
        {Object.keys(downloadCardMaps).length && (
          <Fab
            sx={{
              position: "fixed",
              bottom: 30,
              right: 50,
              background: colors.primary[200],
              color: colors.primary[500],
            }}
            variant="extended"
            size="large"
            onClick={handleGroupCardsDownload}
          >
            <Typography variant="h6">Download</Typography>
          </Fab>
        )}
      </Grid>

      {selectedCard === "toBePrinted" ? (
        isEmpty(cardsDataGroupedBy) ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100vh", // Full viewport height
              width: "100%", // Full width
              textAlign: "center",
            }}
          >
            <Typography variant="h6" color="textSecondary">
              No Records Found
            </Typography>
          </Box>
        ) : (
          <Grid item sx={{ my: 1 }}>
            {Object.keys(cardsDataGroupedBy).map((key, index) => {
              return (
                <TableWithExtraElements
                  key={key + index}
                  groupName={key}
                  groupedData={cardsDataGroupedBy[key]}
                  isImageMode={isImageMode}
                  handleMultipleCheckBox={handleMultipleCheckBox}
                  isDownloadCompleted={isDownloadCompleted}
                  setIsDownloadCompleted={setIsDownloadCompleted}
                />
              );
            })}
          </Grid>
        )
      ) : isImageMode ? (
        <Box sx={{ width: "100%" }}>
          {totalCardsData.map((cardData, index) => {
            return (
              <ArogyamComponent
                key={cardData._id + index + "ImageMode"}
                cardData={cardData}
                enableClick={true}
                handleClick={handleRowClick}
              />
            );
          })}
        </Box>
      ) : (
        <Grid item sx={{ mx: 2 }}>
          <CustomTable
            headers={tableHeaders}
            rows={totalCardsData}
            actions={actions}
          />
        </Grid>
      )}
    </Grid>
  );
};

export default Cards;
