import React, { useEffect, useState, useRef, useContext } from "react";
import Header from "../../components/Header";
import {
  Grid,
  Typography,
  useTheme,
  Box,
  Card,
  Button,
  Paper,
} from "@mui/material";
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
import ArogyamComponent from "../../components/ArogyaCard_v2";
import downloadCards from "../../utils/downloadCards";
import Fab from "@mui/material/Fab";
import storageUtil from "../../utils/storage.util";
import cardService from "../../services/cards";
import TablePagination from "@mui/material/TablePagination";
import LinearIndeterminate from "../../components/LinearProgress";
import LoadingScreen from "../../components/LaodingScreenWithWhiteBG";
import TableWithExtraElements from "./TableWithExtraElements";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { UNSAFE_NavigationContext as NavigationContext } from "react-router-dom";
import LeavePageDialog from "./LeaveDialog";
import Backdrop from "@mui/material/Backdrop";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import waterMarkImg from "../../v1cardImages/waterMark.svg";
import supportImg from "../../v1cardImages/support.png";
import locImg from "../../v1cardImages/loc.png";
import phoneImg from "../../v1cardImages/phone.png";
import cardLogoImg from "../../v1cardImages/cardLogo.png";
import Slide from "@mui/material/Slide";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import CssBaseline from "@mui/material/CssBaseline";
import bin from "../../services/bin";
import { useCardContext } from "./context/CardContext";

// // Storing all memoized components in an object
const images = {
  waterMark: waterMarkImg,
  support: supportImg,
  loc: locImg,
  phone: phoneImg,
  logo: cardLogoImg,
};

const cardStatusList = [
  { label: "SUBMITTED" },
  { label: "PRINTED" },
  { label: "UNDELIVERED" },
  { label: "DELIVERED" },
  { label: "DISCARDED" },
  { label: "RTO" },
  { label: "PENDING" },
];

let useEffectTypingTimer;
let lastScrollValue = 0;

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
  // { label: "STATUS_UPDATE_DATE", key: "status_updated_at" },
  { label: "STATUS", key: "status", sort: true },
  { label: "", key: "ACTION" },
];

