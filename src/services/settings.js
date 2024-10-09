import axiosUtil from "../utils/api.util";
import tokenUtil from "../utils/token.util";
import { enqueueSnackbar } from "notistack";

import { isEmpty } from "lodash";

async function varifyGramPanchayat(body) {
  try {
    const {
      status,
      data,
      message,
      error = "",
      total,
      total_results,
    } = await axiosUtil.patch({
      path: `address/gramPanchayat`,
      body,
    });
  } catch (error) {}
}

async function addAddressType({ type, body }) {
  try {
    const {
      status,
      data,
      message,
      error = "",
      total,
      total_results,
    } = await axiosUtil.post({
      path: `address/${type}`,
      body,
    });
  } catch (error) {}
}

async function updateLocation({ type, body }) {
  try {
    const {
      status,
      data,
      message,
      error = "",
      total,
      total_results,
    } = await axiosUtil.patch({
      path: `address/${type}`,
      body,
    });
  } catch (error) {}
}

async function getHospitalAndContactSettings({ params } = {}) {
  const {
    status,
    data,
    message,
    error = "",
    total,
    total_results,
  } = await axiosUtil.get({
    path: `settings`,
    params: {
      responseType: "ADMIN",
    },
  });
  if (status === "failed") {
    return { message, status, error: error || message };
  } else if (!isEmpty(data)) {
    return data;
  }
}

async function saveHospitalAndContactSettings({ body } = {}) {
  const {
    status,
    data,
    message,
    error = "",
  } = await axiosUtil.post({
    path: `settings`,
    params: {
      token: tokenUtil.getAuthToken(),
    },
    body,
  });
  if (status === "failed") {
    return { message, status, error: error || message };
  } else if (!isEmpty(data)) {
    enqueueSnackbar("Saved.", {
      variant: "success",
      autoHideDuration: 2000,
    });
    return data;
  }
}

async function activeAndDeactivateAddress({ type, body } = {}) {
  const {
    status,
    data,
    message,
    error = "",
  } = await axiosUtil.patch({
    path: `address/${type}`,
    // params: {
    //   token: tokenUtil.getAuthToken(),
    // },
    body,
  });
  if (status === "failed") {
    return { message, status, error: error || message };
  } else if (!isEmpty(data)) {
    return data;
  }
}

export default {
  varifyGramPanchayat,
  addAddressType,
  getHospitalAndContactSettings,
  saveHospitalAndContactSettings,
  activeAndDeactivateAddress,
  updateLocation,
};
