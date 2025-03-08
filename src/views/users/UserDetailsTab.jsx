import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  Button,
  Stack,
  Divider
} from "@mui/material";
import { getUserById } from "../../services/users";

const UserDetailsTab = React.forwardRef((props,ref) => {
  const [userData, setUserData] = useState({});
  const { id } = useParams();
  const fetchUserData = async () => {
    const response = await getUserById({ id });
    setUserData(response.data);
  };
  useEffect(() => {
    fetchUserData();
  }, [id]);

  React.useImperativeHandle(ref, () => ({
    triggerChildFunction: fetchUserData,
  }));

  return (
    <Card sx={{ m: 2, p: 2 }}>
      <CardContent>
        <Grid container spacing={2} sx={{ p: 2 }}>
          <Grid item xs={12} sm={6} sx={{ display: "flex", justifyContent: "center", alignItems: "top" }}>
            <Avatar
              src={userData?.image}
              alt={userData?.name}
              sx={{
                width: "400px",
                height: "400px",
                borderRadius: "10px",
                margin: "auto"
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Stack spacing={2} sx={{ p: 2 }}>
              <Typography variant="h4" component="div" sx={{ fontSize: "2rem" }}>
                {userData?.name}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  margin: "10px 0",
                }}
              >
                <Chip
                  label={userData?.status}
                  color={userData?.status === "Incomplete" ? "error" : "success"}
                  sx={{ fontSize: "1.5rem" }}
                />
              </Box>
              <Divider />
              <Stack direction="column" spacing={1} sx={{ p: 2 }}>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.5rem" }}>
                  <strong>Phone:</strong> {userData?.phone}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.5rem" }}>
                  <strong>Email:</strong> {userData?.email}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.5rem" }}>
                  <strong>UID:</strong> {userData?.uid}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.5rem" }}>
                  <strong>Role:</strong> {userData?.role}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.5rem" }}>
                  <strong>Current City:</strong> {userData?.current_city}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.5rem" }}>
                  <strong>Current District:</strong> {userData?.current_district}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.5rem" }}>
                  <strong>Current Pincode:</strong> {userData?.current_pincode}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.5rem" }}>
                  <strong>DOB:</strong> {userData?.dob}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.5rem" }}>
                  <strong>Gender:</strong> {userData?.gender}
                </Typography>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
});

export default UserDetailsTab;
