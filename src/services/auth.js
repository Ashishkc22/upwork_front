import { isEmpty } from "lodash";
import axiosUtil from "../utils/api.util";
import cookiesUtil from "../utils/cookies.util";
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
    return { message, status, error: error || message };
  } else if (!isEmpty(data)) {
    return data;
  }
}

export default {
  login,
  passwordReset,
};
