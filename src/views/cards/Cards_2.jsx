import {
  Grid,
  Backdrop,
  TablePagination,
  Button,
  Card,
  Fab,
  Typography,
  useTheme,
  Box,
  Slide,
  useScrollTrigger,
} from "@mui/material";
import { tokens } from "../../theme";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useCardContext2 } from "./context/CardContext2";
import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useReducer,
  memo,
} from "react";
import Header_2 from "../../components/Header_2";
import CustomTable from "../../components/CustomTable";
import cards from "../../services/cards";
import bin from "../../services/bin";
import LinearIndeterminate from "../../components/LinearProgress";
import storageUtil from "../../utils/storage.util";
import {
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from "@mui/icons-material";
import downloadCards from "../../utils/downloadCards";
import ArogyamComponent from "../../components/ArogyaCard_v2";
import CardsTableByLocation from "./CardsTableByLocation";
// Images
import waterMarkImg from "../../v1cardImages/waterMark.svg";
import supportImg from "../../v1cardImages/support.png";
import locImg from "../../v1cardImages/loc.png";
import phoneImg from "../../v1cardImages/phone.png";
import cardLogoImg from "../../v1cardImages/cardLogo.png";

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

// // Storing all memoized components in an object
const images = {
  waterMark: waterMarkImg,
  support: supportImg,
  loc: locImg,
  phone: phoneImg,
  logo: cardLogoImg,
};

let lastScrollValue = 0;

function CardsView() {
  // Theme
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // ## USEREFS
  const imageRef = useRef(null);

  // ## USECONTEXT
  const {
    setCardsScroreDetails,
    cardsScoreDetails,
    cardLocationTagData,
    getCardsLocationTags,
    cardsDownloadCount,
    cardsTableSelectedForDownload,
    cardDataByLocations,
    agentDetailsByLocation,
    setMarkAsPrintedValues,
    filterValues,
    mode,
    isPageLoading,
    setIsPageLoading,
    setFilterValues,
  } = useCardContext2();

  // ## USENAV
  const navigate = useNavigate();
  const location = useLocation();

  // URL search params
  // This is used to manage the state of the URL parameters
  const [searchParams, setSearchParams] = useSearchParams();

  // ## STATE
  const [cardDetails, setTotalCardsData] = useReducer(cardDataDispatcher, {
    tableData: [],
    statusCount: {},
    paginationDetails: {
      pageCount: 0,
      currentPage: 0,
      rowPerPage: 100,
      sortBy: "",
      markAsPrintPending: {},
    },
  });
  const [selectedCardScreen, setSelectedCardScreen] = useState(() => {
    let tab = searchParams.get("tab");
    if (!tab) {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", "toBePrinted");
      window.history.replaceState({}, "", url);
    }
    return tab || "toBePrinted";
  });
  const [scroll, setScrolly] = useState(window.scrollY);

  // Handler functions
  const getTableData = useCallback(
    async ({
      page = null,
      limit = null,
      sortBy = null,
      status = null,
      selectedCard = null,
      district = null,
      duration = null,
      created_by = null,
      tehsil = null,
      gram = null,
      till_duration = null,
      search = null,
    } = {}) => {
      try {
        setIsPageLoading(true);
        if (selectedCard === "toBePrinted") {
        } else {
          let _filterValues = filterValues;
          _filterValues = await new Promise((resolve, reject) => {
            setFilterValues((p) => {
              resolve(p);
              return p;
            });
          });
          console.log("getCardsData _filterValues", _filterValues);
          const data = await cards.getCardsData({
            selectedCard: selectedCard || selectedCardScreen,
            limit: limit || cardDetails.paginationDetails.rowPerPage,
            page: page || cardDetails.paginationDetails.currentPage,
            q: search || _filterValues?.search || null,
            sortBy: sortBy || _filterValues?.sortBy,
            _status: status || _filterValues.status,
            district: district || _filterValues?.district || null,
            duration: duration || _filterValues?.duration || null,
            created_by: created_by || _filterValues?.created_by || null,
            tehsil: tehsil || _filterValues.tehsil || null,
            gram_p: gram || _filterValues.gram_p || null,
            till_duration: till_duration || _filterValues.till_duration || null,
          });
          if (data.idList) {
            storageUtil.setStorageData(data.idList, "cards_ids");
          }
          setTotalCardsData({ type: "SET_TOTAL_CARDS_DATA", payload: data });
        }
      } catch (error) {
        console.error("Error fetching card data:", error);
      } finally {
        setIsPageLoading(false);
      }
    },
    [
      cardDetails.paginationDetails.rowPerPage,
      cardDetails.paginationDetails.currentPage,
      selectedCardScreen,
      filterValues,
    ]
  );

  // ## Dispatcher function
  function cardDataDispatcher(state, action) {
    switch (action.type) {
      case "SET_TOTAL_CARDS_DATA":
        const {
          groupedData,
          statusCount,
          totalCards,
          totalPrintedCards,
          totalPrintCardsShowing,
          totalShowing,
          pendingCardCount,
          page_number,
        } = action.payload;
        if (Number(page_number) && Number(page_number) !== 0) {
          setURLParams("page", page_number);
        } else {
          setURLParams("page", null);
        }
        setCardsScroreDetails({
          totalCards: totalCards,
          toBePrinted: totalPrintedCards,
          totalPrintCardsShowing: totalPrintCardsShowing,
          totalShowing: totalShowing,
          pendingCardCount: pendingCardCount,
        });
        return {
          tableData: groupedData,
          statusCount: statusCount || state.statusCount,
          paginationDetails: {
            pageCount: totalShowing,
            currentPage: Number(page_number) || 0,
            rowPerPage: 100,
            markAsPrintPending: {},
          },
        };
      default:
        return state;
    }
  }

  const handleRowClick = useCallback((row) => {
    storageUtil.setStorageData(row._id, "highlightedRow");
    navigate(`${row._id}`);
  }, []);

  function setURLParams(name, value) {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (value === null || value === "") {
        newParams.delete(name);
      } else {
        newParams.set(name, value);
      }
      return newParams;
    });
  }

  const handleCardStatusMenu = async (item, selectedCard, callBack = null) => {
    let result = null;
    if (item === "DELETE") {
      result = bin.deleteData(selectedCard._id, "card");
    } else {
      result = cards.changeStatus({ status: item }, selectedCard._id);
    }
    result?.then(() => (callBack !== null ? callBack() : getTableData()));
  };

  const handleGroupCardsDownload = useCallback(() => {
    const markAsPrintedKeys = [];
    const cardsData = [...cardsTableSelectedForDownload].reduce(
      (accumulator, groupName) => {
        const [locationName, FEUID] = groupName.split("/");
        const _FEDetails = agentDetailsByLocation?.FEDetails?.[FEUID] || {};
        const _TLDetails =
          agentDetailsByLocation?.TLDetails?.[_FEDetails.team_leader_id] || {};
        const cards = cardDataByLocations[locationName][FEUID];
        if (!accumulator[locationName]) {
          accumulator[locationName] = [];
        }
        accumulator[locationName].push({
          cards: cards,
          teamLeaderDetails: [_TLDetails || {}],
          userDetails: _FEDetails,
          cardCount: cards.length,
        });
        markAsPrintedKeys.push(groupName);
        return accumulator;
      },
      {}
    );
    downloadCards.downloadMultipleLevelCardData({
      Element: ArogyamComponent,
      cardData: cardsData,
      downloadCompleted: () => {
        // put data in mark as printed
        setMarkAsPrintedValues(markAsPrintedKeys);
        // remove checks
      },
      images: images,
      secondaryImage: imageRef.current,
    });
  }, [
    cardsTableSelectedForDownload,
    cardDataByLocations,
    agentDetailsByLocation,
  ]);

  const scrollToTop = () => {
    storageUtil.setStorageData(0, `${location.pathname}-${selectedCardScreen}`);
    window.scrollTo({
      top: 0,
    });
  };

  const handleScoreCardClick = useCallback((type) => {
    if (type === "pendingCards") {
      getTableData({ status: "pending", selectedCard: type });
    } else if (type === "toBePrinted") {
      getCardsLocationTags({});
    } else {
      getTableData({ selectedCard: type });
    }
    setSelectedCardScreen(type);
    storageUtil.removeItem("cards_ids");
  }, []);

  const handleScroll = useCallback(() => {
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
  }, []);

  // ## EFFECTS
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ## Helper components
  const customPrevioudButton = memo((porps) => {
    return (
      <span>
        <Button
          onClick={function (event) {
            return porps.onClick.call(this, "FIRST_PAGE");
            // getTableData();
            // const searchParams = new URLSearchParams(
            //   window.location.search
            // ).get("tab");
            // storageUtil.setStorageData(
            //   0,
            //   `${location.pathname}-${searchParams}`
            // );
            // addDataToURL({ page: 0 });
            // setPage(0);
          }}
          sx={{ mx: 1 }}
          disabled={cardDetails.paginationDetails.currentPage === 0}
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
  });
  const customNextButton = memo((porps) => {
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
  });
  const trigger = useScrollTrigger();
  return (
    <Grid component="main" sx={{ width: "96%", overflowX: "hidden" }}>
      <img
        src="/health-card-back.png"
        ref={imageRef}
        alt="health back"
        style={{ display: "none" }}
      />
      <Slide appear={false} direction="down" in={!trigger}>
        <div
          style={{
            position: scroll ? "fixed" : "static",
            zIndex: 2,
            width: "-webkit-fill-available",
            background: "white",
          }}
        >
          {/*eslint-disable-next-line react/jsx-pascal-case*/}
          <Header_2
            selectedCardType={selectedCardScreen}
            handleScoreCardClick={handleScoreCardClick}
            callBackFunction={
              selectedCardScreen === "toBePrinted"
                ? getCardsLocationTags
                : getTableData
            }
            statusOptions={Object.keys(cardDetails.statusCount).map((k) => ({
              label: `${k} (${cardDetails.statusCount[k]})`,
            }))}
            totalCardScoreDetails={{
              value: cardsScoreDetails.totalCards,
              secondValue: cardsScoreDetails.totalShowing,
            }}
            toBePrintedCardScoreDetails={{
              value: cardsScoreDetails.toBePrinted,
              secondValue: cardsScoreDetails.total_print_card_showing,
            }}
            pendindgCardScoreDetails={{
              value: cardsScoreDetails.pendingCardCount,
            }}
          />
        </div>
      </Slide>
      {/* Loading screen code */}
      <Backdrop
        sx={(theme) => ({
          background: "white",
          zIndex: theme.zIndex.drawer + 1,
          opacity: "0.4 !important",
        })}
        open={isPageLoading}
      />
      {isPageLoading && <LinearIndeterminate />}
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

      {selectedCardScreen === "toBePrinted" && cardsDownloadCount !== 0 && (
        <Fab
          sx={{
            background: colors.primary[200],
            color: colors.primary[500],
            position: "fixed",
            bottom: 55,
            right: 60,
            alignItems: "center",
            zIndex: 2,
          }}
          variant="extended"
          size="large"
          onClick={handleGroupCardsDownload}
        >
          <Typography variant="h6">[</Typography>

          <Typography variant="h6">Download</Typography>
          <Typography variant="h6" sx={{ ml: 1, fontWeight: "600" }}>
            {cardsDownloadCount}
          </Typography>
          <Typography variant="h6">]</Typography>
        </Fab>
      )}

      {selectedCardScreen !== "toBePrinted" ? (
        <Grid item sx={{ mx: 2 }}>
          {filterValues.sortType}
          {mode === "table" ? (
            <CustomTable
              headers={tableHeaders}
              rows={cardDetails.tableData}
              actions={[]}
              rowClick={handleRowClick}
              handleMenuSelect={handleCardStatusMenu}
              highlightedRow={storageUtil.getStorageData("highlightedRow")}
              handleSort={(sortData, type, location, feUid) => {
                setFilterValues((p) => ({
                  ...p,
                  sortType: sortData.type === "des" ? "des" : null,
                }));
                if (sortData.type === "des") {
                  getTableData({ sortBy: sortData.colName });
                } else {
                  getTableData({});
                }
                setURLParams(
                  "sortType",
                  sortData.type === "des" ? "des" : null
                );
              }}
              sortType={filterValues.sortType || null}
              disableDefaultSortMethod={true}
              showActionMenu
            />
          ) : (
            <Box sx={{ display: "flex", flexWrap: "wrap" }}>
              {cardDetails?.tableData?.map((cardData, index) => {
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
          )}
        </Grid>
      ) : (
        cardLocationTagData.map((location, index) => (
          <CardsTableByLocation
            key={location.count + "tableByLocation" + index}
            location={location}
            handleCardStatusMenu={handleCardStatusMenu}
            imageRef={imageRef}
            images={images}
          />
        ))
      )}
      {selectedCardScreen !== "toBePrinted" && (
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
            count={cardDetails.paginationDetails.pageCount}
            page={cardDetails.paginationDetails.currentPage}
            rowsPerPageOptions={[100]}
            rowsPerPage={cardDetails.paginationDetails.rowPerPage}
            labelRowsPerPage={""}
            labelDisplayedRows={({ from, to, count }) => {
              return `${to} of ${count !== -1 ? count : `more than ${to}`}`;
            }}
            onPageChange={(e, newPage) => {
              if (e === "FIRST_PAGE") {
                newPage = 0;
              }
              getTableData({
                page: newPage,
                limit: cardDetails.paginationDetails.rowPerPage,
              });
            }}
            slots={{
              actions: {
                nextButton: customNextButton,
                previousButton: customPrevioudButton,
              },
            }}
          />
        </Card>
      )}
    </Grid>
  );
}

export default CardsView;
