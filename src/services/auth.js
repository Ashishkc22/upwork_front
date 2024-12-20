import { isEmpty } from "lodash";
import axiosUtil from "../utils/api.util";
import cookiesUtil from "../utils/cookies.util";
import storageUtil from "../utils/storage.util";
import { enqueueSnackbar } from "notistack";
function decodeJWT(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
      .join("")
  );
  return JSON.parse(jsonPayload);
}

async function login(payload) {
  const _payload = {
    email: payload.email,
    password: payload.password,
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
    cookiesUtil.setCookie({ value: { token: data.token }, days: 1 });
    const payload = decodeJWT(data.token);
    console.log("payload", payload);

    storageUtil.setStorageData(payload.role, "userRole");
    enqueueSnackbar("Login successful.", {
      variant: "success",
      autoHideDuration: 2000,
    });
    return payload;
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

  if (error?.status === "failed" || status === "failed") {
    return {
      message: message || error?.message,
      status,
      error: error || message,
    };
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
  if (status === "failed" && error) {
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
  try {
    const resp = await axiosUtil.post({
      path: "auth/submitPassword",
      body: payload,
    });

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
  } catch (error) {
    throw error;
  }
}

export default {
  login,
  passwordReset,
  verifyOTP,
  resetPassword,
};
