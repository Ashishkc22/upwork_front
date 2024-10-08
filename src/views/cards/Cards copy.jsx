import React, { useEffect, useState, memo } from "react";
import Header from "../../components/Header";
import { Grid, Typography, useTheme, Box, Card } from "@mui/material";
import CustomTable from "../../components/CustomTable";
import { tokens } from "../../theme";
import cards from "../../services/cards";
import { isEmpty } from "lodash";
import Stack from "@mui/material/Stack";
import {
  useNavigate,
  useSearchParams,
  useLocation,
  useParams,
} from "react-router-dom";
import ArogyamComponent from "../../components/ArogyaCard_v1";
import downloadCards from "../../utils/downloadCards";
import Fab from "@mui/material/Fab";
import storageUtil from "../../utils/storage.util";
import cardService from "../../services/cards";
import TablePagination from "@mui/material/TablePagination";
import LinearIndeterminate from "../../components/LinearProgress";
import LoadingScreen from "../../components/LaodingScreenWithWhiteBG";
import TableWithExtraElements from "./TableWithExtraElements";

const LogoImage = memo(() => (
  <img src="/v1cardImages/cardLogo.png" alt="Card Logo" />
));

const Phone = memo(() => (
  <img
    src="/v1cardImages/phone.png"
    alt="Phone"
    style={{ width: "10px", height: "10px", marginRight: "9px" }}
  />
));

const Loc = memo(() => (
  <img
    src="/v1cardImages/loc.png"
    alt="Location"
    style={{ width: "10px", height: "10px", marginRight: "9px" }}
  />
));

const WaterMark = memo(() => (
  <img
    src="/v1cardImages/waterMark.png"
    alt="Watermark"
    style={{
      width: "118px",
      right: "29px",
      position: "relative",
      bottom: "47px",
      zIndex: 0, // Changed from "z-index" to "zIndex" for correct React syntax
    }}
  />
));

const Support = memo(() => (
  <img
    src="/v1cardImages/support.png"
    alt="Support"
    style={{ width: "54px", height: "54px" }}
  />
));

// Storing all memoized components in an object
const images = {
  LogoImage: <LogoImage />,
  Phone: <Phone />,
  Loc: <Loc />,
  WaterMark: <WaterMark />,
  Support: <Support />,
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
      setDownloadCardMaps((pre) => {
        if (!data.value.length) {
          delete pre[data.groupName];
          return pre;
        }
        return {
          ...pre,
          [data.groupName]: data.value,
        };
      });
    }
    if (data.type == "add") {
      setDownloadCardMaps((pre) => {
        const newObject = [].concat(pre?.[data.groupName] || []);
        newObject.push(data.value);
        return {
          ...pre,
          [data.groupName]: newObject,
        };
      });
    }
    if (data.type == "remove") {
      // setDownloadCardMaps((pre) => {
      //   const tempObj = { ...downloadCardMaps };
      //   let newObject = [].concat(downloadCardMaps?.[data.groupName] || []);
      //   newObject = newObject.filter((key) => key != data.value);
      //   if (!newObject.length) {
      //     delete tempObj[data.groupName];
      //     return {
      //       ...tempObj,
      //     };
      //   } else {
      //     return {
      //       ...pre,
      //       [data.groupName]: newObject,
      //     };
      //   }
      // });

      setDownloadCardMaps((prev) => {
        // Destructure the previous state
        const { [data.groupName]: groupItems = [], ...rest } = prev;

        // Filter out the selected value
        const updatedGroupItems = groupItems.filter(
          (key) => key !== data.value
        );

        // If the updated group is empty, remove it; otherwise, update the group
        if (updatedGroupItems.length === 0) {
          return rest; // Remove the group entirely
        }

        return {
          ...prev,
          [data.groupName]: updatedGroupItems, // Update with the filtered group
        };
      });
    }
  };

  const increaseDownloadCardCount = (value) => {
    const newCount = downloadCardCount + value;
    setDownloadCardCount(newCount);
  };

  const restoreScroll = () => {
    const searchParams = new URLSearchParams(window.location.search).get("tab");
    const name = `${location.pathname}-${searchParams}`;
    const scrollValue = storageUtil.getStorageData(
      `${location.pathname}-${searchParams}`
    );
    console.log("scrollValue", scrollValue);
    console.log("name", name);

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
      setPageCount(data?.totalShowing);
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
    if (selectedCard) {
      getTableData();
    }
    const searchParams = new URLSearchParams(window.location.search).get("tab");
    console.log("searchParams", searchParams);

    const handleScroll = () => {
      storageUtil.setStorageData(
        window.scrollY,
        `${location.pathname}-${searchParams}`
      );
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [selectedCard, page]);

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
          }}
          isImageMode={isImageMode}
          handleViewChange={() => setIsImageMode(!isImageMode)}
          apiCallBack={getTableData}
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
                <Box sx={{ height: "20px" }}></Box>
              </Grid>
            )}
          </>
        )}
        <Grid item xs={12} sx={{ height: "39px" }}>
          <Card
            sx={{
              position: "fixed",
              bottom: "5px",
              width: "35%",
              right: "1px",
            }}
          >
            {page}
            <TablePagination
              component="div"
              count={pageCount}
              page={page}
              disabled={Object.keys(markAsPrintPending).length}
              rowsPerPage={100}
              onPageChange={(e, newPage) => {
                addDataToURL({ page: newPage });
                setPage(newPage);
              }}
              onRowsPerPageChange={() => {}}
            />
          </Card>
        </Grid>
      </Box>
    </Grid>
  );
};

export default Cards;
