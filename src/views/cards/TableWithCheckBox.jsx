import React, { useEffect, useState, useRef } from "react";
import { Grid, Typography, Button, Box, Link } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import Checkbox from "@mui/material/Checkbox";
import CustomTable from "../../components/CustomTable";

import { useNavigate, useSearchParams } from "react-router-dom";
import ArogyamComponent from "../../components/ArogyaCard_v2";
import LeavePageDialog from "./LeaveDialog";
import downloadCards from "../../utils/downloadCards";

import CheckIcon from "@mui/icons-material/Check";
import storageUtil from "../../utils/storage.util";
import cardService from "../../services/cards";

import waterMarkImg from "../../v1cardImages/waterMark.png";
import supportImg from "../../v1cardImages/support.png";
import locImg from "../../v1cardImages/loc.png";
import phoneImg from "../../v1cardImages/phone.png";
import cardLogoImg from "../../v1cardImages/cardLogo.png";
import { isEmpty } from "lodash";

// Storing all memoized components in an object
const images = {
  waterMark: waterMarkImg,
  support: supportImg,
  loc: locImg,
  phone: phoneImg,
  logo: cardLogoImg,
};

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
  markAsPrintPending,
  groupName,
  handleMarkAsPrintApiCall,
  // highlightedRow,
}) => {
  const [checkBox, setCheckBox] = useState(false);
  const navigate = useNavigate();
  const [isDownloadCompleted, setIsDownloadCompleted] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const imageRef = useRef(null);
  let [urlDateType, setUrlDateType] = useSearchParams();
  const [isLeaveDialogOpned, setIsLeaveDialogOpned] = useState(false);
  const [navData, setNavData] = useState({});

  const handleRowClick = (row, byPass = false) => {
    if (!isEmpty(markAsPrintPending) && !byPass) {
      setNavData(row);
      setIsLeaveDialogOpned(true);
    } else {
      storageUtil.setStorageData(row._id, "highlightedRow");
      navigate(`${row._id}`);
    }
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

  const handleLeaveDialog = () => {
    handleRowClick(navData, true);
    setNavData({});
  };

  useEffect(() => {
    setCheckBox(isCheckBoxChecked);
    setPageCount(getPageCount(groupedData.length));
  }, [isCheckBoxChecked]);
  return (
    <Grid container>
      <img
        src="/health-card-back.jpeg"
        ref={imageRef}
        alt="health back"
        style={{ display: "none" }}
      />
      <LeavePageDialog
        open={isLeaveDialogOpned}
        handleClose={() => setIsLeaveDialogOpned(false)}
        handleLeave={handleLeaveDialog}
      />
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
                sx={{
                  ...(Object.keys(markAsPrintPending).includes(
                    `${groupName}/${firtsData?.created_by_uid}`
                  )
                    ? { color: "white", background: colors.primary[500] }
                    : { color: colors.primary[500], background: "white" }),
                }}
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
                    secondaryImage: imageRef.current,
                  });
                  setMarkAsPrintPending((pre) => ({
                    ...pre,
                    [`${groupName}/${firtsData?.created_by_uid}`]: true,
                  }));
                }}
              >
                Download
              </Button>
              {(isDownloadCompleted ||
                Object.keys(markAsPrintPending).includes(
                  `${groupName}/${firtsData?.created_by_uid}`
                )) && (
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
                    setMarkAsPrintPending((pre) => {
                      const newObject = { ...pre };
                      console.log("before delete", newObject);
                      delete newObject[
                        `${groupName}/${firtsData?.created_by_uid}`
                      ];
                      return newObject;
                    });
                    markAsPrint({ ids: groupedData.map((gd) => gd._id) }).then(
                      () => {
                        setIsDownloadCompleted(false);
                        setMarkAsPrintPending((pre) => {
                          delete pre[
                            `${groupName}/${firtsData?.created_by_uid}`
                          ];
                          return pre;
                        });
                        handleMarkAsPrintApiCall();
                        storageUtil.removeItem("markAsPrintedData");
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
            showActionMenu
            // sortType={urlDateType.get("sortType") === "des" ? "des" : null}
          />
        </Grid>
      )}
    </Grid>
  );
};

export default TableWithCheckBox;
