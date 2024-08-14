import React, { useState } from "react";
import { Dialog, DialogActions, Button, Box } from "@mui/material";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";

const DatePickerDialog = ({ open, onClose, onApply }) => {
  const [selectedDate, setValue] = useState(new Date());

  const handleClose = () => {
    setValue(new Date());
    onClose();
  };

  const handleApply = () => {
    onApply(new Date(selectedDate));
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
          <DateCalendar
            defaultValue={dayjs(selectedDate)}
            onChange={(newValue) => setValue(newValue)}
          />
        </Box>
      </LocalizationProvider>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleApply} variant="contained" color="primary">
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DatePickerDialog;
