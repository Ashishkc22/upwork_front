import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Grid,
  InputAdornment,
  FormControl,
  InputLabel,
  Input,
  Select,
  MenuItem,
} from "@mui/material";

const CustomTextFieldDialog = ({
  open,
  onClose,
  title,
  onTextChange,
  onAdd,
  updateTitle,
  stackName,
  mode = "add",
  formData,
  tehsilOptions = [],
  setFormData,
  setDialogMode,
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{mode === "add" ? title : updateTitle}</DialogTitle>
      <DialogContent sx={{ my: 2, py: 2 }}>
        <Grid container columnSpacing={1}>
          <Grid item xs={12}>
            <TextField
              label="Name"
              fullWidth
              value={formData.name}
              onChange={(e) => onTextChange(e.target.value, "name")}
              variant="standard"
            />
          </Grid>

          {stackName === "gram" && mode === "edit" && (
            <Grid item xs={12}>
              <FormControl fullWidth sx={{ my: 1 }} variant="standard">
                <InputLabel htmlFor="standard-adornment-password">
                  Map Link
                </InputLabel>
                <Input
                  id="standard-adornment-password"
                  value={formData.map_link}
                  onChange={(e) => onTextChange(e.target.value, "map_link")}
                  endAdornment={
                    <InputAdornment position="end">
                      <Button
                        sx={{ m: 0, p: 0 }}
                        size="small"
                        onClick={() =>
                          formData?.map_link &&
                          window.open(`https://${formData.map_link}`, "_blank")
                        }
                      >
                        Open
                      </Button>
                    </InputAdornment>
                  }
                />
              </FormControl>
            </Grid>
          )}

          {/* sarpanch */}
          {stackName === "gramPanchayat" && mode === "edit" && (
            <Grid item xs={6}>
              <TextField
                sx={{ my: 1 }}
                label="Sarpanch"
                fullWidth
                value={formData.sarpanch}
                onChange={(e) => onTextChange(e.target.value, "sarpanch")}
                variant="standard"
              />
            </Grid>
          )}
          {stackName === "gramPanchayat" && mode === "edit" && (
            <Grid item xs={6}>
              <FormControl sx={{ my: 1 }} variant="standard">
                <InputLabel htmlFor="standard-adornment-password">
                  Sarpanch Phone
                </InputLabel>
                <Input
                  id="standard-adornment-password"
                  type={"number"}
                  value={formData.sarpanchPhone}
                  onChange={(e) =>
                    e.target?.value?.length <= 10 &&
                    onTextChange(e.target.value, "sarpanchPhone")
                  }
                  endAdornment={
                    <InputAdornment position="end">
                      <Button
                        sx={{ m: 0, p: 0 }}
                        size="small"
                        onClick={() =>
                          window.open(`tel:${formData.sarpanchPhone}`)
                        }
                      >
                        Call
                      </Button>
                    </InputAdornment>
                  }
                />
              </FormControl>
            </Grid>
          )}
          {/* Sachiv */}
          {stackName === "gramPanchayat" && mode === "edit" && (
            <Grid item xs={6}>
              <TextField
                sx={{ my: 1 }}
                label="Sachiv"
                fullWidth
                value={formData.sachiv}
                onChange={(e) => onTextChange(e.target.value, "sachiv")}
                variant="standard"
              />
            </Grid>
          )}
          {stackName === "gramPanchayat" && mode === "edit" && (
            <Grid item xs={6}>
              <FormControl sx={{ my: 1 }} variant="standard">
                <InputLabel htmlFor="standard-adornment-password">
                  Sachiv Phone
                </InputLabel>
                <Input
                  id="standard-adornment-password"
                  type={"number"}
                  value={formData.sachivPhone}
                  onChange={(e) =>
                    e.target?.value?.length <= 10 &&
                    onTextChange(e.target.value, "sachivPhone")
                  }
                  endAdornment={
                    <InputAdornment position="end">
                      <Button
                        sx={{ m: 0, p: 0 }}
                        size="small"
                        onClick={() =>
                          window.open(`tel:${formData.sachivPhone}`)
                        }
                      >
                        Call
                      </Button>
                    </InputAdornment>
                  }
                />
              </FormControl>
            </Grid>
          )}

          {stackName === "gramPanchayat" && mode === "edit" && (
            <Grid item xs={6}>
              <TextField
                sx={{ my: 1 }}
                label="Rojgar Sahayak"
                fullWidth
                value={formData.rojgarSahayak}
                onChange={(e) => onTextChange(e.target.value, "rojgarSahayak")}
                variant="standard"
              />
            </Grid>
          )}
          {stackName === "gramPanchayat" && mode === "edit" && (
            <Grid item xs={6}>
              <FormControl sx={{ my: 1 }} variant="standard">
                <InputLabel htmlFor="standard-adornment-password">
                  Rojgar Sahayak Phone
                </InputLabel>
                <Input
                  id="standard-adornment-password"
                  type={"number"}
                  value={formData.rojgarSahayakPhone}
                  onChange={(e) =>
                    e.target?.value?.length <= 10 &&
                    onTextChange(e.target.value, "rojgarSahayakPhone")
                  }
                  endAdornment={
                    <InputAdornment position="end">
                      <Button
                        sx={{ m: 0, p: 0 }}
                        size="small"
                        onClick={() =>
                          window.open(`tel:${formData.rojgarSahayakPhone}`)
                        }
                      >
                        Call
                      </Button>
                    </InputAdornment>
                  }
                />
              </FormControl>
            </Grid>
          )}
          {stackName === "gramPanchayat" && mode === "edit" && (
            <Grid item xs={12}>
              <TextField
                label="Pincode"
                fullWidth
                value={formData.pincode}
                onChange={(e) =>
                  e.target?.value?.length <= 6 &&
                  onTextChange(e.target.value, "pincode")
                }
                variant="standard"
              />
            </Grid>
          )}
          {stackName === "gramPanchayat" && mode === "edit" && (
            <Grid item xs={12}>
              <FormControl fullWidth variant="standard" sx={{ my: 1 }}>
                <InputLabel id="demo-simple-select-standard-label">
                  Tehsil (Optional)
                </InputLabel>
                <Select
                  labelId="demo-simple-select-standard-label"
                  id="demo-simple-select-standard"
                  placeholder="Select Teshil (Optional)"
                  value={formData.tehsil}
                  onChange={(e) => onTextChange(e.target.value, "tehsil")}
                  label="Tehsil"
                >
                  {tehsilOptions.map((t) => (
                    <MenuItem value={t._id}>{t.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onAdd} color="primary">
          Save
        </Button>
        <Button
          onClick={() => {
            if (mode === "edit") {
              setDialogMode("add");
            }
            if (setFormData) {
              setFormData({});
            }
            onClose();
          }}
          color="secondary"
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomTextFieldDialog;
