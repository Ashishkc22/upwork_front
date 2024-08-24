import { isEmpty } from "lodash";
import axiosUtil from "../utils/api.util";
import cookiesUtil from "../utils/cookies.util";

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
    return { message, status, error: error || message };
  } else if (!isEmpty(data)) {
    cookiesUtil.setCookie({ value: { token: data.user_token }, days: 1 });
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
