import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import {
  Grid,
  Typography,
  Button,
  useTheme,
  Box,
  Card,
  Link,
} from "@mui/material";
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
import {
  useNavigate,
  useSearchParams,
  useLocation,
  useParams,
} from "react-router-dom";
import ArogyamComponent from "../../components/ArogyaCard_v1";
import Tooltip from "@mui/material/Tooltip";
import downloadCards from "../../utils/downloadCards";
import Fab from "@mui/material/Fab";
import CheckIcon from "@mui/icons-material/Check";
import storageUtil from "../../utils/storage.util";
import moment from "moment";
import cardService from "../../services/cards";
import TablePagination from "@mui/material/TablePagination";
import LinearIndeterminate from "../../components/LinearProgress";
import LoadingScreen from "../../components/LaodingScreenWithWhiteBG";

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
  { label: "SNO", key: "index" },
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
  // { label: "BLOOD", key: "blood_group" },
  { label: "CREATED BY", key: "created_by_name" },
  { label: "CREATED ON", key: "created_at" },
  // { label: "EXPIRY", key: "expiry_date" },
  { label: "STATUS", key: "status", sort: true },
  { label: "", key: "ACTION" },
];

const actions = [
  // {
  //   label: "Download",
  //   icon: <DownloadIcon />,
  //   smallIcon: <DownloadIcon sx={{ fontSize: "18px !important", p: 0 }} />,
  //   handler: (row) => {
  //     downloadCards.downloadSingleCard({
  //       Element: (
  //         <ArogyamComponent showCardTag cardData={row} images={images} />
  //       ),
  //       cardData: row,
  //     });
  //   },
  // },
  // {
  //   label: "Reprint",
  //   icon: <PrintIcon />,
  //   smallIcon: <PrintIcon sx={{ fontSize: "18px !important" }} />,
  //   // handler: (row) => console.log("Download row:", row),
  // },
  // Add more actions as needed
];

