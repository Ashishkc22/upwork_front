import React, { useEffect, useState } from "react";
import { Grid, Typography, Box } from "@mui/material";
import { isEmpty } from "lodash";

import TableWithExtraElements from "./TableWithExtraElements";
const ToBePrinted = ({ payload = {}, isImageMode }) => {
  const [cardsDataGroupedBy, setCardsDataGroupBy] = useState({});

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

  useEffect(() => {
    getTableData(payload);
  }, []);

  return isEmpty(cardsDataGroupedBy) ? (
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
  );
};

export default ToBePrinted;
