import axiosUtil from "../utils/api.util";
import { isEmpty } from "lodash";

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
export default {
  getAddressData,
  fileUpload,
};
