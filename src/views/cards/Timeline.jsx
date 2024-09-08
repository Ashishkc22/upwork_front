// src/components/StatusTimeline.js
import React from "react";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import RefreshIcon from "@mui/icons-material/Refresh";
import LocalPostOfficeIcon from "@mui/icons-material/LocalPostOffice";
import { Typography, Box, Paper } from "@mui/material";
import TimelineDot from "@mui/lab/TimelineDot";
import moment from "moment";
import { List, ListItem, ListItemText } from "@mui/material";

const statusIcons = {
  SUBMITTED: <CheckCircleIcon />,
  DISCARDED: <CancelIcon />,
  REPRINT: <RefreshIcon />,
  RTO: <LocalPostOfficeIcon />,
  DELIVERED: <CheckCircleIcon />,
  UNDELIVERED: <CancelIcon />,
};

const StatusTimeline = ({ data }) => {
  return (
    <Timeline sx={{ padding: 2 }}>
      <List>
        {data.map((item, index) => (
          <ListItem key={index} divider>
            <Box display="flex" justifyContent="space-around" width="100%">
              {/* Status */}
              <Typography
                variant="body1"
                sx={{ fontWeight: "bold", width: "100px" }}
              >
                {item.updated_status}
              </Typography>

              {/* Reason */}
              <Box display="block" sx={{ width: "177px" }}>
                {item?.reason && (
                  <>
                    <Typography
                      variant="body1"
                      sx={{ minWidth: "100px", fontWeight: "bold" }}
                    >
                      Reason:
                    </Typography>
                    <Typography variant="body1" sx={{ minWidth: "100px" }}>
                      {item.reason}
                    </Typography>
                  </>
                )}
              </Box>

              {/* Updated By */}
              <Box display="flex">
                Updated By :
                <Typography
                  variant="body1"
                  sx={{ fontWeight: "bold", minWidth: "150px" }}
                >
                  {item.updated_by.name}
                </Typography>
              </Box>

              {/* Timestamp */}
              <Typography
                variant="body2"
                sx={{ minWidth: "150px", fontWeight: "bold" }}
              >
                {item.created_at &&
                  moment(item.created_at).format("DD-MM-YYYY HH:mm")}
              </Typography>
            </Box>
          </ListItem>
        ))}
      </List>
    </Timeline>
  );
};

export default StatusTimeline;
