import axios from "axios";
import envUtil from "./env.util";
import { isEmpty } from "lodash";
import tokenUtil from "./token.util";
import storageUtil from "./storage.util";
import { enqueueSnackbar } from "notistack";
import cookiesUtil from "./cookies.util";

// const PARAMS = ["get", "put", "delete"];
// const BODY = ["post"];

const { getApiUrl } = envUtil;
const _getAuthToken = () => {
  const token = tokenUtil.getAuthToken();
  if (token) {
    return { Authorization: token };
  }
  return {};
};

function request({
  path,
  method,
  params,
  body,
  options,
  isFormData = false,
  url,
  skipNgrokHeader = false,
}) {
  return axios({
    method,
    url: url || getApiUrl({ path }),
    // url: `https://asia-south1-arogyam-super.cloudfunctions.net/${path}`,
    headers: {
      ...(!skipNgrokHeader && { "ngrok-skip-browser-warning": "69420" }),
      "Content-Type": isFormData ? "multipart/form-data" : "application/json",
      ...(options?.headers && options.headers),
      ...(!isFormData && _getAuthToken()),
    },
    ...(params && { params }),
    ...(!isEmpty(body) && { data: body }),
    ...(isFormData && { data: body }),
  })
    .then((data) => {
      if (
        data?.data?.status === "failed" &&
        data?.data?.message === "Invalid Token"
      ) {
        cookiesUtil.clearAllCookies();
        enqueueSnackbar("Invalid Token", {
          variant: "error",
          autoHideDuration: 2000,
        });
        window.location.href = "/";
      }
      return data?.data || {};
    })
    .catch((error) => {
      console.error("err", error);
      enqueueSnackbar(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong.",
        {
          variant: "error",
          autoHideDuration: 2000,
        }
      );
      // if (
      //   error.response.data.error === "jwt expired" ||
      //   error.response.data.error === "Missing access token."
      // ) {
      //   storageUtil.eraseStroageData();
      //   cookiesUtil.clearAllCookies();
      // }
      // if (error.response?.data && error.response.status === 404) {
      //   return { error: "Not Found" };
      // }
      return { error: error?.response?.data || error };
    });
}

function get({ path, params, options }) {
  return request({ method: "get", path, params, options });
}
function post({ path, body, options }) {
  return request({ method: "post", path, body, options });
}

function _delete({ path, body, options, params }) {
  return request({ method: "delete", path, body, options, params });
}
function patch({ path, body, params, options, isFormData }) {
  return request({ method: "patch", path, body, params, options, isFormData });
}

function upload({ isFormData, url, headers, body }) {
  console.log("isFormData", isFormData);

  return request({
    method: "post",
    isFormData,
    url,
    body,
    options: { headers },
    skipNgrokHeader: true,
  });
}

// file
// https://asia-south1-arogyam-super.cloudfunctions.net/files
// POST

export default {
  get,
  post,
  delete: _delete,
  patch,
  upload,
};
