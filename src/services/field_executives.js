import axiosUtil from "../utils/api.util";
import { isEmpty } from "lodash";
import tokenUtil from "../utils/token.util";
import common from "./common";
import { enqueueSnackbar } from "notistack";

async function getUsers({ params } = {}) {
  const {
    status,
    data,
    message,
    error = "",
    total,
    total_results,
  } = await axiosUtil.get({
    path: `auth/users`,
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

async function getUserById({ uid }) {
  const {
    status,
    data,
    message,
    error = "",
  } = await axiosUtil.get({
    path: `auth/single/${uid}`,
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

async function getTLById({ tl_id, showExtra }) {
  const {
    status,
    message,
    error = "",
    ...data
  } = await axiosUtil.get({
    path: `auth/teamLeaderId`,
    params: {
      // token: tokenUtil.getAuthToken(),
      tlId: tl_id,
      showExtra,
    },
  });
  if (status === "failed") {
    return { message, status, error: error || message };
  } else if (!isEmpty(data)) {
    return data;
  }
}

async function getTeamLeaderDetailsById({ tlId }) {
  const data = await axiosUtil.get({
    path: `auth/teamLeaderId`,
    params: {
      tlId: tlId,
    },
  });
  if (data.status === "failed") {
    return {};
  } else if (!isEmpty(data)) {
    return data;
  }
}

async function updateUserRole({ formData, id }) {
  const data = await axiosUtil.patch({
    path: `auth/user/${id}`,
    params: {
      token: tokenUtil.getAuthToken(),
    },
    body: formData,
    // isFormData: true,
  });
  if (data.status === "failed") {
    return {};
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
  console.log("header", header);
  const mimeType = header.match(/:(.*?);/)[1];
  return base64ToBlob(base64Data, mimeType);
}

function generateRandom5DigitNumber() {
  return Math.floor(10000 + Math.random() * 90000);
}

async function uploadImage(image, skipBlob) {
  const newformData = new FormData();
  console.log("skipBlob", skipBlob);

  const imageBlobData = skipBlob ? image : dataUrlToBlob(image);
  newformData.append("file", imageBlobData, `${generateRandom5DigitNumber()}`);
  const url = await common.fileUpload(newformData);
  return url;
}

async function saveFieldExecutiveForm(formData, mode = "EDIT", id) {
  const { images, updatedImagesNames, signatureDataUrl } = formData;
  if (mode === "EDIT") {
    const keyMapper = {
      Profile: "image",
      aFront: "id_proof.front",
      aBack: "id_proof.back",
      Passport: "passportImage",
      RegistrationForm: "registrationFormImage",
      Agreement: "agreementImage",
      PanCard: "panCardImage",
    };
    const updatedImages = Object.keys(updatedImagesNames);
    for (const [name, image] of Object.entries(images)) {
      if (updatedImages.includes(name)) {
        if (name === "aFront") {
          if (isEmpty(formData.id_proof)) formData.id_proof = {};
          formData.id_proof.front = await uploadImage(image);
        } else if (name === "aBack") {
          if (isEmpty(formData.id_proof)) formData.id_proof = {};
          formData.id_proof.back = await uploadImage(image);
        } else {
          formData[keyMapper[name]] = await uploadImage(image);
        }
      }
    }
    // Object.entries(images).forEach(async (data) => {
    //   const [name, image] = data;
    //   if (updatedImages.includes(name)) {
    //     if (name === "aFront") {
    //       if (isEmpty(formData.id_proof)) formData.id_proof = {};
    //       formData.id_proof.front = await uploadImage(image);
    //     }
    //     if (name === "aBack") {
    //       if (isEmpty(formData.id_proof)) formData.id_proof = {};
    //       formData.id_proof.back = await uploadImage(image);
    //     } else {
    //       formData[keyMapper[name]] = await uploadImage(image);
    //     }
    //   }
    // });
    if (updatedImages.includes("signature") && signatureDataUrl) {
      formData.signatureImage = await uploadImage(formData.signatureDataUrl);
    }
    delete formData.signatureDataUrl;
    delete formData.updatedImagesNames;
    delete formData.images;
    console.log("formData", formData);
  }
  let path = `auth/user/${formData.id}`;

  if (mode === "STATSUPDATE") {
    path = `auth/user/${id}`;
  }
  const data = await axiosUtil.patch({
    path,
    params: {
      token: tokenUtil.getAuthToken(),
    },
    body: formData,
    // isFormData: mode == "STATSUPDATE",
  });
  if (data.status === "failed") {
    return {};
  } else if (!isEmpty(data)) {
    return data;
  }
}

async function saveTLDetails(formData) {
  try {
    const keyMapper = {
      Profile: "image",
      aFront: "id_proof.front",
      aBack: "id_proof.back",
      Passport: "passportImage",
      RegistrationForm: "registrationFormImage",
      Agreement: "agreementImage",
      PanCard: "panCardImage",
    };
    const { imagesToUpload, signatureDataUrl } = formData;
    Object.entries(imagesToUpload).forEach(async (data) => {
      const [name, image] = data;
      if (name === "aFront") {
        if (isEmpty(formData.id_proof)) formData.id_proof = {};
        formData.id_proof.back = await uploadImage(image);
      }
      if (name === "aBack") {
        if (isEmpty(formData.id_proof)) formData.id_proof = {};
        formData.id_proof.front = await uploadImage(image);
      } else {
        formData[keyMapper[name]] = await uploadImage(image);
      }
    });
    if (signatureDataUrl) {
      formData.signatureImage = await uploadImage(formData.signatureDataUrl);
    }
    delete formData.signatureDataUrl;
    delete formData.imagesToUpload;
    formData.token = tokenUtil.getAuthToken();
    console.log("formData", formData);

    const data = await axiosUtil.post({
      path: "auth/add-tl",
      body: formData,
    });
    if (data.status === "failed") {
      enqueueSnackbar("failed", {
        variant: data.message || "error",
        autoHideDuration: 2000,
      });
      return {};
    } else if (!isEmpty(data)) {
      return data;
    }
  } catch (error) {}
}

async function changeUserStatus(formData, id) {
  let path = `auth/user/suspend/${id}`;
  const data = await axiosUtil.patch({
    path,
    params: {
      token: tokenUtil.getAuthToken(),
    },
    body: formData,
  });
  if (data.status === "failed") {
    return {};
  } else if (!isEmpty(data)) {
    return data;
  }
}
export default {
  getUsers,
  getUserById,
  getTeamLeaderDetailsById,
  updateUserRole,
  saveFieldExecutiveForm,
  getTLById,
  changeUserStatus,
  saveTLDetails,
};
