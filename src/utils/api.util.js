import axios from "axios";
import envUtil from "./env.util";
import { isEmpty } from "lodash";
import tokenUtil from "./token.util";
import storageUtil from "./storage.util";
import cookiesUtil from "./cookies.util";

// const PARAMS = ["get", "put", "delete"];
// const BODY = ["post"];

const { getApiUrl } = envUtil;

function request({ path, method, params, body, options, isFormData = false }) {
  console.log("headers", !isEmpty(body));
  console.log("body", body);

  const token = tokenUtil.getAuthToken();
  return axios({
    method,
    url: getApiUrl({ path }),
    // url: `https://asia-south1-arogyam-super.cloudfunctions.net/${path}`,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers && options.headers),
      ...(token && { Authorization: token }),
    },
    ...(params && { params }),
    ...(!isEmpty(body) && { data: body }),
    ...(isFormData && { data: body }),
  })
    .then((data) => {
      return data?.data || {};
    })
    .catch((error) => {
      console.error("err", error);
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
      return { error: error };
    });
}

function get({ path, params, options }) {
  return request({ method: "get", path, params, options });
}
function post({ path, body, options }) {
  return request({ method: "post", path, body, options });
}

function _delete({ path, body, options }) {
  return request({ method: "delete", path, body, options });
}
function patch({ path, body, params, options, isFormData }) {
  return request({ method: "patch", path, body, params, options, isFormData });
}

export default {
  get,
  post,
  delete: _delete,
  patch,
};
