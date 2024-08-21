import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
} from "@mui/material";

const CustomTextFieldDialog = ({
  open,
  onClose,
  title,
  textValue,
  onTextChange,
  onAdd,
  addDialogText,
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{ my: 2, py: 2 }}>
        <TextField
          label={addDialogText}
          fullWidth
          value={textValue}
          onChange={(e) => onTextChange(e.target.value)}
          variant="standard"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onAdd} color="primary">
          Add
        </Button>
        <Button onClick={onClose} color="secondary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomTextFieldDialog;
