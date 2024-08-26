import React, { useEffect, useState } from "react";
import { Grid, Typography, Button, useTheme } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import Checkbox from "@mui/material/Checkbox";
import { tokens } from "../../theme";
import IconButton from "@mui/material/IconButton";

import ArogyamComponent from "../../components/ArogyaCard_v1";
import Tooltip from "@mui/material/Tooltip";
import downloadCards from "../../utils/downloadCards";
import CheckIcon from "@mui/icons-material/Check";
import cardService from "../../services/cards";

import TableWithCheckBox from "./TableWithCheckBox";

function markAsPrint({ ids = [] }) {
  return cardService.markAsPrint(ids.join(","));
}

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
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [districtCheckbox, setDistrictCheckbox] = useState(false);
  const [tableCheckedBox, setTableCheckedBox] = useState({});

  const getGroupDataLenght = () => {
    return Object.keys(groupedData).reduce(
      (value, key) => groupedData[key]?.length + value,
      0
    );
  };

  useEffect(() => {
    if (isDownloadCompleted) {
      setDistrictCheckbox(false);
      if (Object.keys(groupedData)) {
        const newCheckedBox = {};
        Object.keys(groupedData).forEach((key) => (newCheckedBox[key] = false));
        setTableCheckedBox(newCheckedBox);
      }
    }
  }, [isDownloadCompleted]);

  useEffect(() => {
    if (Object.keys(groupedData)) {
      const newCheckedBox = {};
      Object.keys(groupedData).forEach((key) => (newCheckedBox[key] = false));
      setTableCheckedBox(newCheckedBox);
    }
  }, []);

  return (
    <Grid container sx={{ mx: 2 }} rowGap={2}>
      <Grid item xs={12} alignItems="cenetr">
        <Button
          sx={{ background: colors.grey[100], px: 1 }}
          startIcon={
            <Checkbox
              checked={
                districtCheckbox
                // Object.entries(tableCheckedBox).some(
                //   ([key, value]) => value === true
                // )
              }
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
            setDistrictCheckbox(!districtCheckbox);
            if (!districtCheckbox) {
              handleMultipleCheckBox({
                type: "all",
                value: Object.keys(groupedData),
                groupName,
              });

              increaseDownloadCardCount(
                Object.keys(groupedData).reduce((total, key) => {
                  if (tableCheckedBox[key]) {
                    return total;
                  }
                  return total + groupedData[key].length;
                }, 0)
              );
            }

            if (!!districtCheckbox) {
              handleMultipleCheckBox({ type: "all", value: [], groupName });
              increaseDownloadCardCount(
                -Object.keys(groupedData).reduce((total, key) => {
                  if (!tableCheckedBox[key]) {
                    return total;
                  }
                  return total + groupedData[key].length;
                }, 0)
              );
            }

            // reset value
            const newCheckedBox = {};
            Object.keys(tableCheckedBox).forEach(
              (key) => (newCheckedBox[key] = !districtCheckbox)
            );
            setTableCheckedBox(newCheckedBox);
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
                handleDownloadCompleted: () => {
                  const keys = {};
                  Object.keys(groupedData).forEach((key) => {
                    keys[key] = true;
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
        {isDownloadCompleted[groupName] && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              let ids = [];
              let keys = [];
              Object.keys(groupedData).forEach((key) => {
                keys.push(key);
                if (isDownloadCompleted[groupName]) {
                  const data = groupedData[key];
                  console.log("key", key);
                  ids = [...ids, ...data.map((a) => a._id)];
                }
              });
              setMarkAsPrintPending((pre) => {
                keys.forEach((id) => {
                  delete pre[id];
                });
                return pre;
              });
              markAsPrint({ ids }).then(() => {
                setIsDownloadCompleted({});
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

      {Object.keys(groupedData).map((key, index) => {
        const [firtsData] = groupedData[key];
        const dataLength = groupedData[key].length;
        return (
          <TableWithCheckBox
            key={key + index + dataLength}
            firtsData={firtsData}
            dataLength={dataLength}
            colors={colors}
            groupedData={groupedData[key]}
            id={key}
            actions={[]}
            isCheckBoxChecked={tableCheckedBox[key]}
            checkBoxClicked={(id, value) => {
              handleMultipleCheckBox({
                type: value ? "add" : "remove",
                value: key,
                groupName,
              });
              let isEveryValueFalse = true;
              Object.keys(groupedData).forEach((lockey) => {
                if (key != lockey) {
                  isEveryValueFalse = !tableCheckedBox[lockey];
                } else {
                  isEveryValueFalse = !value;
                }
              });
              if (isEveryValueFalse) {
                setDistrictCheckbox(false);
              }

              let isEveryValueTrue = false;
              Object.keys(groupedData).forEach((lockey) => {
                if (key != lockey) {
                  isEveryValueTrue = tableCheckedBox[lockey];
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
          />
        );
      })}
    </Grid>
  );
};

export default TableWithExtraElements;
