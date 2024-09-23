import { isEmpty } from "lodash";
import axiosUtil from "../utils/api.util";
import tokenUtil from "../utils/token.util";
import { enqueueSnackbar } from "notistack";

async function getBinData(payload) {
  const {
    status,
    data,
    docCount,
    message,
    error = "",
  } = await axiosUtil.get({
    path: "bin",
    params: {
      token: tokenUtil.getAuthToken(),
      ...payload?.params,
    },
  });
  if (status === "failed") {
    enqueueSnackbar("Failed get data", {
      variant: "error",
      autoHideDuration: 2000,
    });
    return { message, status, error: error || message };
  } else if (!isEmpty(data)) {
    // enqueueSnackbar("successful.", {
    //     variant: "success",
    //     autoHideDuration: 2000,
    //   });
    return { data, docCount };
  }
}

async function restoreData(payload) {
  const {
    status,
    message,
    error = "",
  } = await axiosUtil.post({
    path: `bin/restore?token=${tokenUtil.getAuthToken()}`,
    body: payload,
  });
  if (status === "failed") {
    enqueueSnackbar("Failed get data", {
      variant: "error",
      autoHideDuration: 2000,
    });
    return { message, status, error: error || message };
  } else {
    // enqueueSnackbar("successful.", {
    //     variant: "success",
    //     autoHideDuration: 2000,
    //   });
    return;
  }
}
async function deleteData(id, type) {
  const {
    status,
    data,
    message,
    error = "",
  } = await axiosUtil.delete({
    path: `bin/${type}`,
    params: { token: tokenUtil.getAuthToken(), id },
  });
  if (status === "failed") {
    return { status, error: error || message };
  } else if (!isEmpty(data)) {
    return data;
  }
}
export default {
  getBinData,
  restoreData,
  deleteData,
};
