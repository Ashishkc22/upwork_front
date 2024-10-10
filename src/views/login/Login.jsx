import React, { useEffect, useState } from "react";
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
  IconButton,
} from "@mui/material";
import authServices from "../../services/auth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import LoadingButton from "@mui/lab/LoadingButton";
import { isEmpty } from "lodash";

const SendOtp = ({
  handleClose,
  handleSendOtp,
  _email,
  open,
  showOTPText = false,
  isOtpButtonLoading,
}) => {
  const [email, setEmail] = useState(null);
  const [otp, setOtp] = useState("");

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Enter Your Email</DialogTitle>
      <DialogContent>
        {/* Email Input Field */}
        <TextField
          sx={{ width: "500px", minWidth: "300px" }}
          autoFocus
          margin="dense"
          disabled={showOTPText}
          id="email"
          label="Email Address"
          type="email"
          variant="outlined"
          value={email}
          defaultValue={_email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {showOTPText && (
          <TextField
            sx={{ width: "500px", minWidth: "300px" }}
            autoFocus
            margin="dense"
            id="opt"
            label="Enter OTP"
            variant="outlined"
            type="number"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
        )}
      </DialogContent>
      <DialogActions>
        {/* Cancel Button */}
        <Button onClick={handleClose} color="secondary">
          Cancel
        </Button>
        {/* Send OTP Button */}
        <LoadingButton
          loading={isOtpButtonLoading}
          onClick={() => handleSendOtp(email || _email, otp)}
          color="primary"
          variant="contained"
        >
          {showOTPText ? "Verify OTP" : "Send OTP"}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

const PasswordReset = ({
  open,
  handleClose,
  handlePasswordReset,
  isPasswordResetButtonLoading,
}) => {
  const [password, setPassword] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Enter New Password</DialogTitle>
      <DialogContent>
        <FormControl sx={{ m: 1, width: "50ch" }} variant="outlined">
          <InputLabel htmlFor="outlined-adornment-password">
            Password
          </InputLabel>
          <OutlinedInput
            id="outlined-adornment-password"
            type={showPassword ? "text" : "password"}
            onChange={(e) => setPassword(e.target.value)}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {!showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            label="Password"
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Cancel
        </Button>
        <LoadingButton
          loading={isPasswordResetButtonLoading}
          onClick={() => handlePasswordReset(null, null, password)}
          color="primary"
          variant="contained"
        >
          Reset
        </LoadingButton>
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
  const [passwordDialogOpened, setPasswordDialogOpened] = useState(false);
  const [showOTPText, setShowOTPText] = useState(false);
  const [token, setToken] = useState("");
  const [otpToken, setOtpToken] = useState("");
  let [urlDateType, setUrlDateType] = useSearchParams();

  const [isLoginButtonLoading, setIsLoginButtonLoading] = useState(false);
  const [isOtpButtonLoading, setIsOtpButtonLoading] = useState(false);
  const [isPasswordResetButtonLoading, setIsPasswordResetButtonLoading] =
    useState(false);

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
      setIsLoginButtonLoading(true);
      // Handle login logic here
      const data = await authServices.login({ email, password });
      console.log("data", data);
      if (!isEmpty(data)) {
        if (data?.role === "ADMIN") {
          setIsLoginButtonLoading(false);
          nav("/dashboard");
        } else {
          nav("/hospitals?status=ENABLE");
        }
      } else {
        setIsLoginButtonLoading(false);
      }
    }
  };

  function addDataToURL(data) {
    const searchParams = new URLSearchParams(window.location.search);
    // Iterate over the data object and append each key-value pair to the URL
    Object.keys(data).forEach((key) => {
      if (!data[key]) {
        searchParams.delete(key);
      } else {
        searchParams.set(key, data[key]);
      }
    });
    // Update the URL with the new query string
    nav(`?${searchParams.toString()}`, { replace: true });
  }

  const handlePasswordReset = async (_email, otp, password) => {
    // Email validation
    console.log("password", password);
    console.log("_email", _email);
    console.log("otp", otp);
    if (password) {
      setIsPasswordResetButtonLoading(true);
      let body = {
        password: password,
        token: otpToken,
      };
      const data = await authServices.resetPassword(body);
      console.log("reset responce", data);

      if (data?.message === "Password changed successful!") {
        addDataToURL({ token: "" });
        addDataToURL({ otpToken: "" });
        addDataToURL({ email: "" });
        setPasswordDialogOpened(false);
      }
      setIsPasswordResetButtonLoading(false);
    } else if (otp) {
      setIsOtpButtonLoading(true);
      const resp = await authServices.verifyOTP({
        code: otp,
        verificationId: token,
      });
      if (resp) {
        addDataToURL({ otpToken: resp });
        setOtpToken(resp);
        setOpen(false);
        setPasswordDialogOpened(true);
      }
      setIsOtpButtonLoading(false);
      console.log("resp", resp);
    } else if (_email) {
      if (!_email || !/\S+@\S+\.\S+/.test(_email)) {
        enqueueSnackbar("Invalid Email", {
          variant: "error",
          autoHideDuration: 2000,
        });
        return;
      }
      addDataToURL({ email: _email });
      const data = await authServices.passwordReset({ email: _email });
      if (!data.message) {
        console.log("data", data);
        addDataToURL({ token: data });
        setToken(data);
        setShowOTPText(true);
      }
    }
  };

  useEffect(() => {
    const email = urlDateType.get("email");
    const token = urlDateType.get("token");
    const _otpToken = urlDateType.get("otpToken");
    if (email && token && !_otpToken) {
      setEmail(email);
      setToken(token);
      setOpen(true);
      setShowOTPText(true);
    }
    if (_otpToken) {
      setOtpToken(_otpToken);
      setPasswordDialogOpened(true);
    }
  }, []);

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
        <SendOtp
          open={open}
          handleClose={() => {
            setOpen(false);
          }}
          handleSendOtp={handlePasswordReset}
          showOTPText={showOTPText}
          _email={email}
          isOtpButtonLoading={isOtpButtonLoading}
        />
        <PasswordReset
          open={passwordDialogOpened}
          handleClose={() => {
            setPasswordDialogOpened(false);
          }}
          handlePasswordReset={handlePasswordReset}
          isPasswordResetButtonLoading={isPasswordResetButtonLoading}
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
          <LoadingButton
            loading={isLoginButtonLoading}
            type="submit"
            fullWidth
            variant="contained"
            color="secondary"
            sx={{ mb: 2, py: 1.5, borderRadius: "20px" }}
          >
            Sign In
          </LoadingButton>
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
