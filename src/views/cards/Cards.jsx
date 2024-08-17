import React, { useEffect, useState } from "react";
import Header from "./Header";
import { Grid, Typography, Button, useTheme, Box } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import Checkbox from "@mui/material/Checkbox";
import CustomTable from "../../components/CustomTable";
import { tokens } from "../../theme";
import IconButton from "@mui/material/IconButton";
import cards from "../../services/cards";
import common from "../../services/common";
import { isEmpty, sortBy } from "lodash";
import Badge from "@mui/material/Badge";
import Stack from "@mui/material/Stack";
import { useNavigate } from "react-router-dom";
import ArogyamComponent from "../../components/ArogyaCard_v1";
import Tooltip from "@mui/material/Tooltip";
import downloadCards from "../../utils/downloadCards";
import Fab from "@mui/material/Fab";
import CheckIcon from "@mui/icons-material/Check";
import storageUtil from "../../utils/storage.util";
import moment from "moment";

const images = {
  LogoImage: <img src="/v1cardImages/cardLogo.png" alt="Card Logo" />,
  Phone: (
    <img
      src="/v1cardImages/phone.png"
      alt="Phone"
      style={{ width: "10px", height: "10px", marginRight: "9px" }}
    />
  ),
  Loc: (
    <img
      src="/v1cardImages/loc.png"
      alt="Location"
      style={{ width: "10px", height: "10px", marginRight: "9px" }}
    />
  ),
  WaterMark: (
    <img
      src="/v1cardImages/waterMark.png"
      alt="Watermark"
      style={{
        width: "118px",
        right: "29px",
        position: "relative",
        bottom: "47px",
        "z-index": 0,
      }}
    />
  ),
  Support: (
    <img
      src="/v1cardImages/support.png"
      alt="support"
      style={{ width: "54px", height: "54px" }}
    />
  ),
};

let typingTimer;

const SupportImage = () => {
  return (
    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAMAAAC7IEhfAAAAV1BMVEVHcExWVWlaWW1PTmNPTmNPTmNPTmNhYHNvbn9PTmNQT2RcXG9UU2hWVWpSUWVXVmpRUGVVVWlXVmpYV2tUU2dRUGVXVmpTUmdTUmZSUWZXVmpRUGVOTWK6xRS/AAAAHHRSTlMAXybq++D3Dgbx1hZUHrx0y2pLQ4ikL32dlDixMiTPfAAAAfZJREFUOMvNVNuypCAMlJsCIoLcvOT/v3MRHGc8Oqf2Zau2H6Y00yZNJ6Rp/jG6ONnkfbIq9t9ZfPWGwAEhl6l75q1BANHLiJRC46IZUD09pbMEzIg573GMuOd8QJoKf0vKEyVj18SkJRGCMO0d50hC+Mm0VLoGz6fELHLLAQ0Lv+ojxDWThAuIbbCh6FI4wNhMBH6gzUFhPn1ahemwhBvE1MzwmdLnhDM8wHSObm+VnRFxLYWpphciRZ1h+CRiYjp/1ArXlJrP8Lbd0dCbEpd9Hy45CR6zrBcU+ChKfMk6bDnVi47yn2+3wY8lyuL+OqCNCZ82todmu39d0W/QtkXhywmOrdp/sp5WgIxHeDmqSJUppxMlRfVM14b31Wljh6ZBus4Ltzrt30xFqlgLcShaytn2R7XHIoHWncTyeCVKoC9iSfNELCZMYax6VEB7afVJPDSGp+tRXWurRr4d/X8g1obKob5Fsxdo0Z1XVFGmTscnhDSQsY5ohwd+tkxapPDlY5V7Y5LDvTKEhVorT0q67wid73zbEimO4chIIPFdjxPUu3He3kQlwD5ZkcpQ8LO0Y/dbXYvPIFJ3HgYx0MOXVZZnZVvrifHSgsZfl17KayqgNaolr6h5+GU/Op1dEiI3wCD++yadZsOYDKj/i607DH3zP+EP/z42JH14Mu8AAAAASUVORK5CYII=" />
  );
};

