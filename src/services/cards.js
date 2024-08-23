import tokenUtil from "../utils/token.util";
import axiosUtil from "../utils/api.util";
import { groupBy, isEmpty } from "lodash";
import moment from "moment";
import common from "./common";

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
    const tehsilCounts = {};

    let idList = data.map((data) => {
      if (tehsilCounts[data.tehsil]) {
        tehsilCounts[data.tehsil] = tehsilCounts[data.tehsil] + 1;
      } else {
        tehsilCounts[data.tehsil] = 1;
      }
      return data._id;
    });

    if (!_status || selectedCard === "totalCards") {
      return {
        groupedData: data,
        totalPrintedCards: total_print_card,
        totalCards: total,
        totalPrintCardsShowing: total_print_card_showing,
        totalShowing: total_showing,
        idList,
        tehsilCounts,
      };
    }
    idList = [];
    const groupedData = groupBy(data, (card) => {
      idList.push(card._id);
      return `${card.state}/${card.district}/${card.tehsil}`;
    });

    console.log("idList >>>>>", idList);

    const newGroupedData = {};
    Object.keys(groupedData).forEach((key) => {
      const groupByCreatedById = groupBy(groupedData[key], "created_by_uid");
      newGroupedData[key] = groupByCreatedById;
    });
    console.log("newGroupedData", newGroupedData);

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

    console.log("sortedObject", sortedObject);

    for (let i = 0; i < Object.keys(countMap).length; i++) {
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
      idList,
      tehsilCounts,
    };
  } else {
    return {
      groupedData: [],
      totalPrintedCards: total_print_card,
      totalCards: total,
      tehsilCounts: {},
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
  const id = payload.id;
  delete payload.id;
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

async function changeStatus(payload, id) {
  console.log("payload", payload);

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

function base64ToBlob(base64, mimeType) {
  // Decode the base64 string
  const binaryString = atob(base64);

  // Convert binary string to Uint8Array
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Create and return a Blob from the Uint8Array
  return new Blob([bytes], { type: mimeType });
}

function dataUrlToBlob(dataUrl) {
  const [header, base64Data] = dataUrl.split(",");
  const mimeType = header.match(/:(.*?);/)[1];
  return base64ToBlob(base64Data, mimeType);
}

function generateRandom5DigitNumber() {
  return Math.floor(10000 + Math.random() * 90000);
}

async function uploadImage(image) {
  const newformData = new FormData();
  const imageBlobData = dataUrlToBlob(image);
  newformData.append("file", imageBlobData, `${generateRandom5DigitNumber()}`);
  const url = await common.fileUpload(newformData);
  return url;
}

async function updateCard(payload, id, image) {
  let imgUrl;
  if (image) {
    imgUrl = await uploadImage(image);
  }
  if (imgUrl) {
    payload.image = imgUrl;
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

async function deleteCard(id) {
  const {
    status,
    data,
    message,
    error = "",
  } = await axiosUtil.delete({
    path: "cards",
    params: { token: tokenUtil.getAuthToken(), id },
  });
  if (status === "failed") {
    return { status, error: error || message };
  } else if (!isEmpty(data)) {
    return data;
  }
}

async function markAsPrint(ids) {
  try {
    const {
      status,
      data,
      message,
      error = "",
    } = await axiosUtil.post({
      path: `cards/moveStatus?token=${tokenUtil.getAuthToken()}`,
      body: { uids: ids },
    });
    if (status === "failed") {
      return { status, error: error || message };
    } else if (!isEmpty(data)) {
      return data;
    }
  } catch (error) {
    throw error;
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
  deleteCard,
  markAsPrint,
};
