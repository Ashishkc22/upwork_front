import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  Link,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import authServices from "../../services/auth";
import { useNavigate } from "react-router-dom";

const PasswordReset = ({ handleClose, handleSendOtp, open }) => {
  const [email, setEmail] = useState("");

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Enter Your Email</DialogTitle>
      <DialogContent>
        {/* Email Input Field */}
        <TextField
          sx={{ width: "500px", minWidth: "300px" }}
          autoFocus
          margin="dense"
          id="email"
          label="Email Address"
          type="email"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        {/* Cancel Button */}
        <Button onClick={handleClose} color="secondary">
          Cancel
        </Button>
        {/* Send OTP Button */}
        <Button
          onClick={() => handleSendOtp(email)}
          color="primary"
          variant="contained"
        >
          Send OTP
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const LoginPage = () => {
  const nav = useNavigate();
  const [email, setEmail] = useState("7rogyam@gmail.com");
  const [password, setPassword] = useState("123123@7489");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [open, setOpen] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Reset errors
    setErrors({ email: "", password: "" });

    // Simple validation
    let hasErrors = false;
    const newErrors = { email: "", password: "" };

    // Email validation
    if (!email) {
      newErrors.email = "Email is required";
      hasErrors = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email address";
      hasErrors = true;
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
      hasErrors = true;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
    } else {
      // Handle login logic here
      await authServices.login({ email, password });
      nav("/dashboard");
    }
  };

  const handlePasswordReset = async (_email) => {
    await authServices.passwordReset({ email: _email });
  };

  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{
        mt: { xs: 1, sm: 1 },
        mb: 4,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "90vh",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: { xs: 2, sm: 3 },
          borderRadius: 2,
          boxShadow: { xs: "none", sm: "0 8px 16px rgba(0,0,0,0.1)" },
          borderRadius: "20px",
          width: { xs: "100%", sm: "auto" },
        }}
      >
        <PasswordReset
          open={open}
          handleClose={() => {
            setOpen(false);
          }}
          handleSendOtp={handlePasswordReset}
        />
        <Typography component="h1" variant="h5">
          Login to Panel
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="userName"
            label="Username"
            name="Username"
            autoComplete="Username"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
            error={Boolean(errors.email)}
            helperText={errors.email}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 3 }}
            error={Boolean(errors.password)}
            helperText={errors.password}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="secondary"
            sx={{ mb: 2, py: 1.5, borderRadius: "20px" }}
          >
            Sign In
          </Button>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
              <Link
                href="#"
                variant="body2"
                sx={{ display: "block", textAlign: "center" }}
                onClick={() => setOpen(true)}
              >
                Forgot password?
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
