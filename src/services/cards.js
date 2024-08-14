import tokenUtil from "../utils/token.util";
import axiosUtil from "../utils/api.util";
import { groupBy, isEmpty } from "lodash";

async function getCardsData({
  _status,
  limit = 100,
  page = 0,
  responseType = "LIST",
  q,
  state,
  district,
  duration,
  created_by,
  selectedCard,
} = {}) {
  const _payload = {
    token: tokenUtil.getAuthToken(),
    mode: "ADMIN",
    limit,
    page,
    responseType,
    ...(_status && { status: _status }),
    ...(q && { q }),
    ...(state && { state }),
    ...(district && { district }),
    ...(duration && { duration }),
    ...(created_by && { created_by }),
    // duration: THIS WEEK
  };
  const {
    status,
    data,
    message,
    error = "",
    total_print_card = 0,
    total = 0,
  } = await axiosUtil.get({
    path: "cards",
    params: _payload,
  });
  if (status === "failed") {
    return { status, error: error || message };
  } else if (!isEmpty(data)) {
    if (!_status || selectedCard === "totalCards") {
      return {
        groupedData: data,
        totalPrintedCards: total_print_card,
        totalCards: total,
      };
    }
    const groupedData = groupBy(
      data,
      (card) => `${card.state}/${card.district}/${card.tehsil}`
    );
    const newGroupedData = {};
    Object.keys(groupedData).forEach((key) => {
      const groupByCreatedById = groupBy(groupedData[key], "created_by_uid");
      newGroupedData[key] = groupByCreatedById;
    });
    return {
      groupedData: newGroupedData,
      totalPrintedCards: total_print_card,
      totalCards: total,
    };
  } else {
    return {
      groupedData: [],
      totalPrintedCards: total_print_card,
      totalCards: total,
    };
  }
}

async function getUsersByIds({ ids = [] } = {}) {
  const {
    status,
    data,
    message,
    error = "",
  } = await axiosUtil.get({
    path: "auth/users-by-ids",
    params: {
      token: tokenUtil.getAuthToken(),
      ids: Array.from(ids).join(","),
    },
  });
  if (status === "failed") {
    return { status, error: error || message };
  } else if (!isEmpty(data)) {
    return data;
  }
}

async function getCardById({ id = "" } = {}) {
  const {
    status,
    data,
    message,
    error = "",
  } = await axiosUtil.get({
    path: `cards/${id}`,
    params: {
      token: tokenUtil.getAuthToken(),
    },
  });
  if (status === "failed") {
    return { status, error: error || message };
  } else if (!isEmpty(data)) {
    return data;
  }
}

async function getDistrictData({ stateId }) {
  const {
    status,
    data,
    message,
    error = "",
  } = await axiosUtil.get({
    path: "address/district",
    params: { stateId: stateId, type: "ADMIN" },
  });
  if (status === "failed") {
    return { status, error: error || message };
  } else if (!isEmpty(data)) {
    return data;
  }
}

export default {
  getCardsData,
  getUsersByIds,
  getDistrictData,
  getCardById,
};
