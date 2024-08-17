import tokenUtil from "../utils/token.util";
import axiosUtil from "../utils/api.util";
import { groupBy, isEmpty } from "lodash";
import moment from "moment";

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
  tehsil,
  gram_p,
  till_duration,
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
    ...(tehsil && { tehsil }),
    ...(gram_p && { gram_p }),
    ...(till_duration && { till_duration }),

    // duration: THIS WEEK
  };
  const {
    status,
    data,
    message,
    error = "",
    total_print_card = 0,
    total = 0,
    total_showing = 0,
    total_print_card_showing = 0,
  } = await axiosUtil.get({
    path: "cards",
    params: _payload,
  });
  if (status === "failed") {
    return { status, error: error || message };
  } else if (!isEmpty(data)) {
    const idList = data.map((data) => data._id);
    if (!_status || selectedCard === "totalCards") {
      return {
        groupedData: data,
        totalPrintedCards: total_print_card,
        totalCards: total,
        totalPrintCardsShowing: total_print_card_showing,
        totalShowing: total_showing,
        idList,
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

    const unsortedKeys = Object.keys(newGroupedData);
    const countMap = {};
    const sortedObject = new Map();

    unsortedKeys.map((key) => {
      Object.keys(newGroupedData[key]).forEach((innerKey) => {
        if ((countMap[key] || 0) < newGroupedData[key][innerKey].length) {
          countMap[key] = newGroupedData[key][innerKey].length;
        }
      });
    });

    for (let i = 0; i < Object.keys(countMap).length - 1; i++) {
      const maxValue = Object.keys(countMap).reduce(
        (maxObject, key) => {
          if (maxObject.maxValue < countMap[key]) {
            return { key: key, maxValue: countMap[key] };
          }
          return maxObject;
        },
        { key: "", maxValue: 0 }
      );

      sortedObject.set(maxValue.key, newGroupedData[maxValue.key]);
      delete countMap[maxValue.key];
    }

    const newSortedMapObject = new Map();

    for (let [key, value] of sortedObject) {
      const newObject = {};
      const countMap = {};
      for (let i = 0; i < Object.keys(value).length; i++) {
        const _key = Object.keys(value)[i];
        countMap[_key] = sortedObject.get(key)[_key].length;
      }

      Object.keys(countMap)
        .sort((a, b) => countMap[b] - countMap[a])
        .forEach((_key) => {
          newObject[_key] = sortedObject.get(key)[_key];
        });
      newSortedMapObject.set(key, newObject);
    }

    return {
      groupedData: Object.fromEntries(newSortedMapObject),
      totalPrintedCards: total_print_card,
      totalPrintCardsShowing: total_print_card_showing,
      totalShowing: total_showing,
      totalCards: total,
      cards: idList,
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

async function renewCard(payload) {
  const issueDate = payload.issueDate
    ? new Date(payload.issueDate)
    : new Date(payload.createdAt);
  const expiryYears = payload.expiryYears + 2;
  const expiryDate = new Date(
    issueDate.getTime() + expiryYears * 365 * 24 * 60 * 60 * 1000
  );

  const bodyFormData = new FormData();
  bodyFormData.append("expiry_date", expiryDate.valueOf());
  bodyFormData.append("expiry_years", expiryYears);
  bodyFormData.append("expiry", moment(expiryYears).format("MMM YYYY"));
  console.log("bodyFormData", bodyFormData);

  const {
    status,
    data,
    message,
    error = "",
  } = await axiosUtil.patch({
    path: `cards/${payload.id}?token=${tokenUtil.getAuthToken()}`,
    body: bodyFormData,
    isFormData: true,
    options: { headers: { "Content-Type": "multipart/form-data" } },
  });
  if (status === "failed") {
    return { status, error: error || message };
  } else if (!isEmpty(data)) {
    return data;
  }
}

async function changeStatus(payload, id) {
  const bodyFormData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    bodyFormData.append(key, value);
  });

  const {
    status,
    data,
    message,
    error = "",
  } = await axiosUtil.patch({
    path: `cards/${id}?token=${tokenUtil.getAuthToken()}`,
    body: payload,
    // isFormData: true,
    // options: { headers: { "Content-Type": "multipart/form-data" } },
  });
  if (status === "failed") {
    return { status, error: error || message };
  } else if (!isEmpty(data)) {
    return data;
  }
}

async function updateCard(payload, id, updateImage, formData) {
  if (updateImage) {
    const {
      status,
      path,
      message,
      error = "",
    } = await axiosUtil.upload({
      url: "https://asia-south1-arogyam-super.cloudfunctions.net/files",
      body: formData,
      headers: {
        "Content-Type": "multipart/form-data",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
      },
    });
    if (status === "success") {
      payload.image = path;
    }
  }
  const {
    status,
    data,
    message,
    error = "",
  } = await axiosUtil.patch({
    path: `cards/${id}?token=${tokenUtil.getAuthToken()}`,
    body: payload,
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
  renewCard,
  changeStatus,
  updateCard,
};
