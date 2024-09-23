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
import CardPreviewDialog from "./CardPreviewDialog";

let typingTimer;

const headers = [
  { label: "SNO", key: "index" },
  { label: "NAME", key: "name" },
  { label: "CREATED BY", key: "created_by_uid" },
  { label: "UID", key: "unique_number" },

  { label: "F/H NAME", key: "father_husband_name" },
  {
    label: "AGE",
    key: "birth_year",
    isFunction: true,
  },
  { label: "MOB NO.", key: "phone" },
  { label: "DELETED AT", key: "deleted_at" },
  // { label: "EXPIRY", key: "expiry_date" },
  { label: "STATUS", key: "status" },
  { label: "", key: "ACTION" },
];

const CardBin = ({ binData, handleDataRestore }) => {
  const [selectedCard, setSelectedCardData] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  return (
    <div>
      <CardPreviewDialog
        cardData={selectedCard}
        open={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        setSelectedCardData={setSelectedCardData}
      />
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
        rowClick={(data) => {
          setIsDialogOpen(true);
          setSelectedCardData(data);
        }}
      />
    </div>
  );
};

export default CardBin;
