import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getUserCardById } from "../../services/users";
import { useSnackbar } from "notistack";
import { isEmpty } from "lodash";
import {
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Divider,
} from "@mui/material";

const CardDetails = React.forwardRef((props, ref) => {
  const { id } = useParams();
  const [cardDetails, setCardDetails] = useState({});
  const { enqueueSnackbar } = useSnackbar();
  const fetchCardDetails = async () => {
    try {
      if (!id) {
        enqueueSnackbar("Id missing in params", {
          variant: "error",
        });
      } else {
        const response = await getUserCardById({ id });
        setCardDetails(response.data || {});
      }
    } catch (error) {
      enqueueSnackbar("Something went wrong. Please try again.", {
        variant: "error",
      });
      console.error(error);
    }
  };
  useEffect(() => {
    fetchCardDetails();
  }, [id, enqueueSnackbar]);

  React.useImperativeHandle(ref, () => ({
    triggerChildFunction: fetchCardDetails,
  }));

  if (isEmpty(cardDetails)) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Typography variant="h1">No Card found</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={1} p={1}>
      <Grid item xs={12} sm={6}>
        <Card>
          <CardContent>
            <Typography
              variant="h5"
              sx={{
                fontSize: 17,
                fontWeight: "bold",
                marginBottom: 1,
              }}
            >
              Card Details
            </Typography>
            <Divider />
            <Box sx={{ marginTop: 2 }}>
              <Typography sx={{ fontSize: 17 }}>
                Name:
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  {cardDetails.name || "N/A"}
                </Typography>
              </Typography>
              <Typography sx={{ fontSize: 17 }}>
                Gender:
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  {cardDetails.gender || "N/A"}
                </Typography>
              </Typography>
              <Typography sx={{ fontSize: 17 }}>
                ID Proof:
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  {cardDetails.id_proof?.type
                    ? `${cardDetails.id_proof?.type} - ${cardDetails.id_proof?.value}`
                    : "N/A"}
                </Typography>
              </Typography>
              <Typography sx={{ fontSize: 17 }}>
                City:
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  {cardDetails.city || "N/A"}
                </Typography>
              </Typography>
              <Typography sx={{ fontSize: 17 }}>
                District:
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  {cardDetails.district || "N/A"}
                </Typography>
              </Typography>
              <Typography sx={{ fontSize: 17 }}>
                Pincode:
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  {cardDetails.pincode || "N/A"}
                </Typography>
              </Typography>
              <Typography sx={{ fontSize: 17 }}>
                Phone:
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  {cardDetails.phone || "N/A"}
                </Typography>
              </Typography>
              <Typography sx={{ fontSize: 17 }}>
                Father/Husband Name:
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  {cardDetails.father_husband_name || "N/A"}
                </Typography>
              </Typography>
              <Typography sx={{ fontSize: 17 }}>
                Blood Group:
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  {cardDetails.blood_group || "N/A"}
                </Typography>
              </Typography>
              <Typography sx={{ fontSize: 17 }}>
                Emergency Contact:
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  {cardDetails.emergency_contact || "N/A"}
                </Typography>
              </Typography>
              <Typography sx={{ fontSize: 17 }}>
                Status:
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  {cardDetails.status || "N/A"}
                </Typography>
              </Typography>
              <Typography sx={{ fontSize: 17 }}>
                Created By:
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  {cardDetails.created_by_name || "N/A"}
                </Typography>
              </Typography>
              <Typography sx={{ fontSize: 17 }}>
                Created At:
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  {cardDetails.created_at
                    ? new Date(cardDetails.created_at).toLocaleString()
                    : "N/A"}
                </Typography>
              </Typography>
              <Typography sx={{ fontSize: 17 }}>
                Issue Date:
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  {cardDetails.issue_date || "N/A"}
                </Typography>
              </Typography>
              <Typography sx={{ fontSize: 17 }}>
                Expiry Date:
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  {cardDetails.expiry_date
                    ? new Date(cardDetails.expiry_date).toLocaleString()
                    : "N/A"}
                </Typography>
              </Typography>
              <Typography sx={{ fontSize: 17 }}>
                Expiry Years:
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                  {cardDetails.expiry_years || "N/A"}
                </Typography>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Card>
          <CardMedia
            component="img"
            height="300"
            image={cardDetails.image}
            alt="user"
          />
        </Card>
      </Grid>
    </Grid>
  );
});

export default CardDetails;
