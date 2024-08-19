import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  IconButton,
  Link,
  Grid,
  Typography,
  Switch,
  CardMedia,
  Button,
  Input,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import moment from "moment";
import { useNavigate, useParams } from "react-router-dom";
import { isEmpty } from "lodash";
import hospitals from "../../services/hospitals";
import CroppingDialog from "./ImageCropDialog"; // Adjust path as necessary
import EditCardDialog from "./EditCardDialog";

const HospitalInfoCard = () => {
  const navigate = useNavigate();
  let { id } = useParams();
  const [hospitalData, setHospitalData] = useState({
    // Initial state as before
  });
  const [status, setStatus] = useState(hospitalData.status === "ENABLE");
  const [isCroppingDialogOpen, setIsCroppingDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageList, setImageList] = useState(hospitalData.images);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchCardData = () => {
    hospitals.getHospitalById({ id }).then((data) => {
      setHospitalData(data);
      setImageList(data.images);
    });
  };

  useEffect(() => {
    // Fetch the data from the API
    fetchCardData();
  }, [id]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setIsCroppingDialogOpen(true);
    }
  };

  const handleCropComplete = ({ croppedImage, selectedImageIndex }) => {
    let _imageList = [...imageList];
    _imageList.splice(selectedImageIndex, 1);
    _imageList.push(croppedImage);
    setImageList(_imageList);
    setIsCroppingDialogOpen(false);
  };

  const TextGroup = ({ title, value }) => (
    <Box mb={1}>
      <Typography fontSize="10px" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h6" fontSize="12px" fontWeight={600} gutterBottom>
        {value}
      </Typography>
    </Box>
  );

  const ImageList = ({ images, handleImageClick }) => (
    <Box sx={{ width: "100%", p: 2, overflow: "scroll" }}>
      <Typography variant="h6" gutterBottom>
        Image Gallery
      </Typography>
      <Grid container spacing={2}>
        {images?.length > 0 ? (
          images?.map((image, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ maxWidth: "100%" }}>
                <CardMedia
                  component="img"
                  width="200"
                  image={image}
                  alt={`Image ${index + 1}`}
                  onClick={() => handleImageClick({ url: image, index })}
                />
              </Card>
            </Grid>
          ))
        ) : (
          <Typography>No images available.</Typography>
        )}
      </Grid>
    </Box>
  );

  const handleImageClick = ({ url, index }) => {
    setSelectedImage(url);
    setIsCroppingDialogOpen(true);
    setSelectedImageIndex(index);
  };

  if (!hospitalData) return <Typography>Loading...</Typography>;

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{ width: "100%", p: 2 }}
    >
      <EditCardDialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        data={hospitalData}
      />
      <Card sx={{ maxWidth: 1000, width: "100%" }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between">
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <IconButton
                onClick={() => navigate(-1)}
                aria-label="back"
                sx={{ mr: 2 }}
              >
                <ArrowBackIcon sx={{ fontSize: 30 }} />
              </IconButton>
              <TextGroup title="UID:" value={hospitalData.uid} />
            </Box>
            <Box>
              <Button
                sx={{
                  display: "inline-flex",
                  color: "#ff5722",
                  p: 1,
                  m: 0,
                  mr: 3,
                }}
                variant="standard"
                startIcon={<EditIcon />}
                onClick={() => {
                  setIsEditDialogOpen(true);
                }}
              >
                Edit
              </Button>
            </Box>
          </Box>

          <Grid container spacing={1}>
            <Grid item lg={4} md={4} sm={5}>
              <TextGroup title="ID:" value={hospitalData._id} />
              <TextGroup
                title="Entity name:"
                value={hospitalData.entity_name}
              />
              <TextGroup
                title="Establishment Year:"
                value={hospitalData.established_in}
              />
              <TextGroup title="Reg No.:" value={hospitalData.reg_no} />
              <TextGroup title="Category:" value={hospitalData.category} />
              <TextGroup
                title="Basic Facilities:"
                value={hospitalData.basic_facilities?.join(", ")}
              />
              <TextGroup
                title="Timings:"
                value={hospitalData.timings?.join(", ")}
              />
              <Grid container>
                <Grid item xs={6}>
                  <TextGroup title="Tel No.:" value={hospitalData.tel_no} />
                </Grid>
                <Grid item>
                  <TextGroup
                    title="Mobile No.:"
                    value={hospitalData.mobile_no}
                  />
                </Grid>
              </Grid>

              <TextGroup title="Address:" value={hospitalData.address} />
              <Grid container>
                <Grid item xs={6}>
                  <TextGroup title="City:" value={hospitalData.city} />
                  <TextGroup title="District:" value={hospitalData.district} />
                </Grid>
                <Grid item>
                  <TextGroup title="State:" value={hospitalData.state} />
                  <TextGroup title="Pincode:" value={hospitalData.pincode} />
                </Grid>
              </Grid>
            </Grid>
            <Grid
              item
              container
              lg={8}
              md={8}
              sm={7}
              sx={{ maxWidth: 1000, width: "100%" }}
            >
              <Grid item xs={6} sm={6}>
                <Grid container>
                  <Grid item xs={5}>
                    <TextGroup title="Status:" value={hospitalData.status} />
                  </Grid>
                  <Grid item>
                    <Switch
                      checked={hospitalData.status === "ENABLE"}
                      disabled
                      inputProps={{ "aria-label": "status toggle" }}
                    />
                  </Grid>
                </Grid>
                <TextGroup
                  title="Website:"
                  value={
                    hospitalData.website ? (
                      <Link
                        href={hospitalData.website}
                        target="_blank"
                        rel="noopener"
                      >
                        {hospitalData.website}
                      </Link>
                    ) : (
                      "N/A"
                    )
                  }
                />
                <TextGroup title="Hospital Rates:" />
                {hospitalData.hospital_rates?.map((rate, index) => (
                  <div key={index}>
                    {Object.entries(rate).map(([key, value]) => (
                      <Grid
                        container
                        columnSpacing={1}
                        alignItems="center"
                        sx={{ p: 0, m: 0 }}
                      >
                        <Grid item sx={{ p: 0, m: 0 }}>
                          <Typography
                            fontSize="10px"
                            fontWeight={600}
                            color="text.secondary"
                          >
                            {key + ":"}
                          </Typography>
                        </Grid>
                        <Grid item sx={{ p: 0, m: 0 }}>
                          <Typography
                            variant="h6"
                            fontSize="12px"
                            fontWeight={600}
                            gutterBottom
                          >
                            {value}
                          </Typography>
                        </Grid>
                      </Grid>
                    ))}
                  </div>
                ))}
                <TextGroup
                  title="Date of Agreement:"
                  value={hospitalData.date_of_agreement}
                />
                <TextGroup
                  title="Created At:"
                  value={moment(hospitalData.created_at).format(
                    "DD-MM-YYYY HH:mm:ss"
                  )}
                />
                <TextGroup
                  title="Created By:"
                  value={hospitalData.created_by}
                />
                <TextGroup
                  title="Map Link:"
                  value={
                    <Link
                      href={hospitalData.map_link}
                      target="_blank"
                      rel="noopener"
                    >
                      View on Map
                    </Link>
                  }
                />
              </Grid>
              <Grid item xs={6} sm={6}>
                <TextGroup
                  title="Discount IPD:"
                  value={`${hospitalData.discount_ipd}%`}
                />
                <TextGroup
                  title="Discount OPD:"
                  value={`${hospitalData.discount_opd}%`}
                />
                <TextGroup
                  title="Discount Medicine:"
                  value={`${hospitalData.discount_medicine}%`}
                />
                <TextGroup
                  title="Discount Diagnostic:"
                  value={`${hospitalData.discount_diagnostic}%`}
                />{" "}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                ></Box>
                <TextGroup
                  title="Doctors:"
                  value={
                    hospitalData?.doctors?.length
                      ? hospitalData?.doctors?.map((DocDetails) => {
                          return (
                            <Box display="flex" alignItems="center">
                              <MedicalServicesIcon />
                              <Box sx={{ display: "block", mx: 1 }}>
                                <Typography variant="h6">
                                  {DocDetails.name}
                                </Typography>

                                <Typography fontSize={9}>
                                  {DocDetails.specialization}
                                  {` (${DocDetails.experience})`}
                                </Typography>
                              </Box>
                            </Box>
                          );
                        })
                      : "No Data"
                  }
                />
                <TextGroup title="Auth Signature:" />
                {hospitalData.auth_sign ? (
                  <img src="hospitalData.auth_sign" alt="sign" />
                ) : (
                  "N/A"
                )}
              </Grid>
              {!isEmpty(imageList) && (
                <Grid item xs={12}>
                  <ImageList
                    images={imageList}
                    handleImageClick={handleImageClick}
                  />
                </Grid>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <CroppingDialog
        open={isCroppingDialogOpen}
        onClose={(isSuccessfull) => {
          if (isSuccessfull) {
            setTimeout(() => {
              fetchCardData();
            }, 1000);
          }
          setIsCroppingDialogOpen(false);
        }}
        image={selectedImage}
        onCropComplete={handleCropComplete}
        selectedImageIndex={selectedImageIndex}
        mode="View"
      />
    </Box>
  );
};

export default HospitalInfoCard;
