import { isEmpty } from "lodash";
import axiosUtil from "../utils/api.util";

async function getUsers({ params } = {}) {
  const {
    status,
    data,
    message,
    error = "",
    total,
    total_results,
  } = await axiosUtil.get({
    path: `user/get-customer`,
    params: {
      ...params,
    },
  });
  if (status === "failed") {
    return { message, status, error: error || message };
  } else if (!isEmpty(data)) {
    return {
      data,
      total,
      total_results,
    };
  }
}
async function getUsersByUid({ params } = {}) {
  const {
    status,
    data,
    message,
    error = "",
  } = await axiosUtil.get({
    path: `user/get-agent-details-by-uid`,
    params: {
      ...params,
    },
  });
  if (status === "failed") {
    return { message, status, error: error || message };
  } else if (!isEmpty(data)) {
    return {
      data,
      status,
    };
  }
}

async function getUserById({ id } = {}) {
  const {
    status,
    data,
    message,
    error = "",
  } = await axiosUtil.get({
    path: `user/get-user-by-id`,
    params: {
      id,
    },
  });
  if (status === "failed") {
    return { message, status, error: error || message };
  } else if (!isEmpty(data)) {
    return {
      data,
    };
  }
}

async function getUserCardById({ id } = {}) {
  const {
    status,
    data,
    message,
    error = "",
  } = await axiosUtil.get({
    path: `cards/get-card-by-userid`,
    params: {
      id,
    },
  });
  if (status === "failed") {
    return { message, status, error: error || message };
  } else if (!isEmpty(data)) {
    return {
      data,
    };
  }
}

async function verifyUser({ id }) {
  const {
    status,
    data,
    message,
    error = "",
  } = await axiosUtil.get({
    path: `user/verify-customer`,
    params: {
      userId: id,
    },
  });
  if (status === "failed") {
    return { message, status, error: error || message };
  } else if (!isEmpty(data)) {
    return {
      data,
    };
  }
}

export { getUsers, getUserById, getUserCardById, verifyUser, getUsersByUid };
