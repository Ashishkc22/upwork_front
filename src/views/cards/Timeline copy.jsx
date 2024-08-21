// src/components/StatusTimeline.js
import React from "react";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import LaptopMacIcon from "@mui/icons-material/LaptopMac";
import HotelIcon from "@mui/icons-material/Hotel";
import RepeatIcon from "@mui/icons-material/Repeat";
import { Typography, Box, Paper } from "@mui/material";
import TimelineDot from "@mui/lab/TimelineDot";

const statusIcons = {
  SUBMITTED: <FastfoodIcon />,
  DISCARDED: <LaptopMacIcon />,
  REPRINT: <HotelIcon />,
  RTO: <RepeatIcon />,
  DELIVERED: <LaptopMacIcon />,
  UNDELIVERED: <HotelIcon />,
};

const StatusTimeline = ({ data }) => {
  return (
    <Timeline position="alternate" sx={{ padding: 2 }}>
      {data.map((item, index) => (
        <TimelineItem key={index}>
          <TimelineOppositeContent
            sx={{ m: "auto 0", fontWeight: "bold", color: "text.primary" }}
            align="right"
            variant="body2"
          >
            {/* Placeholder time - you may want to include actual timestamp data */}
            {new Date().toLocaleTimeString()}
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineConnector sx={{ bgcolor: "primary.main" }} />
            <TimelineDot color="primary" variant="filled" sx={{ boxShadow: 3 }}>
              {statusIcons[item.updated_status] || <FastfoodIcon />}
            </TimelineDot>
            <TimelineConnector sx={{ bgcolor: "primary.main" }} />
          </TimelineSeparator>
          <TimelineContent sx={{ py: "12px", px: 2 }}>
            <Paper elevation={3} sx={{ padding: 2, borderRadius: 2 }}>
              <Typography
                variant="h6"
                component="span"
                sx={{ fontWeight: "bold", color: "primary.main" }}
              >
                {item.updated_status}
              </Typography>
              <Typography sx={{ mt: 1, color: "text.secondary" }}>
                Previous Status: <strong>{item.previous_status}</strong>
              </Typography>
              <Typography sx={{ mt: 1, color: "text.secondary" }}>
                Updated By: <strong>{item.updated_by.name}</strong>
              </Typography>
            </Paper>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
};

export default StatusTimeline;
