import tokenUtil from "../utils/token.util";
import axiosUtil from "../utils/api.util";
import { isEmpty } from "lodash";
import cookiesUtil from "../utils/cookies.util";

async function getDashboardData(payload) {
  const _payload = {
    token: tokenUtil.getAuthToken(),
    type: "ADMIN",
    ...(payload?.duration && { duration: payload.duration }),
    ...(payload?.till_duration && { till_duration: payload.till_duration }),
  };
  const {
    status,
    data,
    message,
    error = "",
  } = await axiosUtil.get({
    path: "dashboard",
    params: _payload,
  });
  if (status === "failed") {
    return { status, error: error || message };
  } else if (!isEmpty(data)) {
    return data;
  }
}

async function getTreeChartData({ type = "district", payload } = {}) {
  const _payload = {
    token: tokenUtil.getAuthToken(),
    ...(payload?.duration && { duration: payload.duration }),
    ...(payload?.till_duration && { till_duration: payload.till_duration }),
  };
  const {
    status,
    data,
    message,
    error = "",
  } = await axiosUtil.get({
    path: `dashboard/${type}`,
    params: _payload,
  });
  if (status === "failed") {
    return { status, error: error || message };
  } else if (!isEmpty(data)) {
    return data;
  }
}

export default {
  getDashboardData,
  getTreeChartData,
};