const Cards = () => {
  const {
    FEDetails,
    TLDetails,
    getCardsByLocation,
    setCurrentActiveLocation,
    toBePrintedCards,
    setTablesPagination,
    getTobePrinntedCards,
    updateFilters,
    cardLocationTagData,
    getCardsForSingleTableByLocation,
    totalCardsAndToBePrinted,
    setTotalCardsAndToBePrinted,
    getUsersByUID,
  } = useCardContext();
  const [userDropdownOptions, setUserDropdownOptions] = useState([]);
  // const [totalCardsAndToBePrinted, setTotalCardsAndToBePrinted] = useState({
  //   totalCards: 0,
  //   toBePrinted: 0,
  // });
  const [cardsDataGroupedBy, setCardsDataGroupBy] = useState({});
  const [totalCardsData, setTotalCardsData] = useState([]);
  const [selectedCard, setSelectedCard] = useState("");
  const [status, setStatus] = useState(null);
  const [downloadCardMaps, setDownloadCardMaps] = useState([]);
  const [isDownloadCompleted, setIsDownloadCompleted] = useState({});
  const [downloadCardCount, setDownloadCardCount] = useState(0);
  const [tehsilCounts, setTehsilCounts] = useState({});
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [isPaginationEnabled, setIsPaginationEnabled] = useState(false);
  const [markAsPrintPending, setMarkAsPrintPending] = useState({});
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isCardDownloading, setIsCardDownload] = useState(false);
  const imageRef = useRef(null);
  const { navigator } = useContext(NavigationContext);
  const [isLeaveDialogOpned, setIsLeaveDialogOpned] = useState(false);
  const [navData, setNavData] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [statusCount, setStatusCount] = useState({});
  const [apiPayload, setApiPayload] = useState({});
  const [rowPerPage, setRowPerPage] = useState(100);
  const [scroll, setScrolly] = useState(window.scrollY);
  const [cardDataBylocation, setCardsDataByLocation] = useState({});

  useEffect(
    () => console.log("downloadCardMaps", downloadCardMaps),
    [downloadCardMaps]
  );

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const highlightedRow = storageUtil.getStorageData("highlightedRow");
  let [urlDateType, setUrlDateType] = useSearchParams();
  // const [isPrintMode, setIsPrintMode] = useState(
  //   urlDateType.get("isPrintMode") === "true" || false
  // );

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
    const removeKey = [];
    const addKeys = [];
    data.forEach((k) => {
      if (downloadCardMaps.includes(k)) {
        removeKey.push(k);
      } else {
        addKeys.push(k);
      }
    });
    setDownloadCardMaps((prv) => {
      return addKeys.concat(prv.filter((k) => !removeKey.includes(k)));
    });
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
    if (scrollValue) {
      window.scrollTo({
        top: scrollValue,
      });
    }
  };

  const getCardByLocation = async (location, feList) => {
    try {
      if (toBePrintedCards[`${location.district} ${location.tehsil}`]) {
        return;
      }
      getCardsByLocation({ location, feList });
      // setCardsDataByLocation((prev) => ({ ...prev, [location]: data }));
    } catch (error) {
      console.log("error", error);
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
    _isPrintMode,
  } = {}) => {
    const cId = urlDateType.get("createdById");
    const page = Number(urlDateType.get("page"));

    if (page > 0) {
      setPage(page);
      _page = page;
    }
    if (!_isPrintMode) {
      _isPrintMode = urlDateType.get("printMode");
    }

    if (selectedCard) {
      const s = urlDateType.get("status");
      if (!_status && s) {
        let trimedStatus;
        if (s) {
          trimedStatus = s?.split(" ")?.[0]?.trim();
        }
        _status = trimedStatus;
      }
      setApiPayload((pre) => {
        const obj = {
          ...pre,
        };
        if (search) obj.search = search;
        else delete obj.search;
        if (state) obj.state = state;
        else delete obj.state;
        if (district) obj.district = district;
        else delete obj.district;
        if (duration) obj.duration = duration;
        else delete obj.duration;
        if (created_by) obj.created_by = created_by;
        else delete obj.created_by;
        if (gram_p) obj.gram_p = gram_p;
        else delete obj.gram_p;
        if (tehsil) obj.tehsil = tehsil;
        else delete obj.tehsil;
        if (till_duration) obj.till_duration = till_duration;
        else delete obj.till_duration;
        if (_status) obj._status = _status;
        else delete obj._status;
        if (_page) obj._page = _page;
        else delete obj._page;
        if (sortBy) obj.sortBy = sortBy;
        else delete obj.sortBy;
        if (_isPrintMode) obj._isPrintMode = _isPrintMode;
        else delete obj._isPrintMode;
        return obj;
      });
      setIsPageLoading(true);
      let data;
      if (selectedCard === "toBePrinted") {
        const filterData = {
          ...(_status && { _status }),
          ...(urlDateType.get("status") && {
            _status: urlDateType.get("status"),
          }),
          ...(selectedCard === "totalCards" && {
            _status: _status,
          }),
          ...(selectedCard === "toBePrinted" && { _status: "SUBMITTED" }),
          ...(_isPrintMode && { isPrintMode: _isPrintMode }),
          page: _page,
          ...(search && { q: search }),
          ...(gram_p && { gram_p: gram_p }),
          ...(state && { state: state }),
          ...(district && { district }),
          ...(duration && { duration }),
          ...(tehsil && { tehsil }),
          ...(sortBy && { sortBy: sortBy }),
          ...((created_by || cId) && { created_by: created_by || cId }),
          ...(till_duration && { till_duration }),
          selectedCard,
        };
        // data = await getTobePrinntedCards();
        console.log("------FILTER UPDATED-----");
        updateFilters({ filterData });
        // data = await cards.getToBePrintedCards(filterData);
        // setTablesPagination(data?.groupedData);
        // if (data && !isEmpty(data?.groupedData)) {
        //   setCurrentActiveLocation(data.groupedData[0]._id);
        //   getCardsByLocation({
        //     location: data.groupedData[0]._id,
        //     feList: data.groupedData[0].createByUids,
        //   });
        // }
        console.log("data-------", data);
      } else {
        data = await cards.getCardsData({
          ...((selectedCard === "totalCards" ||
            selectedCard === "pendingCards") && {
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
      }
      if (!isEmpty(data)) {
        if (data.idList) {
          storageUtil.setStorageData(data.idList, "cards_ids");
        }
        if (selectedCard === "toBePrinted") {
          // setCardsDataGroupBy(() => data.groupedData);
          // setTotalCardsAndToBePrinted({
          //   totalCards: data.totalCards,
          //   toBePrinted: data.totalPrintedCards,
          //   totalPrintCardsShowing: data.totalPrintCardsShowing,
          //   totalShowing: data.totalShowing,
          // });
          setRowPerPage(data.total_documents_per_page);
        } else {
          setTotalCardsData(() => data.groupedData);
          setStatusCount(() => data.statusCount);
        }

        setTotalCardsAndToBePrinted({
          totalCards: data.totalCards,
          toBePrinted: data.totalPrintedCards,
          totalPrintCardsShowing: data.totalPrintCardsShowing,
          totalShowing: data.totalShowing,
          pendingCardCount: data.pendingCardCount,
        });
        setPageCount(data?.totalShowing);
        setCurrentPage(parseInt(data?.page_number || 0));
        // setTehsilCounts(data.tehsilCounts || {});
        setIsPageLoading(false);
      } else {
        setCardsDataGroupBy([]);
        setPageCount(0);
        setCurrentPage(0);
        setIsPageLoading(false);
      }
      setTimeout(() => {
        const markAsPrinted = storageUtil.getStorageData("markAsPrintedData");
        if (markAsPrinted) {
          const locationAndFE = [];
          const FE = [];
          Object.keys(markAsPrinted).forEach((k) => {
            const location = {
              district: k.split("/")[0].trim(),
              tehsil: k.split("/")[1].trim(),
            };
            const feUid = k.split("/")[2].trim();
            locationAndFE.push({
              location,
              feUid,
            });
            FE.push(feUid);
          });
          getUsersByUID({ feList: FE }).then(() =>
            locationAndFE.forEach((data) =>
              getCardsForSingleTableByLocation(data)
            )
          );

          setMarkAsPrintPending(markAsPrinted);
        }
        restoreScroll();
      }, 10);
    }
  };

  const getUsersList = async ({ status } = {}) => {
    let _status = status;
    if (!_status) {
      _status = urlDateType.get("tab");
    }
    const userList = await cardService.getUsersList({
      ...(_status === "toBePrinted" && { _status: "SUBMITTED" }),
    });
    console.log("userList", userList);

    setUserDropdownOptions(userList);
  };

  const handleSort = ({ colName, type, location, feUid }) => {
    if (type === "des") {
      getTableData({ sortBy: colName });
    } else {
      getTableData({});
    }
    addDataToURL({ sortType: type === "des" ? "des" : "" });
  };

  const handleToBePrintedSort = ({ colName, type, location, feUid }) => {
    if (type === "des") {
      console.log("SORT location", location);
      console.log("SORT feUid", feUid);

      getCardsForSingleTableByLocation({ location, feUid, sortBy: colName });
    } else {
      getCardsForSingleTableByLocation({ location, feUid });
    }
    addDataToURL({ sortType: type === "des" ? "des" : "" });
  };

  const handleMenuSelect = async (item, selectedCard) => {
    if (item === "DELETE") {
      await bin.deleteData(selectedCard._id, "card");
    } else {
      await cardService.changeStatus({ status: item }, selectedCard._id);
    }
    const search = urlDateType.get("search");
    getTableData({ _status: status, search: search || null });
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

    console.log("downloadCardMaps", downloadCardMaps);
    console.log("toBePrintedCards", toBePrintedCards);
    downloadCardMaps.forEach((groupName) => {
      const [locationName, FEUID] = groupName.split("/");
      const _FEDetails = FEDetails[FEUID] || {};
      const _TLDetails = TLDetails[_FEDetails.team_leader_id] || {};
      console.log("locationName", locationName);
      keys.push(`${locationName.replace(" ", " / ")}/${FEUID}`);
      if (cardsToDownload[locationName.replace(" ", "/")]) {
        cardsToDownload[locationName.replace(" ", "/")].push({
          cards: toBePrintedCards[locationName][FEUID],
          teamLeaderDetails: [_TLDetails || {}],
          userDetails: _FEDetails,
          cardCount: toBePrintedCards[locationName][FEUID].length,
        });
      } else {
        cardsToDownload[locationName.replace(" ", "/")] = [];
        cardsToDownload[locationName.replace(" ", "/")].push({
          cards: toBePrintedCards[locationName][FEUID],
          teamLeaderDetails: [_TLDetails || {}],
          userDetails: _FEDetails,
          cardCount: toBePrintedCards[locationName][FEUID].length,
        });
      }
      console.log("keys", keys);
      _isDownloadCompleted[groupName] = true;
      // const selectedCardData = [];
      // _isDownloadCompleted[groupName] = true;
      // keys = downloadCardMaps[groupName]
      //   .map((a) => `${groupName}/${a}`)
      //   .concat(keys);
      // const searchedData = cardsDataGroupedBy.find((d) => d._id === groupName);

      // searchedData.cards.forEach((FEData) => {
      //   const key = FEData._id.createdBy;
      //   if (downloadCardMaps[groupName].includes(key)) {
      //     _isDownloadCompleted[key] = true;
      //     selectedCardData.push(FEData);
      //   }
      // });
      // searchedData[groupName].forEach((cardData) => {

      //   if (downloadCardMaps[groupName].includes(key)) {
      //     _isDownloadCompleted[key] = true;
      //     selectedCardData.push(cardData);
      //   }
      // });
      // cardsToDownload[groupName] = selectedCardData;
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
        setDownloadCardMaps([]);
        setDownloadCardCount(0);
        setIsDownloadCompleted(_isDownloadCompleted);
      },
      images: images,
      secondaryImage: imageRef.current,
    });
    // setIsPaginationEnabled(true);
  };

  useEffect(() => {
    getUsersList();
  }, []);

  const handleMarkAsPrintApiCall = () => {
    const _search = urlDateType.get("search");
    const sortType = urlDateType.get("sortType");
    const tab = urlDateType.get("tab");
    getTableData({
      ...apiPayload,
      _page: page,
      search: _search,
      sortBy: sortType ? "status" : null,
      tab,
    });
  };

  useEffect(() => {
    const _search = urlDateType.get("search");
    const sortType = urlDateType.get("sortType");
    const tab = urlDateType.get("tab");
    const status = urlDateType.get("status");
    console.log("status&&&&&&", status);
    clearTimeout(useEffectTypingTimer);
    useEffectTypingTimer = setTimeout(() => {
      console.log("----getTableData api");
      getTableData({
        ...apiPayload,
        _status: status,
        _page: page,
        search: _search,
        sortBy: sortType ? "status" : null,
        tab,
      });
    }, 10);

    const searchParams = new URLSearchParams(window.location.search).get("tab");
    const handleScroll = () => {
      if (window.scrollY < lastScrollValue && window.scrollY > 12) {
        setScrolly(true);
      } else {
        setScrolly(false);
      }
      lastScrollValue = window.scrollY;
      if (window.scrollY > 0) {
        storageUtil.setStorageData(
          window.scrollY,
          `${location.pathname}-${searchParams}`
        );
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [selectedCard, page]);

  const customPrevioudButton = (porps) => {
    return (
      <span>
        <Button
          onClick={(event) => {
            const searchParams = new URLSearchParams(
              window.location.search
            ).get("tab");
            storageUtil.setStorageData(
              0,
              `${location.pathname}-${searchParams}`
            );
            addDataToURL({ page: 0 });
            setPage(0);
          }}
          sx={{ mx: 1 }}
          disabled={currentPage == 0}
          size="small"
          variant="standard"
          startIcon={<ArrowBackIcon />}
        >
          First page
        </Button>
        <Button
          {...porps}
          sx={{ mx: 1 }}
          size="small"
          variant="standard"
          startIcon={<ArrowBackIcon />}
        >
          Previous
        </Button>
      </span>
    );
  };
  const customNextButton = (porps) => {
    return (
      <Button
        {...porps}
        sx={{ mx: 1 }}
        size="small"
        variant="standard"
        startIcon={<ArrowForwardIcon />}
      >
        Next
      </Button>
    );
  };

  const handleCardSelect = (n, byPass = false, filterObjects) => {
    if (
      !isEmpty(markAsPrintPending) &&
      !byPass &&
      selectedCard === "toBePrinted"
    ) {
      setIsLeaveDialogOpned(true);
      setNavData({ value: n, filterObjects });
    } else {
      setPage(0);
      setDownloadCardMaps([]);
      setDownloadCardCount(0);
      if (n != urlDateType.get("tab") || byPass) {
        addDataToURL({ page: "" });
        setMarkAsPrintPending({});
        addDataToURL({ districtId: "" });
        addDataToURL({ status: "" });
        addDataToURL({ createdById: "" });
        addDataToURL({ durationType: "" });
        addDataToURL({ tehsilId: "" });
        addDataToURL({ search: "" });
        filterObjects?.seFilterDate([]);
        filterObjects?.setGramOption([]);
        filterObjects?.setTehsilOption([]);
        filterObjects?.setCreatedBy(null);
        Object.keys(filterObjects?.stateMap)?.forEach((key) =>
          filterObjects.stateMap[key]()
        );
        getUsersList({ status: n });
        setRowPerPage(100);
      }
      setSelectedCard(n);
    }
    // storageUtil.setStorageData(true, "firstHeaderRender");
  };

  const handlePageLeave = () => {
    navData.filterObjects?.seFilterDate([]);
    navData.filterObjects?.setGramOption([]);
    navData.filterObjects?.setTehsilOption([]);
    // navData?.filterObjects?.setCreatedBy(null);
    Object.keys(navData.filterObjects?.stateMap)?.forEach((key) =>
      navData.filterObjects.stateMap[key]()
    );
    addDataToURL({ tab: "totalCards" });
    handleCardSelect(navData.value, true, navData.filterObjects);
    setIsLeaveDialogOpned(false);
  };

  useEffect(() => {
    if (!isEmpty(markAsPrintPending)) {
      storageUtil.setStorageData(markAsPrintPending, "markAsPrintedData");
    }
  }, [markAsPrintPending]);
  const scrollToTop = () => {
    const searchParams = new URLSearchParams(window.location.search).get("tab");
    storageUtil.setStorageData(0, `${location.pathname}-${searchParams}`);
    window.scrollTo({
      top: 0,
    });
  };
  const trigger = useScrollTrigger();
  return (
    <Grid component="main" sx={{ width: "96%", overflowX: "hidden" }}>
      <img
        src="/health-card-back.png"
        ref={imageRef}
        alt="health back"
        style={{ display: "none" }}
      />
      <LeavePageDialog
        open={isLeaveDialogOpned}
        handleClose={() => setIsLeaveDialogOpned(false)}
        handleLeave={handlePageLeave}
      />

      <Fab
        onClick={scrollToTop}
        color="secondary"
        aria-label="scroll to top"
        size="small"
        style={{
          position: "fixed",
          bottom: "60px",
          right: "10px",
        }}
      >
        <KeyboardArrowUpIcon />
      </Fab>

      <Grid item sx={{ mb: 2 }}>
        {isCardDownloading && <LoadingScreen />} <CssBaseline />
        <Slide appear={false} direction="down" in={!trigger}>
          <div
            style={{
              position: scroll ? "fixed" : "static",
              zIndex: 2,
              width: "-webkit-fill-available",
              background: "white",
            }}
          >
            <Header
              currentComponentName="Cards"
              statusCount={statusCount}
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
              pendingCount={totalCardsAndToBePrinted.pendingCardCount}
              handlePendingCardClick={() => {
                addDataToURL({ tab: "pendingCards", status: "PENDING" });
                setSelectedCard("pendingCards");
              }}
              showPrintMode={selectedCard === "toBePrinted"}
              {...((selectedCard === "totalCards" ||
                selectedCard === "pendingCards") && {
                statusOption: isEmpty(statusCount)
                  ? cardStatusList
                  : cardStatusList.map((labelData) => {
                      return {
                        label: `${labelData.label} (${
                          statusCount[labelData.label] || 0
                        })`,
                      };
                    }),
              })}
              defaultSelectedCard="toBePrinted"
              pSelectedCard={selectedCard}
              showSecondaryScoreCard
              createdByOptions={userDropdownOptions || []}
              createdByKeyMap={{ labelKey: "name", codeKey: "uid" }}
              // tehsilCounts={tehsilCounts}
              handleSelectCard={handleCardSelect}
              isNavAllowed={() => {
                return (
                  isEmpty(markAsPrintPending) || selectedCard !== "toBePrinted"
                );
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
          </div>
        </Slide>
      </Grid>
      <Box>
        <Backdrop
          sx={(theme) => ({
            background: "white",
            zIndex: theme.zIndex.drawer + 1,
            opacity: "0.4 !important",
          })}
          open={isPageLoading}
        />
        {isPageLoading && <LinearIndeterminate />}

        {totalCardsData && (
          <>
            {selectedCard === "toBePrinted" ? (
              isEmpty(cardLocationTagData) ? (
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
                  {/* {JSON.stringify(cardLocationTagData)} */}
                  {cardLocationTagData.map((data, index) => {
                    return (
                      <TableWithExtraElements
                        key={`${data?._id?.district}/${data?._id?.tehsil}/${index}`}
                        groupName={data._id}
                        cardCount={data?.count}
                        getCardsData={getCardByLocation}
                        feList={data.createByUids}
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
                        handleSort={handleToBePrintedSort}
                        setIsCardDownload={setIsCardDownload}
                        handleMarkAsPrintApiCall={handleMarkAsPrintApiCall}
                      />
                    );
                  })}
                  <Box sx={{ height: "40px" }}></Box>
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
                        handleClick={handleRowClick}
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
                  actions={[]}
                  rowClick={handleRowClick}
                  handleMenuSelect={handleMenuSelect}
                  highlightedRow={highlightedRow}
                  handleSort={handleSort}
                  showActionMenu
                />
                <Box sx={{ height: "60px" }}></Box>
              </Grid>
            )}
          </>
        )}

        {selectedCard !== "toBePrinted" && (
          <Card
            sx={{
              position: "fixed",
              bottom: "1px",
              mx: 2,
              width: "fit-content",
              right: "1px",
              zIndex: 10,
            }}
          >
            <TablePagination
              component="div"
              count={pageCount || 0}
              page={currentPage || 0}
              // disabled={
              //   selectedCard === "toBePrinted"
              //     ? !!Object.keys(markAsPrintPending)?.length
              //     : false
              // }
              rowsPerPageOptions={[
                ...(rowPerPage != 100 ? [rowPerPage] : [100]),
              ]}
              rowsPerPage={rowPerPage}
              labelRowsPerPage={""}
              labelDisplayedRows={({ from, to, count }) => {
                if (selectedCard === "toBePrinted") {
                  return `${rowPerPage} of ${
                    count !== -1 ? count : `more than ${to}`
                  }`;
                }
                return `${to} of ${count !== -1 ? count : `more than ${to}`}`;
              }}
              onPageChange={(e, newPage) => {
                console.log("page change", newPage);
                if (
                  selectedCard === "toBePrinted"
                    ? !!Object.keys(markAsPrintPending)?.length
                    : false
                ) {
                  alert(
                    "Some cards are downloaded but not marked as Printed, Are you sure to proceed?"
                  );
                }
                const searchParams = new URLSearchParams(
                  window.location.search
                ).get("tab");
                storageUtil.setStorageData(
                  0,
                  `${location.pathname}-${searchParams}`
                );
                addDataToURL({ page: newPage });
                setPage(newPage);
              }}
              onRowsPerPageChange={() => {}}
              slots={{
                actions: {
                  nextButton: customNextButton,
                  previousButton: customPrevioudButton,
                },
              }}
            />
          </Card>
        )}
      </Box>
    </Grid>
  );
};

export default Cards;
