import React, { memo } from "react";
import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const customPrevioudButton = (porps) => {
  return (
    <span>
      <Button
        onClick={function (event) {
          console.log("First page button clicked");
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
};

export default memo(customPrevioudButton);
