import React, { useEffect, useState, useRef } from "react";
import { Grid, Typography, Button, useTheme } from "@mui/material";
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

import waterMarkImg from "../../v1cardImages/waterMark.png";
import supportImg from "../../v1cardImages/support.png";
import locImg from "../../v1cardImages/loc.png";
import phoneImg from "../../v1cardImages/phone.png";
import cardLogoImg from "../../v1cardImages/cardLogo.png";
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
  handleMarkAsPrintApiCall,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [districtCheckbox, setDistrictCheckbox] = useState(false);
  const [tableCheckedBox, setTableCheckedBox] = useState({});
  const imageRef = useRef(null);

  const getGroupDataLenght = () => {
    return groupedData.reduce((value, data) => data.cardCount + value, 0);
  };

  useEffect(() => {
    if (isDownloadCompleted) {
      setDistrictCheckbox(false);
      if (groupedData.length) {
        const newCheckedBox = {};
        groupedData.forEach(
          (cardData) => (newCheckedBox[cardData._id.createdBy] = false)
        );
        setTableCheckedBox(newCheckedBox);
      }
    }
  }, [isDownloadCompleted]);

  useEffect(() => {
    if (groupedData.length) {
      const newCheckedBox = {};
      groupedData.forEach(
        (cardData) => (newCheckedBox[cardData._id.createdBy] = false)
      );

      setTableCheckedBox(newCheckedBox);
    }
  }, []);

  return (
    <Grid container sx={{ mx: 2 }} rowGap={2}>
      <img
        src="/health-card-back.jpeg"
        ref={imageRef}
        alt="health back"
        style={{ display: "none" }}
      />
      <Grid item xs={12} alignItems="cenetr">
        <Button
          sx={{ background: colors.grey[100], px: 1 }}
          startIcon={
            <Checkbox
              checked={districtCheckbox}
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
            if (!districtCheckbox) {
              handleMultipleCheckBox({
                type: "all",
                value: groupedData.map((d) => d._id.createdBy),
                groupName,
              });

              increaseDownloadCardCount(
                groupedData.reduce((total, cardData) => {
                  if (tableCheckedBox[cardData._id.createdBy]) {
                    return total;
                  }
                  return total + cardData.cardCount;
                }, 0)
              );
            }

            if (!!districtCheckbox) {
              handleMultipleCheckBox({ type: "all", value: [], groupName });
              const unSelectedCount = groupedData.reduce((total, cardData) => {
                if (!tableCheckedBox[cardData._id.createdBy]) {
                  return total;
                }
                return total + cardData.cardCount;
              }, 0);
              increaseDownloadCardCount(-unSelectedCount);
            }

            // reset value
            const newCheckedBox = {};
            Object.keys(tableCheckedBox).forEach(
              (key) => (newCheckedBox[key] = !districtCheckbox)
            );
            setTableCheckedBox(newCheckedBox);
            setDistrictCheckbox(!districtCheckbox);
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
                secondaryImage: imageRef.current,
                handleDownloadCompleted: () => {
                  const keys = {};
                  groupedData.forEach((cardData) => {
                    keys[`${groupName}/${cardData._id.createdBy}`] = true;
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
        {/* {JSON.stringify(Object.keys(markAsPrintPending))}
        {JSON.stringify(groupedData.map((feData) => feData.userDetails.uid))} */}
        {groupedData.every((feData) =>
          Object.keys(markAsPrintPending).includes(
            `${groupName}/${feData.userDetails.uid}`
          )
        ) && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              let ids = [];
              let keys = [];
              const [firsttableData] = groupedData;
              // keys.push(firsttableData._id.location);
              groupedData.forEach((data) => {
                keys.push(
                  `${firsttableData._id.location}/${data.userDetails.uid}`
                );
                const cards = data.cards;
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
                handleMarkAsPrintApiCall();
                storageUtil.removeItem("markAsPrintedData");
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

      {groupedData.map((feCards, index) => {
        // const groupByDistrict = groupedData[key];
        const firtsData = {
          created_by_uid: feCards.userDetails.uid,
          created_by_name: feCards.userDetails.name,
        };
        const key = feCards._id.createdBy;

        // const dataLength = groupedData[key].length;
        return (
          <TableWithCheckBox
            key={feCards.uid + index + firtsData.created_by_uid}
            firtsData={firtsData}
            dataLength={feCards.cardCount}
            colors={colors}
            groupedData={feCards.cards}
            id={feCards._id.location}
            actions={[]}
            isCheckBoxChecked={tableCheckedBox[key]}
            tlDetails={feCards.teamLeaderDetails[0]}
            checkBoxClicked={(id, value) => {
              handleMultipleCheckBox({
                type: value ? "add" : "remove",
                value: key,
                groupName,
              });
              let isEveryValueFalse = true;
              groupedData.forEach((lockey) => {
                if (key != lockey._id.createdBy) {
                  isEveryValueFalse = !tableCheckedBox[lockey._id.createdBy];
                } else {
                  isEveryValueFalse = !value;
                }
              });
              if (isEveryValueFalse) {
                setDistrictCheckbox(false);
              }

              let isEveryValueTrue = false;
              groupedData.forEach((lockey) => {
                if (key != lockey._id.createdBy) {
                  isEveryValueTrue = tableCheckedBox[lockey._id.createdBy];
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
            groupName={groupName}
            handleMarkAsPrintApiCall={handleMarkAsPrintApiCall}
          />
          // <>{feCards?._id?.location}</>
        );
      })}
    </Grid>
  );
};

export default TableWithExtraElements;
