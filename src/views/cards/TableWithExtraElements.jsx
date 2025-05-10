import React, { useEffect, useState, useRef } from "react";
import { Grid, Box, Typography, Button, useTheme } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import Checkbox from "@mui/material/Checkbox";
import { tokens } from "../../theme";
import IconButton from "@mui/material/IconButton";

import ArogyamComponent from "../../components/ArogyaCard_v2";
import Tooltip from "@mui/material/Tooltip";
import downloadCards from "../../utils/downloadCards";
import CheckIcon from "@mui/icons-material/Check";
import cardService from "../../services/cards";

import TableWithCheckBox from "./TableWithCheckBox";

import waterMarkImg from "../../v1cardImages/waterMark.svg";
import supportImg from "../../v1cardImages/support.png";
import locImg from "../../v1cardImages/loc.png";
import phoneImg from "../../v1cardImages/phone.png";
import cardLogoImg from "../../v1cardImages/cardLogo.png";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ListItemButton from "@mui/material/ListItemButton";
import Collapse from "@mui/material/Collapse";
import { isEmpty, isEqual, difference } from "lodash";
import { useCardContext } from "./context/CardContext";
import storageUtil from "../../utils/storage.util";
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

// Extra Elements
const TableWithExtraElements = ({
  groupName = {},
  cardCount = 0,
  getCardsData,
  feList = [],
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
  handleMarkAsPrintApiCall,
}) => {
  const {
    toBePrintedCards,
    FEDetails,
    currentActiveLocation,
    setCurrentActiveLocation,
    TLDetails,
    getCardsByLocation,
    allLocationUIDlist,
    getTobePrinntedCards,
  } = useCardContext();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [locationFEUidList, setLocationFEUidList] = useState([]); //For checkbox

  const [open, setOpen] = useState(false);
  const [totalCardCount, setTotalCardCount] = useState({});
  const imageRef = useRef(null);

  // const getGroupDataLenght = () => {
  //   return groupedData.reduce((value, data) => data.cardCount + value, 0);
  // };
  useEffect(() => {
    if (isDownloadCompleted) {
      setLocationFEUidList([]);
    }
  }, [isDownloadCompleted]);

  const isCurrentGroupOpen = () =>
    currentActiveLocation?.district === groupName.district &&
    currentActiveLocation?.tehsil === groupName.tehsil;

  return (
    <Grid container sx={{ mx: 2 }} rowGap={2}>
      <img
        src="/health-card-back.png"
        ref={imageRef}
        alt="health back"
        style={{ display: "none" }}
      />
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
                checked={
                  isEmpty(locationFEUidList)
                    ? false
                    : allLocationUIDlist[
                        `${groupName.district} ${groupName.tehsil}`
                      ]?.every((k) => locationFEUidList.includes(k))
                }
                indeterminate={
                  isEmpty(locationFEUidList)
                    ? false
                    : !allLocationUIDlist[
                        `${groupName.district} ${groupName.tehsil}`
                      ]?.every((k) => locationFEUidList.includes(k))
                }
              />
            }
            onClick={() => {
              if (
                !toBePrintedCards[`${groupName.district} ${groupName.tehsil}`]
              ) {
                getCardsByLocation({ location: groupName, feList }).then(
                  (data) => {
                    const allCurrentKey = Object.keys(data).map(
                      (k) => `${groupName.district} ${groupName.tehsil}/${k}`
                    );
                    if (isEmpty(locationFEUidList)) {
                      setLocationFEUidList(allCurrentKey);
                      increaseDownloadCardCount(cardCount);
                    } else {
                      increaseDownloadCardCount(-cardCount);
                      setLocationFEUidList([]);
                    }
                    handleMultipleCheckBox(allCurrentKey);
                  }
                );
              } else {
                const allCurrentKey =
                  allLocationUIDlist[
                    `${groupName.district} ${groupName.tehsil}`
                  ];
                if (isEmpty(locationFEUidList)) {
                  setLocationFEUidList(allCurrentKey);
                  increaseDownloadCardCount(cardCount);
                } else {
                  increaseDownloadCardCount(-cardCount);
                  setLocationFEUidList([]);
                }
                handleMultipleCheckBox(allCurrentKey);
              }
            }}
          >{`${groupName.district} / ${groupName.tehsil} (Total: ${cardCount})`}</Button>
          <Tooltip title="Download full tehsil">
            <IconButton
              aria-label="Download full tehsil"
              sx={{
                color: colors.primary[500],
              }}
              onClick={() => {
                setIsCardDownload(true);
                const downloadCardData = [];
                Object.keys(
                  toBePrintedCards?.[
                    `${groupName.district} ${groupName.tehsil}`
                  ] || {}
                ).forEach((key) => {
                  const _FEDetails = FEDetails[key] || {};
                  const _TLDetails = TLDetails[_FEDetails.team_leader_id] || {};
                  const cards =
                    toBePrintedCards[
                      `${groupName.district} ${groupName.tehsil}`
                    ][key] || [];
                  debugger;
                  downloadCardData.push({
                    cards,
                    teamLeaderDetails: [_TLDetails || {}],
                    userDetails: _FEDetails,
                    cardCount: cards.length,
                  });
                });
                const districtName = groupName.district;
                downloadCards.downloadMultipleCardWithMultipleAgent({
                  Element: ArogyamComponent,
                  cardData: downloadCardData,
                  secondaryImage: imageRef.current,
                  handleDownloadCompleted: () => {
                    const keys = {};
                    // toBePrintedCards?.[
                    //   `${groupName.district} ${groupName.tehsil}`
                    // ].forEach((cardData) => {
                    //   keys[`${groupName}/${cardData._id.createdBy}`] = true;
                    // });
                    setIsCardDownload(false);
                    // setIsDownloadCompleted({ [groupName]: true });
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

          {Object.keys(
            toBePrintedCards?.[`${groupName.district} ${groupName.tehsil}`] ||
              {}
          ).every((feUiD) =>
            Object.keys(markAsPrintPending).includes(
              `${groupName.district} / ${groupName.tehsil}/${feUiD}`
            )
          ) && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                let ids = [];
                let keys = [];
                // keys.push(firsttableData._id.location);
                Object.keys(
                  toBePrintedCards?.[
                    `${groupName.district} ${groupName.tehsil}`
                  ] || {}
                ).forEach((feUid) => {
                  keys.push(
                    `${groupName.district} / ${groupName.tehsil}/${feUid}`
                  );
                  const cards =
                    toBePrintedCards?.[
                      `${groupName.district} ${groupName.tehsil}`
                    ][feUid];
                  ids = [...ids, ...cards.map((a) => a._id)];
                });
                setMarkAsPrintPending((pre) => {
                  const newObj = { ...pre };
                  keys.forEach((id) => {
                    delete newObj[id];
                  });
                  return newObj;
                });
                markAsPrint({ ids }).then(() => {
                  setIsDownloadCompleted({});
                  getTobePrinntedCards();
                  // storageUtil.removeItem("markAsPrintedData");
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
        </Box>
        <ListItemButton
          sx={{ mr: 4, justifyContent: "end" }}
          onClick={() => {
            if (!isCurrentGroupOpen()) {
              getCardsData(groupName, feList);
              setCurrentActiveLocation(groupName);
            } else {
              setCurrentActiveLocation({});
            }
          }}
        >
          {isCurrentGroupOpen() ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
      </Grid>
      <Grid item xs={12}>
        <Collapse in={isCurrentGroupOpen()} timeout="auto">
          {Object.keys(
            toBePrintedCards?.[`${groupName.district} ${groupName.tehsil}`] ||
              {}
          )?.map((feUidKey, index) => {
            // const groupByDistrict = groupedData[key];

            const firtsData = {
              created_by_uid: FEDetails[feUidKey].uid,
              created_by_name: FEDetails[feUidKey].name,
            };
            const key = feUidKey;
            // const dataLength = groupedData[key].length;
            return (
              <TableWithCheckBox
                key={feUidKey + index}
                firtsData={firtsData}
                dataLength={
                  toBePrintedCards?.[
                    `${groupName.district} ${groupName.tehsil}`
                  ][feUidKey].length
                }
                colors={colors}
                groupedData={
                  toBePrintedCards?.[
                    `${groupName.district} ${groupName.tehsil}`
                  ][feUidKey]
                }
                id={feUidKey}
                actions={[]}
                isCheckBoxChecked={locationFEUidList.includes(
                  `${groupName.district} ${groupName.tehsil}/${feUidKey}`
                )}
                tlDetails={TLDetails[FEDetails[feUidKey].team_leader_id]}
                checkBoxClicked={(id, value) => {
                  const key = `${groupName.district} ${groupName.tehsil}/${id}`;
                  setLocationFEUidList((prev) => {
                    if (!prev.includes(key)) {
                      const newArray = [...prev];
                      newArray.push(key);
                      return newArray;
                    } else if (!value && prev.includes(key)) {
                      const newArray = prev.filter((k) => k !== key);
                      return newArray;
                    }
                    return prev;
                  });
                  handleMultipleCheckBox([key]);
                }}
                highlightedRow={highlightedRow}
                handleMenuSelect={handleMenuSelect}
                agentName={firtsData?.created_by_name || ""}
                isImageMode={isImageMode}
                isDownloadCompleted={isDownloadCompleted || {}}
                increaseDownloadCardCount={increaseDownloadCardCount}
                setMarkAsPrintPending={setMarkAsPrintPending}
                markAsPrintPending={markAsPrintPending}
                handleSort={(data) => {
                  handleSort({ ...data, location: groupName, feUid: feUidKey });
                }}
                setIsCardDownload={setIsCardDownload}
                groupName={groupName}
                handleMarkAsPrintApiCall={handleMarkAsPrintApiCall}
              />
              // <>{feCards?._id?.location}</>
            );
          })}
        </Collapse>
      </Grid>
    </Grid>
  );
};

export default TableWithExtraElements;
