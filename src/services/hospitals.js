import axiosUtil from "../utils/api.util";
import { isEmpty } from "lodash";
import tokenUtil from "../utils/token.util";
import common from "./common";

async function getHospitals({ params } = {}) {
  const {
    status,
    data,
    message,
    error = "",
    total,
    total_results,
  } = await axiosUtil.get({
    path: `hospitals`,
    params: {
      token: tokenUtil.getAuthToken(),
      mode: "ADMIN",
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

async function getHospitalCategory({ params } = {}) {
  const {
    status,
    data,
    message,
    error = "",
    total,
    total_results,
  } = await axiosUtil.get({
    path: `settings`,
    params: {
      responseType: "ADMIN",
    },
  });
  if (status === "failed") {
    return { message, status, error: error || message };
  } else if (!isEmpty(data)) {
    return data;
  }
}

async function getHospitalById({ id } = {}) {
  const {
    status,
    data,
    message,
    error = "",
  } = await axiosUtil.get({
    path: `hospitals/${id}`,
    params: {
      token: tokenUtil.getAuthToken(),
    },
  });
  if (status === "failed") {
    return { message, status, error: error || message };
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

async function saveFormData({ id, formData }) {
  if (formData?.images?.length) {
    const imageData = formData?.images || [];
    const uploadedImageUrls = [];
    for (let i = 0; i < imageData.length; i++) {
      if (imageData[i] && !imageData[i].includes("https")) {
        const newformData = new FormData();
        const imageBlobData = dataUrlToBlob(imageData[i]);
        newformData.append(
          "file",
          imageBlobData,
          `${generateRandom5DigitNumber()}`
        );
        const url = await common.fileUpload(newformData);
        if (url.error) {
          continue;
        }
        uploadedImageUrls.push(url);
      } else {
        uploadedImageUrls.push(imageData[i]);
      }
    }
    formData.images = uploadedImageUrls;
  }
  if (
    formData?.signatureImageUrl &&
    !formData?.signatureImageUrl.includes("https")
  ) {
    const newformData = new FormData();
    const imageBlobData = dataUrlToBlob(formData?.signatureImageUrl);
    newformData.append(
      "file",
      imageBlobData,
      `${generateRandom5DigitNumber()}`
    );
    const url = await common.fileUpload(newformData);
    formData.signatureImage = url;
    delete formData.signatureImageUrl;
  }

  const {
    status,
    data,
    message,
    error = "",
  } = await axiosUtil.patch({
    path: `hospitals/${id}?token=${tokenUtil.getAuthToken()}`,
    body: formData,
  });
  if (status === "failed") {
    return { message, status, error: error || message };
  } else if (!isEmpty(data)) {
    return data;
  }
}

async function addHospital({ formData }) {
  const imageData = formData.images;
  const uploadedImageUrls = [];
  for (let i = 0; i < imageData.length; i++) {
    if (imageData[i] && !imageData[i].includes("https")) {
      const newformData = new FormData();
      const imageBlobData = dataUrlToBlob(imageData[i]);
      newformData.append(
        "file",
        imageBlobData,
        `${generateRandom5DigitNumber()}`
      );
      const url = await common.fileUpload(newformData);
      if (url.error) {
        continue;
      }
      uploadedImageUrls.push(url);
    } else {
      uploadedImageUrls.push(imageData[i]);
    }
  }
  formData.images = uploadedImageUrls;
  if (formData?.signatureImageUrl) {
    const newformData = new FormData();
    const imageBlobData = dataUrlToBlob(formData?.signatureImageUrl);
    newformData.append(
      "file",
      imageBlobData,
      `${generateRandom5DigitNumber()}`
    );
    const url = await common.fileUpload(newformData);
    formData.signatureImage = url;
    delete formData.signatureImageUrl;
  }
  const {
    status,
    data,
    message,
    error = "",
  } = await axiosUtil.post({
    path: `hospitals?token=${tokenUtil.getAuthToken()}`,
    body: formData,
  });
  if (status === "failed") {
    return { message, status, error: error || message };
  } else if (!isEmpty(data)) {
    return data;
  }
}
export default {
  getHospitals,
  getHospitalCategory,
  getHospitalById,
  saveFormData,
  addHospital,
};
