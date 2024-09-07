// src/components/StatusDialog.js
import React from "react";
import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import StatusTimeline from "./Timeline";

const StatusDialog = ({ open, onClose, data }) => {
  return (
    <Dialog
      onClose={onClose}
      open={open}
      fullWidth
      maxWidth="md"
      sx={{
        ".css-rnmm7m-MuiPaper-root-MuiDialog-paper": {
          overflowX: "hidden",
        },
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <DialogTitle>
        Status Timeline
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <StatusTimeline data={data} />
      </DialogContent>
    </Dialog>
  );
};

export default StatusDialog;
