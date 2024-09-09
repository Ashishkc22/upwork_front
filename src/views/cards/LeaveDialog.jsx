import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";

const LeavePageDialog = ({ open, handleClose, handleLeave }) => {
  return (
    <Dialog open={open}>
      <DialogTitle>{"Are you sure you want to leave this page?"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Your changes might not be saved. Are you sure you want to leave this
          page?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleLeave} color="secondary" autoFocus>
          Leave
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LeavePageDialog;
