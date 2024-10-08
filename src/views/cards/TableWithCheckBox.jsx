import React, { useEffect, useState } from "react";
import { Grid, Typography, Button, Box, Link } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import Checkbox from "@mui/material/Checkbox";
import CustomTable from "../../components/CustomTable";

import { useNavigate } from "react-router-dom";
import ArogyamComponent from "../../components/ArogyaCard_v1";

import downloadCards from "../../utils/downloadCards";

import CheckIcon from "@mui/icons-material/Check";
import storageUtil from "../../utils/storage.util";
import cardService from "../../services/cards";

function markAsPrint({ ids = [] }) {
  return cardService.markAsPrint(ids.join(","));
}

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
  tlDetails,
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
                    tlDetails: tlDetails,
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

export default TableWithCheckBox;
