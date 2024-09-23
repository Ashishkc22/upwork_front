import Header from "../../components/Header";
import { Grid, Card, TablePagination, Box, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import field_executives from "../../services/field_executives";
import { isEmpty } from "lodash";
import { useEffect, useState } from "react";
import CustomTable from "../../components/CustomTable";
import { useNavigate, useSearchParams } from "react-router-dom";
import LinearIndeterminate from "../../components/LinearProgress";
import RestoreIcon from "@mui/icons-material/Restore";
import bin from "../../services/bin";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { tokens } from "../../theme";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

let typingTimer;

const headers = [
  {
    label: "SNO",
    key: "index",
    indicator: true,
    getColor: ({ status }) => {
      return status === "ENABLE" ? "green" : "red";
    },
  },
  { label: "UID", key: "uid" },
  { label: "NAME", key: "entity_name" },
  { label: "REG NO", key: "reg_no" },
  { label: "MOB NO.", key: "mobile_no" },
  { label: "CITY", key: "city" },
  { label: "DISTRICT", key: "district" },
  { label: "JOINED DATE", key: "created_at" },
  { label: "", key: "ACTION" },
];

const HospitalBin = ({ binData, handleDataRestore }) => {
  return (
    <CustomTable
      headers={headers}
      rows={binData}
      dataForSmallScreen={{
        use: true,
        title: { keys: ["name", "created_by_uid", "deleted_at"] },
      }}
      showPagiantion
      showActionMenu={false}
      actions={[
        {
          label: "Restore",
          smallIcon: <RestoreIcon size="small" />,
          icon: <RestoreIcon />,
          handler: handleDataRestore,
        },
      ]}
    />
  );
};

export default HospitalBin;