const LogoImage = () => {
  return (
    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAeCAYAAAA2Lt7lAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAIRSURBVHgB7VPNSxtBFH9vs7q7KSmh9IMUqSn0UApC6aHWnkJ77bmU9lQKLaGH2q800lLS9lA/EQUxQfADRETEP0BUAh707FnwAyF+R0VNNLszzqzZZIOzRu/7O8x78+a99/vNYwbAhQsXyJfdrkf3VFmRL1Jwe0sRxiUEfaMhOS8kyCaeLDA3COXUIPbfSWvXWdULh4QUUDqSkQ//7n2Z2TaJ4RIgBvkjy0dfGUFGmEBpgK2fNN077Y+F/DxkjkX9MHtXlJ9N1LGbQdCsBUho4dnF/JHXnhdofVatGxiSkLawa9xgoQeVmlTPbMzxBpn407dWc0TYAUIbnXJT36aWNn5MDrCB/C8EEV5x40iASH/btp029Y6gQCuK/dEco/DlZHrq3gE5VQ9IV46Nwy44B9eaQlWy5HnJ3AY+y9MyHBISbHXWXkUCv2yhZl94bl3U+GbT80E2vjd5+UUQ6FiNTrRw98yIrmjIC4L57aKSU/vAAZQYsZI9xTFAo2YtOllvxUoI0u0P/UAwYgu14cfkvhMB/1gINF5ohvTx0QGs2HNKCDRNeV2iPqXEoQwoys3MZE0foEr14mchwX5P7S1AKVIshH8YS+rlCNa+j/O/MlqoAykSaA3dP0NQQTxhZqot9dr7mV64II4J/mTqLTEqIZ5u66zwinJ6Lk4IGea+r9K3CZdAOjqxzFTXgAsXLoQ4AaqmomXW42E6AAAAAElFTkSuQmCC" />
  );
};

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
        Element: (
          <ArogyamComponent showCardTag cardData={row} images={images} />
        ),
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
  agentName,
  checkBoxClicked,
  isCheckBoxChecked = false,
  isImageMode = false,
  increaseDownloadCardCount,
}) => {
  const [checkBox, setCheckBox] = useState(false);
  const navigate = useNavigate();
  const [isDownloadCompleted, setIsDownloadCompleted] = useState(false);
  const [pageCount, setPageCount] = useState(1);

  const handleRowClick = (row) => {
    navigate(`${row._id}`);
  };

  const getPageCount = (total) => {
    let a = parseInt(total / 10);
    let rvalue = total - a * 10;
    if (rvalue === 0) {
      return a;
    } else {
      return a + 1;
    }
  };

  useEffect(() => {
    setCheckBox(isCheckBoxChecked);
    setPageCount(getPageCount(groupedData.length));
  }, [isCheckBoxChecked]);
  return (
    <Grid container>
      <Grid item xs={12}>
        <Button
          sx={{
            width: "100%",
            justifyContent: "start",
          }}
        >
          <Grid
            container
            justifyContent="space-between"
            onClick={() => {
              if (!checkBox) {
                increaseDownloadCardCount(dataLength);
              } else {
                increaseDownloadCardCount(-dataLength);
              }
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
                    mr: 1,
                    textTransform: "none",
                    color: "Black",
                  },
                }}
              >
                (Page {pageCount})
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
                    images: images,
                    agentDetails: { name: agentName, id },
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
        <Box sx={{ display: "inline-flex", flexWrap: "wrap" }}>
          {groupedData.map((cardData, index) => {
            return (
              <div style={{ marginRight: 2 }}>
                <ArogyamComponent
                  key={cardData._id + index + "ImageMode"}
                  cardData={cardData}
                  enableClick={true}
                  handleClick={handleRowClick}
                  images={images}
                />
              </div>
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
  increaseDownloadCardCount,
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

              increaseDownloadCardCount(
                Object.keys(groupedData).reduce((total, key) => {
                  if (tableCheckedBox[key]) {
                    return total;
                  }
                  return total + groupedData[key].length;
                }, 0)
              );
              console.log("tableCheckedBox", tableCheckedBox);
            }

            if (!!districtCheckbox) {
              handleMultipleCheckBox({ type: "all", value: [], groupName });
              increaseDownloadCardCount(
                -Object.keys(groupedData).reduce((total, key) => {
                  if (!tableCheckedBox[key]) {
                    return total;
                  }
                  return total + groupedData[key].length;
                }, 0)
              );
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
                images: images,
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
            agentName={firtsData?.created_by_name || ""}
            isImageMode={isImageMode}
            isDownloadCompleted={isDownloadCompleted || {}}
            increaseDownloadCardCount={increaseDownloadCardCount}
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
  const [downloadCardCount, setDownloadCardCount] = useState(0);
  // const [cardsToDownload, setCardsToDownload] = useState({});
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // view mode state
  const [isImageMode, setIsImageMode] = useState(false);
  const navigate = useNavigate();
  const handleRowClick = (row) => {
    console.log("row", row);

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

  const increaseDownloadCardCount = (value) => {
    const newCount = downloadCardCount + value;
    setDownloadCardCount(newCount);
  };

  const getTableData = ({
    search = null,
    state = null,
    district = null,
    duration,
    created_by,
    till_duration,
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
        ...(till_duration && { till_duration }),
        selectedCard,
      })
      .then((data) => {
        if (!isEmpty(data)) {
          // setIds
          if (data.idList) {
            storageUtil.setStorageData(data.idList, "cards_ids");
          }
          // debugger;
          if (selectedCard === "toBePrinted") {
            setCardsDataGroupBy(data.groupedData);
            setTotalCardsAndToBePrinted({
              totalCards: data.totalCards,
              toBePrinted: data.totalPrintedCards,
              totalPrintCardsShowing: data.totalPrintCardsShowing,
              totalShowing: data.totalShowing,
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
            totalPrintCardsShowing: data.totalPrintCardsShowing,
            totalShowing: data.totalShowing,
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
    let payloadDate;
    if (typeof data === "object") {
      if (data.type === "CUSTOM DATE") {
        payloadDate = {
          duration: moment(data.value).valueOf(),
          till_duration: moment().valueOf(),
        };
      }
      if (data.type === "CUSTOM") {
        const [date] = data.value;
        payloadDate = {
          duration: moment(date.endDate).valueOf(),
          till_duration: moment(date.startDate).valueOf(),
        };
      }
    }
    console.log("payloadDate", payloadDate);

    setDuration(data || "");
    getTableData({
      created_by: createdBy._id,
      duration: data,
      q: search,
      state: state.name,
      district: district?.name || "",
      ...(payloadDate && payloadDate),
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
      images: images,
    });
  };

  useEffect(() => {
    // call state data
    common.getAddressData().then((states) => {
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
        {Boolean(Object.keys(downloadCardMaps).length) && (
          <Stack
            spacing={2}
            direction="row"
            sx={{
              position: "fixed",
              bottom: 30,
              right: 50,
              alignItems: "center",
              zIndex: 2,
            }}
          >
            <Badge
              badgeContent={downloadCardCount}
              color="success"
              anchorOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
            >
              <Fab
                sx={{
                  background: colors.primary[200],
                  color: colors.primary[500],
                }}
                variant="extended"
                size="large"
                onClick={handleGroupCardsDownload}
              >
                <Typography variant="h6">Download</Typography>
              </Fab>
            </Badge>
          </Stack>
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
                  increaseDownloadCardCount={increaseDownloadCardCount}
                />
              );
            })}
          </Grid>
        )
      ) : isImageMode ? (
        <Box sx={{ display: "flex", flexWrap: "wrap" }}>
          {totalCardsData.map((cardData, index) => {
            return (
              <div style={{ marginRight: 2 }}>
                <ArogyamComponent
                  key={cardData._id + index + "ImageMode"}
                  cardData={cardData}
                  enableClick={true}
                  handleClick={handleRowClick}
                  images={images}
                />
              </div>
            );
          })}
        </Box>
      ) : (
        <Grid item sx={{ mx: 2 }}>
          <CustomTable
            headers={tableHeaders}
            rows={totalCardsData}
            actions={actions}
            rowClick={handleRowClick}
          />
        </Grid>
      )}
    </Grid>
  );
};

export default Cards;
