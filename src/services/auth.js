import { isEmpty } from "lodash";
import axiosUtil from "../utils/api.util";
import cookiesUtil from "../utils/cookies.util";
import storageUtil from "../utils/storage.util";
import { enqueueSnackbar } from "notistack";

async function login(payload) {
  const _payload = {
    email: payload.email,
    password: payload.password,
    role: "ADMIN",
  };
  const {
    status,
    data,
    message,
    error = "",
  } = await axiosUtil.post({
    path: "auth/login",
    body: _payload,
  });
  if (status === "failed") {
    enqueueSnackbar("Login failed", {
      variant: "error",
      autoHideDuration: 2000,
    });
    return { message, status, error: error || message };
  } else if (!isEmpty(data)) {
    cookiesUtil.setCookie({ value: { token: data.user_token }, days: 1 });
    storageUtil.setStorageData(data.role, "userRole");
    enqueueSnackbar("Login successful.", {
      variant: "success",
      autoHideDuration: 2000,
    });
    return data;
  }
}

async function passwordReset(payload) {
  const {
    status,
    data,
    message,
    error = "",
  } = await axiosUtil.post({
    path: "auth/sendCode",
    body: payload,
  });
  if (status === "failed") {
    enqueueSnackbar("Send OTP failed", {
      variant: "error",
      autoHideDuration: 2000,
    });
    return { message, status, error: error || message };
  } else if (!isEmpty(data)) {
    return data;
  }
}

async function verifyOTP(payload) {
  const {
    status,
    data,
    message,
    error = "",
  } = await axiosUtil.post({
    path: "auth/verifyCode",
    body: payload,
  });
  console.log("data", data);

  if (status === "failed") {
    enqueueSnackbar("Send OTP failed", {
      variant: "error",
      autoHideDuration: 2000,
    });
    return { message, status, error: error || message };
  } else if (data) {
    return data;
  }
}

async function resetPassword(payload) {
  const resp = await axiosUtil.post({
    path: "auth/submitPassword",
    body: payload,
  });
  console.log("data", resp);

  if (resp.status === "failed") {
    enqueueSnackbar("failed to reset password", {
      variant: "error",
      autoHideDuration: 2000,
    });
    return {
      message: resp.message,
      status: resp.status,
      error: resp.message,
    };
  } else if (resp) {
    enqueueSnackbar("Password changed successfully.", {
      variant: "success",
      autoHideDuration: 2000,
    });
    return resp;
  }
}

export default {
  login,
  passwordReset,
  verifyOTP,
  resetPassword,
};
