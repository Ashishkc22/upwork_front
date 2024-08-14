import axiosUtil from "../utils/api.util";
import { isEmpty } from "lodash";

async function getState() {
  const {
    status,
    data,
    message,
    error = "",
  } = await axiosUtil.get({
    path: "address/state",
    params: {
      type: "ADMIN",
    },
  });
  if (status === "failed") {
    return { message, status, error: error || message };
  } else if (!isEmpty(data)) {
    return data;
  }
}
export default {
  getState,
};
