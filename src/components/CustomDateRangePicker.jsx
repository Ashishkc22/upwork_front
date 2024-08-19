import React, { useState } from "react";
import { Dialog, DialogActions, Button } from "@mui/material";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css"; // Import the styles
import "react-date-range/dist/theme/default.css"; // Import the theme

const DateRangeDialog = ({ open, onClose, onApply, isSingleSelect }) => {
  const [range, setRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const handleCloseDialog = () => {
    setRange([
      {
        startDate: new Date(),
        endDate: new Date(),
        key: "selection",
      },
    ]);
    onClose();
  };

  const handleApply = () => {
    onApply(range);
    handleCloseDialog();
  };

  return (
    <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm">
      {/* <DialogContent > */}
      <DateRange
        editableDateInputs={true}
        onChange={(item) => setRange([item.selection])}
        moveRangeOnFirstSelection={false}
        ranges={range}
      />
      {/* </DialogContent> */}
      <DialogActions sx={{ p: 0, m: 1 }}>
        <Button onClick={handleCloseDialog} color="primary">
          Cancel
        </Button>
        <Button onClick={handleApply} variant="contained" color="primary">
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DateRangeDialog;
