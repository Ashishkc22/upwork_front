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
export default {
  getAddressData,
};