function markAsPrint({ ids = [] }) {
  return cardService.markAsPrint(ids.join(","));
}

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
  handleMenuSelect,
  setMarkAsPrintPending,
  handleSort,
  setIsCardDownload,
  // highlightedRow,
}) => {
  const [checkBox, setCheckBox] = useState(false);
  const navigate = useNavigate();
  const [isDownloadCompleted, setIsDownloadCompleted] = useState(false);
  const [pageCount, setPageCount] = useState(1);

  const handleRowClick = (row) => {
    storageUtil.setStorageData(row._id, "highlightedRow");
    navigate(`${row._id}`);
  };

  const highlightedRow = storageUtil.getStorageData("highlightedRow");

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
              <Link
                onClick={(e) => {
                  console.log("Clicked ");
                  e.stopPropagation();
                  navigate(`/field-executives/${firtsData?.created_by_uid}`);
                }}
              >
                <Typography
                  sx={{ display: "inline-flex", mr: 1, color: "black" }}
                >
                  {firtsData?.created_by_name &&
                    `${firtsData?.created_by_name}`}
                  {`(${firtsData?.created_by_uid})`}
                </Typography>
              </Link>
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
              {/* <Typography
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
              </Typography> */}
              <Button
                sx={{ color: colors.primary[500] }}
                startIcon={<DownloadIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("groupedData", groupedData);
                  setIsCardDownload(true);
                  downloadCards.downloadMultipleCard({
                    cardData: groupedData,
                    Element: ArogyamComponent,
                    handleDownloadCompleted: () => {
                      setIsCardDownload(false);
                      setIsDownloadCompleted(true);
                    },
                    images: images,
                    agentDetails: { name: agentName, id },
                  });
                  setMarkAsPrintPending((pre) => ({ ...pre, [id]: true }));
                }}
              >
                Download
              </Button>
              {isDownloadCompleted && (
                <Button
                  sx={{
                    display: "inline-flex",
                    paddingBottom: 0,
                    color: colors.primary[500],
                    alignItems: "center",
                    py: 1,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsPrint({ ids: groupedData.map((gd) => gd._id) }).then(
                      () => {
                        setIsDownloadCompleted(false);
                        setMarkAsPrintPending((pre) => {
                          delete pre[id];
                          return pre;
                        });
                      }
                    );
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <CheckIcon />
                    Mark Printed
                  </Typography>
                </Button>
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
            handleMenuSelect={handleMenuSelect}
            highlightedRow={highlightedRow}
            handleSort={handleSort}
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
  handleMenuSelect,
  highlightedRow,
  setIsPaginationEnabled,
  setMarkAsPrintPending,
  markAsPrintPending,
  handleSort,
  setIsCardDownload,
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
              setIsCardDownload(true);
              const splitName = groupName.split("/");
              const districtName = splitName[splitName.length - 1];
              downloadCards.downloadMultipleCardWithMultipleAgent({
                Element: ArogyamComponent,
                cardData: groupedData,
                handleDownloadCompleted: () => {
                  const keys = {};
                  Object.keys(groupedData).forEach((key) => {
                    keys[key] = true;
                  });
                  setIsCardDownload(false);
                  setIsDownloadCompleted({ [groupName]: true });
                  setMarkAsPrintPending((pre) => ({ ...pre, ...keys }));
                },
                images: images,
                districtName,
              });
            }}
          >
            <DownloadIcon />
          </IconButton>
        </Tooltip>
        {isDownloadCompleted[groupName] && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              let ids = [];
              let keys = [];
              Object.keys(groupedData).forEach((key) => {
                keys.push(key);
                if (isDownloadCompleted[groupName]) {
                  const data = groupedData[key];
                  console.log("key", key);
                  ids = [...ids, ...data.map((a) => a._id)];
                }
              });
              setMarkAsPrintPending((pre) => {
                keys.forEach((id) => {
                  delete pre[id];
                });
                return pre;
              });
              markAsPrint({ ids }).then(() => {
                setIsDownloadCompleted({});
              });
            }}
          >
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
          </Button>
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
            highlightedRow={highlightedRow}
            handleMenuSelect={handleMenuSelect}
            agentName={firtsData?.created_by_name || ""}
            isImageMode={isImageMode}
            isDownloadCompleted={isDownloadCompleted || {}}
            increaseDownloadCardCount={increaseDownloadCardCount}
            setMarkAsPrintPending={setMarkAsPrintPending}
            markAsPrintPending={markAsPrintPending}
            handleSort={handleSort}
            setIsCardDownload={setIsCardDownload}
          />
        );
      })}
    </Grid>
  );
};

