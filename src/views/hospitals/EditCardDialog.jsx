import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  TextField,
  Box,
  FormGroup,
  Checkbox,
  CardMedia,
  Card,
  CardContent,
} from "@mui/material";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import hospitals from "../../services/hospitals";
import Stack from "@mui/material/Stack";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import DeleteIcon from "@mui/icons-material/Delete";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import { DemoItem } from "@mui/x-date-pickers/internals/demo";
import dayjs from "dayjs";
import { isEmpty } from "lodash";
import ImageListCard from "./ImageList.";
import common from "../../services/common";
import storageUtil from "../../utils/storage.util";
import CancelPresentationIcon from "@mui/icons-material/CancelPresentation";

const facilities = [
  "Wheel chair",
  "Ambulance",
  "Parking 🅿 ",
  "Waiting Room",
  "Canteen",
  "RO Water",
];

const timings = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const advanceFacilities = [
  "Caseless treatment",
  "MRI / CT Scan",
  "Ayushman Card Accepted",
];

const EditCardDialog = ({ open, onClose, data, mode = "Edit" }) => {
  const [categoryOption, setCategoryOption] = useState([]);
  const [specializtionOptions, setSpecializtionOptions] = useState([]);
  const [formData, setFormData] = useState({
    category: "",
    entity_name: "",
    reg_no: "",
    established_in: "",
    doctors: [],
    basic_facilities: [],
    advance_facilities: [],
    timings: [],
    address: "",
    pincode: "",
    map_link: "",
    city: "",
    tel_no: "",
    mobile_no: "",
    email: "",
    website: "",
    discount_ipd: "",
    discount_opd: "",
    discount_medicine: "",
    discount_diagnostic: "",
    acknowledge: "",
    images: [],
    date_of_agreement: "",
    start_time: "",
    close_time: "",
    state: "",
    district: "",
  });
  const [doctorDetails, setDoctorDetails] = useState({
    name: "",
    type: "",
    specialization: "",
    experience: "",
  });
  const [isImageLoadingInFormData, setIsImageLoadingInFormData] =
    useState(false);

  const [stateOptions, setStateOption] = useState([]);
  // District states
  const [districtOption, setDistrictOption] = useState([]);
  const [draftDataCleared, setDraftDataCleared] = useState(false);

  useEffect(() => {
    if (!isEmpty(data) && mode === "Edit") {
      setFormData(data);
    }
  }, [data]);

  useEffect(() => {
    hospitals.getHospitalCategory().then((data) => {
      setCategoryOption(data.hospital_category);
      setSpecializtionOptions(data.doctor_specialization);
    });
    getAddressData({ type: "state" });
    if (mode !== "Edit") {
      const draftData = storageUtil.getStorageData("hospital-draft-data") || {};
      if (!isEmpty(draftData)) {
        setFormData(draftData);
      }
    }
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    if (name === "pincode" && value?.length > 6) {
      return;
    }
    if (type === "checkbox") {
      setFormData((prevState) => ({
        ...prevState,
        [name]: checked
          ? [...prevState[name], value]
          : prevState[name].filter((item) => item !== value),
      }));
    } else if (type === "number") {
      if (name === "tel_no" && event.target?.value?.length <= 11) {
        setFormData((prevState) => ({
          ...prevState,
          [name]: value,
        }));
      } else if (name !== "tel_no" && event.target?.value?.length <= 10) {
        setFormData((prevState) => ({
          ...prevState,
          [name]: value,
        }));
      }
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleFormChanges = (event) => {
    const { name, value, type, checked } = event.target;
    console.log("name", name);
    console.log("value", value);
    if (name === "established_in" && value?.length > 4) {
      return;
    }
    const newFormData = {
      ...formData,
      [name]: value,
    };
    setFormData(newFormData);
  };
  const convertTimeWithCurrentDate = (timeStr) => {
    // Get the current date
    const now = new Date();

    // Extract hours and minutes from the time string
    const [hours, minutes] = timeStr.split(":").map(Number);

    // Create a new Date object with the current date and the provided time
    const date = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes
    );

    return date;
  };

  const handleFormSubmit = () => {
    if (mode === "Edit") {
      hospitals.saveFormData({ id: data._id, formData }).then((data) => {
        if (!data.error) {
          onClose(true);
        }
      });
    } else {
      hospitals.addHospital({ formData }).then((data) => {
        if (!data.error) {
          onClose(true);
        }
      });
    }
  };

  const handleImagesChange = (newImages) => {
    setFormData((pre) => {
      return {
        ...pre,
        images: newImages,
      };
    });
  };

  function getAddressData(payload) {
    common.getAddressData(payload).then((data) => {
      if (payload?.type == "district" && !data?.error) {
        setDistrictOption(data || []);
      } else {
        if (!data?.error) {
          setStateOption(data);
        }
      }
    });
  }

  return (
    <Dialog
      open={open}
      onClose={(e) => e.stopPropagation()}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box>Edit Hospital</Box>
        <Button
          disabled={!storageUtil.getStorageData("hospital-draft-data")}
          onClick={() => {
            setDraftDataCleared(true);
            storageUtil.removeItem("hospital-draft-data");
          }}
          endIcon={<CancelPresentationIcon />}
        >
          Delete Draft
        </Button>
      </DialogTitle>
      <DialogContent sx={{ height: "700px" }}>
        <Grid container sx={{ py: 2 }} columnSpacing={2} rowSpacing={2}>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel id="Category-label">Category</InputLabel>
              <Select
                labelId="Category-label"
                id="Category-select"
                value={formData.category}
                name="category"
                onChange={handleFormChanges}
                label="Category"
                variant="standard"
              >
                {categoryOption.map((data, index) => {
                  return (
                    <MenuItem value={data.name} key={data.name + index}>
                      {data.name}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Grid>
          <Grid item>
            <TextField
              id="standard-basic"
              label="Entity name"
              name="entity_name"
              value={formData.entity_name}
              onChange={handleFormChanges}
              variant="standard"
              sx={{ width: "260px" }}
            />
          </Grid>
          <Grid item>
            <TextField
              id="standard-basic"
              label="Registration Number"
              value={formData.reg_no}
              name="reg_no"
              onChange={handleFormChanges}
              variant="standard"
              sx={{ width: "260px" }}
            />
          </Grid>
          <Grid item>
            <TextField
              id="standard-basic"
              label="Estisblished in (YYYY)"
              value={formData.established_in}
              name="established_in"
              onChange={handleFormChanges}
              variant="standard"
              sx={{ width: "260px" }}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sx={{
              background: "#f5f5f5",
              mt: 2,
              mx: 1,
              borderRadius: "10px",
              py: 1,
              px: 1,
            }}
          >
            <Grid container columnSpacing={1}>
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight={600}>
                  Dr. Information
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  id="standard-basic"
                  label="Doctor Name"
                  value={doctorDetails.name}
                  onChange={(e) => {
                    setDoctorDetails((pre) => {
                      return {
                        ...pre,
                        name: e.target.value,
                      };
                    });
                  }}
                  variant="standard"
                  sx={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel id="Category-label">Specialization</InputLabel>
                  <Select
                    labelId="specialization-label"
                    id="specialization-select"
                    defaultValue={doctorDetails.specialization}
                    value={doctorDetails.specialization}
                    onChange={(e) => {
                      setDoctorDetails((pre) => {
                        return {
                          ...pre,
                          specialization: e.target.value,
                        };
                      });
                    }}
                    label="Specialization"
                    variant="standard"
                  >
                    {specializtionOptions.map((data, index) => {
                      return (
                        <MenuItem value={data.name} key={data.name + index}>
                          {data.name}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6}>
                <TextField
                  id="standard-basic"
                  label="Experience in Yrs"
                  type="number"
                  value={doctorDetails.experience}
                  onChange={(e) => {
                    if (!e.target?.value || e.target?.value?.length <= 4) {
                      setDoctorDetails((pre) => {
                        return {
                          ...pre,
                          experience: e.target.value,
                        };
                      });
                    }
                  }}
                  variant="standard"
                  sx={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl>
                  <FormLabel id="demo-row-radio-buttons-group-label">
                    Type
                  </FormLabel>
                  <RadioGroup
                    row
                    aria-labelledby="demo-row-radio-buttons-group-label"
                    name="row-radio-buttons-group"
                    value={doctorDetails.type}
                    onChange={(e) => {
                      setDoctorDetails((pre) => {
                        return {
                          ...pre,
                          type: e.target.value,
                        };
                      });
                    }}
                  >
                    <FormControlLabel
                      value="stay"
                      control={<Radio />}
                      label="stay"
                    />
                    <FormControlLabel
                      value="visting"
                      control={<Radio />}
                      label="visting"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFormData((pre) => {
                      const doctors = [...(pre?.doctors ? pre?.doctors : [])];
                      doctors.push(doctorDetails);
                      const newFormData = {
                        ...pre,
                        doctors,
                      };
                      return newFormData;
                    });
                    setDoctorDetails({
                      name: "",
                      type: "",
                      specialization: "",
                      experience: "",
                    });
                  }}
                >
                  Add
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDoctorDetails({
                      name: "",
                      type: "",
                      specialization: "",
                      experience: "",
                    });
                  }}
                >
                  Clear
                </Button>
              </Grid>
            </Grid>
          </Grid>
          {/* Contact person name and phone number */}
          <Grid item xs={12}>
            <Grid container columnSpacing={1}>
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight={600}>
                  Contact Person Information
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  id="standard-basic"
                  label="Name"
                  value={formData.contactPersonName}
                  onChange={(e) => {
                    setFormData((pre) => {
                      return {
                        ...pre,
                        contactPersonName: e.target.value,
                      };
                    });
                  }}
                  variant="standard"
                  sx={{ width: "100%" }}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  id="standard-basic"
                  label="Phone"
                  value={formData.contactPersonPhone}
                  onChange={(e) => {
                    if (e.target?.value?.length <= 10) {
                      setFormData((pre) => {
                        return {
                          ...pre,
                          contactPersonPhone: e.target.value,
                        };
                      });
                    }
                  }}
                  variant="standard"
                  type="number"
                  sx={{ width: "100%" }}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={6}>
            <Stack spacing={2}>
              {formData?.doctors &&
                formData.doctors?.map((doctor, index) => {
                  return (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box display="flex" alignItems="center">
                        <MedicalServicesIcon />
                        <Box sx={{ display: "block", mx: 1 }}>
                          <Typography variant="h6">{doctor.name}</Typography>

                          <Typography fontSize={9}>
                            {doctor.specialization}
                            {`(${doctor.experience})`}
                          </Typography>
                        </Box>
                      </Box>
                      <Box>
                        <IconButton>
                          <DeleteIcon
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormData((pre) => {
                                const doctor = pre?.doctors || [];
                                doctor.splice(index, 1);
                                return {
                                  ...pre,
                                  doctors: doctor,
                                };
                              });
                            }}
                          />
                        </IconButton>
                      </Box>
                    </Box>
                  );
                })}
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" fontWeight={600}>
              Basic Facilities:
            </Typography>
            <FormGroup>
              {facilities.map((facility) => (
                <FormControlLabel
                  key={facility}
                  control={
                    <Checkbox
                      checked={formData.basic_facilities?.includes(facility)}
                      onChange={handleChange}
                      name="basic_facilities"
                      value={facility}
                    />
                  }
                  label={facility}
                />
              ))}
            </FormGroup>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" fontWeight={600}>
              Advance Facilities:
            </Typography>
            <FormGroup>
              {advanceFacilities.map((facility) => (
                <FormControlLabel
                  key={facility}
                  control={
                    <Checkbox
                      checked={formData.advance_facilities.includes(facility)}
                      onChange={handleChange}
                      name="advance_facilities"
                      value={facility}
                    />
                  }
                  label={facility}
                />
              ))}
            </FormGroup>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" fontWeight={600}>
              Timings:
            </Typography>
            <FormGroup>
              {timings.map((day) => (
                <FormControlLabel
                  key={day}
                  control={
                    <Checkbox
                      checked={formData.timings.includes(day)}
                      onChange={handleChange}
                      name="timings"
                      value={day}
                    />
                  }
                  label={day}
                />
              ))}
            </FormGroup>
          </Grid>

          <Grid item>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={["MobileTimePicker"]}>
                <MobileTimePicker
                  variant="standard"
                  label="StartTime"
                  openTo="hours"
                  {...(formData?.start_time && {
                    defaultValue: dayjs(
                      convertTimeWithCurrentDate(
                        formData?.start_time
                      ).toISOString()
                    ),
                  })}
                  {...(formData?.start_time && {
                    value: dayjs(
                      convertTimeWithCurrentDate(
                        formData?.start_time
                      )?.toISOString()
                    ),
                  })}
                  onChange={(e) => {
                    setFormData((prev) => {
                      return {
                        ...prev,
                        start_time: e.format("HH:mm"),
                      };
                    });
                  }}
                />
              </DemoContainer>
            </LocalizationProvider>
          </Grid>

          <Grid item>
            {/* <TextField
              label="Close Time"
              name="close_time"
              type="time"
              value={formData.close_time}
              onChange={handleChange}
              fullWidth
              margin="normal"
              variant="standard"
              InputLabelProps={{ shrink: true }}
            /> */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer
                components={["DateTimePicker", "MobileTimePicker"]}
              >
                <MobileTimePicker
                  label="Close Time"
                  openTo="hours"
                  variant="standard"
                  {...(formData?.close_time && {
                    defaultValue: dayjs(
                      convertTimeWithCurrentDate(
                        formData?.close_time
                      ).toISOString()
                    ),
                  })}
                  {...(formData?.close_time && {
                    value: dayjs(
                      convertTimeWithCurrentDate(
                        formData?.close_time
                      )?.toISOString()
                    ),
                  })}
                  onChange={(e) => {
                    setFormData((prev) => {
                      return {
                        ...prev,
                        close_time: e.format("HH:mm"),
                      };
                    });
                  }}
                />
              </DemoContainer>
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              fullWidth
              margin="normal"
              variant="standard"
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Pincode"
              name="pincode"
              type="number"
              value={formData.pincode}
              onChange={handleChange}
              fullWidth
              margin="normal"
              variant="standard"
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              fullWidth
              margin="normal"
              variant="standard"
            />
          </Grid>

          {/* State */}
          {Boolean(stateOptions) && (
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel id="state-label">State</InputLabel>
                <Select
                  labelId="state-label"
                  id="state-select"
                  defaultValue={formData.state}
                  value={formData.state}
                  name="state"
                  // label="State"
                  variant="standard"
                >
                  {stateOptions.map((data, index) => {
                    return (
                      <MenuItem
                        value={data.name}
                        key={data._id + index}
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log(e.target.value);
                          e.preventDefault();
                          getAddressData({
                            type: "district",
                            params: { stateId: data._id },
                          });
                          setFormData((pre) => {
                            return {
                              ...pre,
                              state: data.name,
                            };
                          });
                        }}
                      >
                        {data.name}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
          )}
          {/* district */}

          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel id="District-label">District</InputLabel>
              <Select
                labelId="District-label"
                id="District-select"
                defaultValue={formData.district}
                value={formData.district}
                label="district"
                variant="standard"
                disabled={!Boolean(districtOption.length)}
              >
                {districtOption.map((data, index) => {
                  return (
                    <MenuItem
                      value={data.name}
                      key={data.name + index}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setFormData((pre) => {
                          return {
                            ...pre,
                            district: data.name,
                          };
                        });
                      }}
                    >
                      {data.name}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Telephone Number"
              name="tel_no"
              value={formData.tel_no}
              onChange={handleChange}
              fullWidth
              margin="normal"
              variant="standard"
              type="number"
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Mobile Number"
              name="mobile_no"
              value={formData.mobile_no}
              onChange={handleChange}
              fullWidth
              margin="normal"
              variant="standard"
              type="number"
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              margin="normal"
              variant="standard"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Map Link"
              name="map_link"
              value={formData.map_link}
              onChange={handleChange}
              fullWidth
              margin="normal"
              variant="standard"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              fullWidth
              margin="normal"
              variant="standard"
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Discount IPD (%)"
              name="discount_ipd"
              type="number"
              value={formData.discount_ipd}
              onChange={handleChange}
              fullWidth
              margin="normal"
              variant="standard"
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Discount OPD (%)"
              name="discount_opd"
              type="number"
              value={formData.discount_opd}
              onChange={handleChange}
              fullWidth
              margin="normal"
              variant="standard"
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Discount Medicine (%)"
              name="discount_medicine"
              type="number"
              value={formData.discount_medicine}
              onChange={handleChange}
              fullWidth
              margin="normal"
              variant="standard"
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Discount Diagnostic (%)"
              name="discount_diagnostic"
              type="number"
              value={formData.discount_diagnostic}
              onChange={handleChange}
              fullWidth
              margin="normal"
              variant="standard"
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Acknowledge"
              name="acknowledge"
              value={formData.acknowledge}
              onChange={handleChange}
              fullWidth
              margin="normal"
              variant="standard"
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Images URL"
              name="images"
              value={formData.images}
              onChange={handleChange}
              fullWidth
              margin="normal"
              variant="standard"
            />
          </Grid>

          <Grid item>
            {/* <TextField
              label="Date of Agreement"
              name="date_of_agreement"
              type="date"
              value={formData.date_of_agreement}
              onChange={handleChange}
              fullWidth
              margin="normal"
              variant="standard"
              InputLabelProps={{ shrink: true }}
            /> */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={["MobileDateTimePicker"]}>
                <DemoItem label="Date of agreement">
                  <MobileDatePicker
                    {...(formData?.date_of_agreement && {
                      defaultValue: dayjs(
                        formData.date_of_agreement,
                        "dd-mm-yyyy"
                      ),
                    })}
                    {...(formData?.date_of_agreement && {
                      value: dayjs(formData.date_of_agreement, "dd-mm-yyyy"),
                    })}
                    onChange={(e) => {
                      setFormData((prev) => {
                        return {
                          ...prev,
                          date_of_agreement: dayjs(e),
                        };
                      });
                    }}
                  />
                </DemoItem>
              </DemoContainer>
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12}>
            <ImageListCard
              initialImages={formData?.images || []}
              onImagesChange={handleImagesChange}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            if (mode !== "Edit") {
              storageUtil.setStorageData(formData, "hospital-draft-data");
            }
            onClose();
          }}
          color="primary"
        >
          Cancel
        </Button>
        <Button
          disabled={isImageLoadingInFormData}
          onClick={(e) => {
            e.stopPropagation();
            handleFormSubmit();
          }}
          color="primary"
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditCardDialog;
