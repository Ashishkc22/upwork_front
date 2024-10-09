import axiosUtil from "../utils/api.util";
import { isEmpty } from "lodash";
import tokenUtil from "../utils/token.util";
import { enqueueSnackbar } from "notistack";

async function getAddressData({ type = "state", params = {} } = {}) {
  const {
    status,
    data,
    message,
    error = "",
  } = await axiosUtil.get({
    path: `address/${type}`,
    params: {
      type: "ADMIN",
      ...params,
    },
  });
  if (status === "failed") {
    return { message, status, error: error || message };
  } else if (!isEmpty(data)) {
    return data;
  } else {
    return [];
  }
}

async function getAddressAllJanpadPanchyat() {
  const {
    status,
    data,
    message,
    error = "",
  } = await axiosUtil.get({
    path: "address/all-get-janpanchyat",
  });
  if (status === "failed") {
    return { message, status, error: error || message };
  } else if (!isEmpty(data)) {
    return data;
  }
}

async function fileUpload(formData) {
  const {
    status,
    path,
    message,
    error = "",
  } = await axiosUtil.upload({
    url: "https://asia-south1-arogyam-super.cloudfunctions.net/files",
    body: formData,
    isFormData: true,
  });
  if (status === "success") {
    return path;
  } else {
    return { error: "Failed to upload.", status: "failed" };
  }
}

async function uploadLocation(data, options = {}) {
  const { status, error } = await axiosUtil.post({
    path: "address/add-location",
    body: { token: tokenUtil.getAuthToken(), data, options },
  });
  if (status === "success") {
    enqueueSnackbar("Data uploaded successfully", {
      variant: "success",
      autoHideDuration: 2000,
    });
    return { status: "success", message: "data uploaded successfully" };
  } else {
    enqueueSnackbar(error?.response?.data?.message || "Failed to upload.", {
      variant: "error",
      autoHideDuration: 2000,
    });
    return { message: error.message || "Failed to upload.", status: "failed" };
  }
}
export default {
  getAddressData,
  fileUpload,
  getAddressAllJanpadPanchyat,
  uploadLocation,
};