const Cards = () => {
  const [userDropdownOptions, setUserDropdownOptions] = useState([]);
  const [totalCardsAndToBePrinted, setTotalCardsAndToBePrinted] = useState({
    totalCards: 0,
    toBePrinted: 0,
  });
  const [cardsDataGroupedBy, setCardsDataGroupBy] = useState({});
  const [totalCardsData, setTotalCardsData] = useState([]);
  const [selectedCard, setSelectedCard] = useState("");
  const [status, setStatus] = useState(null);
  const [downloadCardMaps, setDownloadCardMaps] = useState({});
  const [isDownloadCompleted, setIsDownloadCompleted] = useState({});
  const [downloadCardCount, setDownloadCardCount] = useState(0);
  const [tehsilCounts, setTehsilCounts] = useState({});
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [isPaginationEnabled, setIsPaginationEnabled] = useState(false);
  const [markAsPrintPending, setMarkAsPrintPending] = useState({});
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isCardDownloading, setIsCardDownload] = useState(false);

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const highlightedRow = storageUtil.getStorageData("highlightedRow");
  let [urlDateType, setUrlDateType] = useSearchParams();
  const location = useLocation();
  const params = useParams();

  // view mode state
  const [isImageMode, setIsImageMode] = useState(false);
  const navigate = useNavigate();
  const handleRowClick = (row) => {
    storageUtil.setStorageData(row._id, "highlightedRow");
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

  const restoreScroll = () => {
    const searchParams = new URLSearchParams(window.location.search).get("tab");
    const scrollValue = storageUtil.getStorageData(
      `${location.pathname}-${searchParams}`
    );
    console.log("scrollValue", scrollValue);

    if (scrollValue) {
      window.scrollTo({
        top: scrollValue,
        behavior: "smooth",
      });
    }
  };

  const getTableData = async ({
    search = null,
    state = null,
    district = null,
    duration,
    created_by,
    gram_p,
    tehsil,
    till_duration,
    _status,
    _page,
    sortBy,
  } = {}) => {
    // fetch cards data
    const cId = urlDateType.get("createdById");
    // const tab = urlDateType.get("tab");
    const page = Number(urlDateType.get("page"));

    if (page > 0) {
      setPage(page);
      _page = page;
    }
    setIsPageLoading(true);
    const data = await cards.getCardsData({
      ...(selectedCard === "totalCards" && {
        _status: _status,
      }),
      ...(selectedCard === "toBePrinted" && { _status: "SUBMITTED" }),
      page: _page,
      ...(search && { q: search }),
      ...(gram_p && { gram_p: gram_p }),
      ...(state && { state: state }),
      ...(district && { district }),
      ...(duration && { duration }),
      ...(tehsil && { tehsil }),
      ...(sortBy && { sortBy }),
      ...((created_by || cId) && { created_by: created_by || cId }),
      ...(till_duration && { till_duration }),
      selectedCard,
    });
    if (!isEmpty(data)) {
      if (data.idList) {
        storageUtil.setStorageData(data.idList, "cards_ids");
      }
      if (selectedCard === "toBePrinted") {
        setCardsDataGroupBy(data.groupedData);
        setTotalCardsAndToBePrinted({
          totalCards: data.totalCards,
          toBePrinted: data.totalPrintedCards,
          totalPrintCardsShowing: data.totalPrintCardsShowing,
          totalShowing: data.totalShowing,
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
      setPageCount(data?.totalShowing || 0);
      setTehsilCounts(data.tehsilCounts || {});
      setIsPageLoading(false);
      setTimeout(() => {
        restoreScroll();
      }, 10);
    } else {
      setCardsDataGroupBy([]);
      setIsPageLoading(false);
    }
  };

  const getUsersList = async () => {
    const userList = await cardService.getUsersList();
    setUserDropdownOptions(userList);
  };

  const handleSort = ({ colName, type }) => {
    if (type === "des") {
      getTableData({ sortBy: colName });
    } else {
      getTableData({});
    }
  };

  const handleMenuSelect = async (item, selectedCard) => {
    const updatedCardData = await cardService.changeStatus(
      { status: item },
      selectedCard._id
    );
    getTableData({ _status: status });
  };

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

  const handleGroupCardsDownload = () => {
    setIsCardDownload(true);
    const cardsToDownload = {};
    const _isDownloadCompleted = {};
    // setIsDownloadCompleted

    let keys = [];
    Object.keys(downloadCardMaps).forEach((groupName) => {
      const selectedCardData = {};
      _isDownloadCompleted[groupName] = true;
      keys = downloadCardMaps[groupName].concat(keys);
      Object.keys(cardsDataGroupedBy[groupName]).forEach((key) => {
        if (downloadCardMaps[groupName].includes(key)) {
          _isDownloadCompleted[key] = true;
          selectedCardData[key] = cardsDataGroupedBy[groupName][key];
        }
      });
      cardsToDownload[groupName] = selectedCardData;
    });
    const markAsPending = {};
    keys.forEach((key) => {
      markAsPending[key] = true;
    });
    setMarkAsPrintPending((pre) => ({ ...pre, ...markAsPending }));

    downloadCards.downloadMultipleLevelCardData({
      Element: ArogyamComponent,
      cardData: cardsToDownload,
      downloadCompleted: () => {
        setIsCardDownload(false);
        setIsDownloadCompleted(_isDownloadCompleted);
      },
      images: images,
    });
    setIsPaginationEnabled(true);
    setDownloadCardMaps({});
    setDownloadCardCount(0);
  };

  useEffect(() => {
    // if (!isEmpty(cardsDataGroupedBy)) {
    getUsersList();
    const searchParams = new URLSearchParams(window.location.search).get("tab");
    const handleScroll = () => {
      console.log("window.scrollY", window.scrollY);

      storageUtil.setStorageData(
        window.scrollY,
        `${location.pathname}-${searchParams}`
      );
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
    // }
  }, []);

  // useEffect(() => {
  //   const urls = setURLFilters();
  //   common.getAddressData().then((states) => {
  //     setStateDropdownOptions(states);
  //     if (urls?.stateId) {
  //       const _state = states?.find((state) => urls?.stateId === state._id);
  //       if (_state) {
  //         setState(_state);
  //       }
  //     }
  //   });
  // }, []);

  useEffect(() => {
    getTableData();
  }, [selectedCard]);

  return (
    <Grid component="main" sx={{ width: "96%" }}>
      <Grid item sx={{ mb: 2 }}>
        {isCardDownloading && <LoadingScreen />}
        <Header
          toTalScoreDetails={{
            totalScore: totalCardsAndToBePrinted?.totalCards || 0,
            totalScoreToshow: totalCardsAndToBePrinted?.totalShowing || 0,
            text: "Total Cards",
            name: "totalCards",
          }}
          secondaryTotalDetails={{
            secondaryTotalScore: totalCardsAndToBePrinted.toBePrinted,
            secondaryTotalScoreToshow:
              totalCardsAndToBePrinted.totalPrintCardsShowing,
            text: "To Be Printed",
            name: "toBePrinted",
          }}
          {...(selectedCard === "totalCards" && {
            statusOption: [
              { label: "SUBMITTED" },
              { label: "PRINTED" },
              { label: "UNDELIVERED" },
              { label: "DELIVERED" },
              { label: "DISCARDED" },
              { label: "RTO" },
            ],
          })}
          defaultSelectedCard="toBePrinted"
          showSecondaryScoreCard
          createdByOptions={userDropdownOptions || []}
          createdByKeyMap={{ labelKey: "name", codeKey: "uid" }}
          tehsilCounts={tehsilCounts}
          handleSelectCard={(n) => {
            setSelectedCard(n);
            // console.log("n", n);
            // getTableData({ selectedCard: n });
          }}
          isImageMode={isImageMode}
          handleViewChange={() => setIsImageMode(!isImageMode)}
          apiCallBack={getTableData}
          showState={selectedCard != "totalCards"}
        />
        {Boolean(Object.keys(downloadCardMaps).length) && (
          <Stack
            spacing={2}
            direction="row"
            sx={{
              position: "fixed",
              bottom: 60,
              right: 50,
              alignItems: "center",
              zIndex: 2,
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
              <Typography variant="h6">[</Typography>

              <Typography variant="h6">Download</Typography>
              <Typography variant="h6" sx={{ ml: 1, fontWeight: "600" }}>
                {downloadCardCount}
              </Typography>
              <Typography variant="h6">]</Typography>
            </Fab>
          </Stack>
        )}
      </Grid>
      <Box>
        {isPageLoading ? (
          <LinearIndeterminate />
        ) : (
          <>
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
                <Grid item sx={{ my: 1, mr: 2 }}>
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
                        handleMenuSelect={handleMenuSelect}
                        highlightedRow={highlightedRow}
                        setIsPaginationEnabled={setIsPaginationEnabled}
                        setMarkAsPrintPending={setMarkAsPrintPending}
                        markAsPrintPending={markAsPrintPending}
                        handleSort={handleSort}
                        setIsCardDownload={setIsCardDownload}
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
                  handleMenuSelect={handleMenuSelect}
                  highlightedRow={highlightedRow}
                  handleSort={handleSort}
                />
              </Grid>
            )}
            <Grid item xs={12} sx={{ height: "39px" }}>
              <Card
                sx={{
                  // position: "fixed",
                  bottom: "5px",
                  width: "100%",
                  right: "1px",
                }}
              >
                <TablePagination
                  component="div"
                  count={pageCount}
                  page={page}
                  disabled={Object.keys(markAsPrintPending).length}
                  rowsPerPage={100}
                  onPageChange={(e, newPage) => {
                    addDataToURL({ page: newPage });
                    setPage(newPage);
                    getTableData({ _page: newPage });
                  }}
                  onRowsPerPageChange={() => {}}
                />
              </Card>
            </Grid>
          </>
        )}
      </Box>
    </Grid>
  );
};

export default Cards;
