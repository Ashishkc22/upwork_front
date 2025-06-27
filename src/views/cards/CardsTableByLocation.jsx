import { memo, useEffect, useState, useCallback } from "react";
import { tokens } from "../../theme";
import { useNavigate, Link } from "react-router-dom";
import CustomTable from "../../components/CustomTable";
import {
  Grid,
  Box,
  Button,
  Checkbox,
  Tooltip,
  IconButton,
  Typography,
  ListItemButton,
  Collapse,
  useTheme,
  Card,
  TablePagination,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Check as CheckIcon,
  ExpandLess,
  ExpandMore,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { isEmpty } from "lodash";
import { useCardContext2 } from "./context/CardContext2";
import { useSearchParams } from "react-router-dom";
import ArogyamComponent from "../../components/ArogyaCard_v2";
import downloadCards from "../../utils/downloadCards";
import cardService from "../../services/cards";
import storageUtil from "../../utils/storage.util";

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

function markAsPrint({ ids = [] }) {
  return cardService.markAsPrint(ids.join(","));
}

function CardsTableByLocation({
  location,
  handleCardStatusMenu = () => {},
  imageRef,
  images,
}) {
  // ## Themes and navigation
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const {
    openSections,
    toggleSection,
    agentDetailsByLocation,
    tableCountBylocation,
    cardDataByLocations,
    paginationDetailsBylLocation,
    handlePaginationChangesByLocation,
    checkedSections,
    handleSectionCheck,
    getCardsForSingleTableByLocation,
    sortTypeDataByLocation,
    handleCardsCount,
    cardsTableSelectedForDownload,
    markAsPrintedDetails,
    setMarkAsPrintedValues,
    afterMarkAsPrintedAPIIsCalled,
    cardLocationTagData,
    getCardsByLocation,
    isSectionsLoading,
    mode,
  } = useCardContext2();
  const { count, _id: locationDetails, createByUids: agentIds } = location;

  const [searchParams, setSearchParams] = useSearchParams();

  const expanationName = `${locationDetails.district}-${locationDetails.tehsil}`;

  const [isEntireRegionChecked, setIseEntireRegionChecked] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);

  //   ## Usecontext and state management
  //   const { getUsersByUID, getTobePrinntedCards, cardLocationTagData } =
  //     useCardContext();

  // ## Helper components
  const customPrevioudButton = memo((porps) => {
    return (
      <span>
        <Button
          onClick={function (event) {
            return porps.onClick.call(this, "FIRST_PAGE");
          }}
          sx={{ mx: 1 }}
          disabled={0}
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

  // ## Helper Functions
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

  function handleCardsTableDownload({ agentId = null } = {}) {
    setIsPageLoading(true);
    if (agentId && cardDataByLocations[expanationName][agentId]) {
      const agentDetails =
        agentDetailsByLocation?.[expanationName]?.FEDetails?.[agentId] || {};
      const tlDetails =
        agentDetailsByLocation?.[expanationName]?.TLDetails?.[
          agentDetails.team_leader_id
        ] || {};
      downloadCards.downloadMultipleCard({
        cardData: cardDataByLocations[expanationName][agentId],
        Element: ArogyamComponent,
        handleDownloadCompleted: () => {
          setIsPageLoading(false);
          setMarkAsPrintedValues([`${expanationName}/${agentId}`]);
        },
        images: images,
        agentDetails: { name: agentDetails.name, id: agentDetails._id },
        tlDetails: tlDetails || {},
        secondaryImage: imageRef.current,
      });
      return;
    }
    const allFeDetails =
      agentDetailsByLocation?.[expanationName]?.FEDetails || {};
    const allTlDetails =
      agentDetailsByLocation?.[expanationName]?.TLDetails || {};
    const allCards = cardDataByLocations[expanationName];
    const keysForMarAsPrinted = [];
    const tableCardsTobeDownloaded = Object.keys(allCards).reduce(
      (acu, key) => {
        const fe = allFeDetails[key];
        keysForMarAsPrinted.push(`${expanationName}/${key}`);
        acu.push({
          cards: allCards[key],
          teamLeaderDetails: [allTlDetails[fe.team_leader_id] || {}],
          userDetails: fe,
          cardCount: allCards[key].length,
        });
        return acu;
      },
      []
    );
    downloadCards.downloadMultipleCardWithMultipleAgent({
      Element: ArogyamComponent,
      cardData: tableCardsTobeDownloaded,
      secondaryImage: imageRef.current,
      handleDownloadCompleted: () => {
        setMarkAsPrintedValues(keysForMarAsPrinted);
        setIsPageLoading(false);
      },
      images: images,
      districtName: locationDetails.district,
    });
  }

  const handleEntireSectionCheck = (
    countData = tableCountBylocation?.[expanationName]
  ) => {
    let cardCount = 0;

    if (!isEntireRegionChecked) {
      agentIds.forEach((id) =>
        !checkedSections[expanationName].includes(id)
          ? (cardCount += countData?.[id])
          : null
      );
    } else {
      agentIds.forEach((id) =>
        checkedSections[expanationName].includes(id)
          ? (cardCount -= countData?.[id])
          : null
      );
    }
    handleSectionCheck({
      section: expanationName,
      agentIds: isEntireRegionChecked ? [] : agentIds,
    });
    handleCardsCount(
      cardCount,
      expanationName,
      null,
      agentIds,
      isEntireRegionChecked
    );
  };

  const handleRowClick = useCallback((row) => {
    storageUtil.setStorageData(row._id, "highlightedRow");
    navigate(`${row._id}`);
  }, []);

  function handleMarkAsPrinted({ isEntireSection = null, agentId = null }) {
    setIsPageLoading(true);
    const cardIds = [];
    if (isEntireSection) {
      agentIds.forEach((id) =>
        cardIds.push(
          ...cardDataByLocations[expanationName][id].map((c) => c._id)
        )
      );
    } else if (agentId) {
      cardIds.push(
        ...cardDataByLocations[expanationName][agentId].map((c) => c._id)
      );
    }
    markAsPrint({ ids: cardIds }).then(() => {
      // Remove mark as printed and remove APIs.
      afterMarkAsPrintedAPIIsCalled({
        sectionName: expanationName,
        agentIds: isEntireSection ? agentIds : [agentId],
        locationData: locationDetails,
      });
      setIsPageLoading(false);
    });
  }

  //   ## UseEffects
  useEffect(() => {
    // getUsersByUID();
  }, []);
  return (
    <Box position="relative">
      <Grid container sx={{ mx: 2 }} rowGap={2}>
        <img
          src="/health-card-back.png"
          ref={imageRef}
          alt="health back"
          style={{ display: "none" }}
        />
        {/* <Backdrop
          sx={(theme) => ({
            background: "white",
            zIndex: theme.zIndex.drawer + 1,
            opacity: "0.4 !important",
          })}
          open={isPageLoading}
        /> */}

        {isSectionsLoading[expanationName] || isPageLoading ? (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bgcolor="rgba(255,255,255,0.6)"
            zIndex={1}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <CircularProgress size={24} />
          </Box>
        ) : (
          <></>
        )}

        {/* {isPageLoading && <LinearIndeterminate />} */}
        <Grid
          item
          xs={12}
          alignItems="cenetr"
          display="flex"
          justifyContent="space-between"
        >
          <Box>
            <Button
              sx={{ background: colors.grey[100], px: 1 }}
              startIcon={
                <Checkbox
                  checked={isEntireRegionChecked}
                  indeterminate={
                    !isEmpty(checkedSections[expanationName]) &&
                    !agentIds.every((val) =>
                      checkedSections[expanationName].includes(val)
                    )
                  }
                />
              }
              onClick={() => {
                setIseEntireRegionChecked(!isEntireRegionChecked);
                setIsPageLoading(true);
                if (!cardDataByLocations[expanationName]) {
                  getCardsByLocation({
                    location: locationDetails,
                    feList: agentIds,
                  }).then((d) => {
                    handleEntireSectionCheck(d?.paginationData || {});
                    setIsPageLoading(false);
                  });
                } else {
                  handleEntireSectionCheck();
                  setTimeout(() => setIsPageLoading(false), 1000);
                }
              }}
            >{`${locationDetails.district} / ${locationDetails.tehsil} (Total: ${count})`}</Button>
            <Tooltip title="Download full tehsil">
              <IconButton
                aria-label="Download full tehsil"
                sx={{
                  color: colors.primary[500],
                }}
                onClick={() => handleCardsTableDownload()}
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>

            {agentIds.every((id) =>
              markAsPrintedDetails.has(`${expanationName}/${id}`)
            ) && (
              <Button
                onClick={(e) => handleMarkAsPrinted({ isEntireSection: true })}
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
          </Box>

          <ListItemButton
            sx={{ mr: 4, justifyContent: "end" }}
            onClick={() => toggleSection(locationDetails, agentIds)}
          >
            {openSections[expanationName || false] ? (
              <ExpandLess />
            ) : (
              <ExpandMore />
            )}
          </ListItemButton>
        </Grid>
        <Grid item xs={12}>
          <Collapse in={openSections[expanationName] || false} timeout="auto">
            {agentIds.map((agentId) => {
              const agentDetails =
                agentDetailsByLocation?.[expanationName]?.FEDetails?.[agentId];

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
                        onClick={() => {}}
                      >
                        <Grid item>
                          <Checkbox
                            checked={
                              checkedSections?.[expanationName]?.includes(
                                agentId
                              ) || false
                            }
                            onClick={() => {
                              const isAlreadyChecked =
                                checkedSections?.[expanationName]?.includes(
                                  agentId
                                );
                              setIsPageLoading(true);
                              handleSectionCheck({
                                section: expanationName,
                                agentId,
                              });
                              handleCardsCount(
                                isAlreadyChecked
                                  ? -tableCountBylocation?.[expanationName]?.[
                                      agentId
                                    ]
                                  : tableCountBylocation?.[expanationName]?.[
                                      agentId
                                    ],
                                expanationName,
                                agentId,
                                null
                              );
                              setIsPageLoading(false);
                            }}
                          />
                          <Link
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(``);
                            }}
                          >
                            <Typography
                              sx={{
                                display: "inline-flex",
                                mr: 1,
                                color: "black",
                              }}
                            >
                              {agentDetails && `${agentDetails.name || ""}`}
                              {`(${agentDetails?.uid || ""})`}
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
                            {`#${
                              tableCountBylocation?.[expanationName]?.[
                                agentId
                              ] || 0
                            }`}
                          </Typography>
                        </Grid>
                        <Grid item display="flex" alignItems="center">
                          <Button
                            sx={{}}
                            startIcon={<DownloadIcon />}
                            onClick={(e) =>
                              handleCardsTableDownload({ agentId })
                            }
                          >
                            Download
                          </Button>

                          {markAsPrintedDetails.has(
                            `${expanationName}/${agentId}`
                          ) && (
                            <Button
                              sx={{
                                display: "inline-flex",
                                paddingBottom: 0,
                                color: colors.primary[500],
                                alignItems: "center",
                                py: 1,
                              }}
                              onClick={(e) => handleMarkAsPrinted({ agentId })}
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

                  {/* //   <Box sx={{ display: "inline-flex", flexWrap: "wrap" }}>
            //     {groupedData.map((cardData, index) => {
            //       return (
            //         <div style={{ marginRight: 2 }}>
            //           <ArogyamComponent
            //             key={cardData._id + index + "ImageMode"}
            //             cardData={cardData}
            //             enableClick={true}
            //             handleClick={handleRowClick}
            //             images={images}
            //           />
            //         </div>
            //       );
            //     })}
            //   </Box> */}

                  <Grid item xs={12}>
                    {mode === "table" ? (
                      <CustomTable
                        headers={tableHeaders}
                        rows={
                          cardDataByLocations?.[expanationName]?.[agentId] || []
                        }
                        actions={[]}
                        rowClick={handleRowClick}
                        handleMenuSelect={(...arg) =>
                          handleCardStatusMenu(...arg, () =>
                            handlePaginationChangesByLocation({
                              section: locationDetails,
                              agentId,
                            })
                          )
                        }
                        highlightedRow={() => {}}
                        handleSort={({ colName, type }) => {
                          setURLParams(
                            `${agentId}-sortType`,
                            type === "des" ? "des" : null
                          );
                          getCardsForSingleTableByLocation({
                            location: locationDetails,
                            feUid: agentId,
                            sortBy: type === "des" ? colName : null,
                          });
                        }}
                        sortType={
                          sortTypeDataByLocation?.[expanationName]?.[agentId] ||
                          null
                        }
                        disableDefaultSortMethod={true}
                        showActionMenu
                        // sortType={urlDateType.get("sortType") === "des" ? "des" : null}
                      />
                    ) : (
                      <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                        {cardDataByLocations?.[expanationName]?.[agentId]?.map(
                          (cardData, index) => {
                            return (
                              <div style={{ marginRight: 2 }}>
                                <ArogyamComponent
                                  key={cardData._id + index + "ImageMode"}
                                  cardData={cardData}
                                  enableClick={true}
                                  images={images}
                                  handleClick={() => {}}
                                />
                              </div>
                            );
                          }
                        )}
                      </Box>
                    )}
                  </Grid>
                  <Card sx={{ width: "100vw", mb: 3 }}>
                    <TablePagination
                      component="div"
                      count={
                        tableCountBylocation?.[expanationName]?.[agentId] || 0
                      }
                      page={
                        paginationDetailsBylLocation?.[expanationName]?.[
                          agentId
                        ].page || 0
                      }
                      rowsPerPage={
                        paginationDetailsBylLocation?.[expanationName]?.[
                          agentId
                        ].limit || 100
                      }
                      rowsPerPageOptions={[]}
                      labelRowsPerPage={""}
                      labelDisplayedRows={({ from, to, count }) => {
                        return `${to} of ${
                          count !== -1 ? count : `more than ${to}`
                        }`;
                      }}
                      onPageChange={(e, newPage) => {
                        handlePaginationChangesByLocation({
                          section: locationDetails,
                          agentId,
                          page: newPage,
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
                </Grid>
              );
            })}
          </Collapse>
        </Grid>
      </Grid>
    </Box>
  );
}

export default memo(CardsTableByLocation);
