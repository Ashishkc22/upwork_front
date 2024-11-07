import domtoimage from "dom-to-image-more";
import jsPDF from "jspdf";
import { createRoot } from "react-dom/client";
import ReactDOM, { flushSync } from "react-dom";
import moment from "moment";

// images: {
//   SupportImage: <SupportImage />,
//   LogoImage: <LogoImage />,
// }

// ----------------------- new logic --------------------------------------

function componentToImageData({ Element, data, images }) {
  return new Promise((resolve, reject) => {
    try {
      let container;
      let root;
      container = document.createElement("div");
      container.setAttribute("id", `${data._id}-container`);
      container.style.position = "absolute";
      container.style.left = "-9999px";
      document.body.appendChild(container);
      root = createRoot(container);
      // root.render(
      //   <Element isPrint={true} showCardTag cardData={data} images={images} />
      // );
      flushSync(() =>
        root.render(
          <Element isPrint={true} showCardTag cardData={data} images={images} />
        )
      );
      // const observer = new MutationObserver(async (mutationsList) => {
      //   observer.disconnect();
      // await new Promise((resolve) => setTimeout(resolve, 500));
      var node = document.getElementById(`${data._id}-download`);
      const offsetHeight = node?.offsetHeight;
      const offsetWidth = node?.offsetWidth;
      const scale = 2;
      // Convert the container to an image
      domtoimage
        .toJpeg(node, {
          height: offsetHeight * scale,
          style: {
            transform: `scale(${scale}) translate(${
              offsetWidth / 2 / scale
            }px, ${offsetHeight / 2 / scale}px)`,
          },
          width: offsetWidth * scale,
          copyDefaultStyles: true,
        })
        .then((dataUrl) => {
          // Clean up
          root.unmount();
          document.body.removeChild(container);
          return resolve(dataUrl);
        });
      // await new Promise((resolve) => setTimeout(resolve, 500));
      // });
      // observer.observe(container, { childList: true, subtree: true });
    } catch (error) {
      reject(error);
    }
  });
}

// Function to divide data into chunks
const chunkArray = (array, size = 5) => {
  const chunks = {};
  let index = 0;
  for (let i = 0; i < array.length; i += size) {
    chunks[index] = array.slice(i, i + size);
    index += 1;
  }
  return chunks;
};

function processImageDataBatchs({ Element, cardsData = [], images }) {
  return cardsData.map((data) =>
    componentToImageData({ Element, data, images })
  );
}

async function getCardImages({ Element, cardsData = [], images, batchSize }) {
  try {
    if (cardsData.length) {
      const chunks = chunkArray(cardsData, batchSize);
      const processedData = {};
      for (let i in chunks) {
        processedData[i] = processImageDataBatchs({
          Element,
          cardsData: chunks[i],
          images,
        });
      }
      return await Promise.all(Object.values(processedData).flat());
    } else {
      throw new Error("Empty cards Data.");
    }
  } catch (error) {
    throw error;
  }
}

function addCardBackSideImage({
  doc,
  cardPositons,
  backSideImage,
  addNewPage = false,
  width = 85.6,
  height = 54,
  xOffset = 0,
  yOffset = 1,
}) {
  doc.addPage();
  cardPositons.forEach((postions, index) => {
    const x = postions.x === 113 ? 10 : 115;
    console.log("x and y values", { x: x + xOffset, y: postions.y + yOffset });

    addCardInDoc({
      doc,
      dataUrl: backSideImage,
      x: x + xOffset,
      y: postions.y + yOffset,
      width,
      height,
    });
  });
  if (addNewPage) {
    doc.addPage();
  }
}

// ----------------------------------old logic -----------------------------

function getImageDataURLFromRef(imgRef) {
  if (imgRef) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = imgRef.width;
    canvas.height = imgRef.height;
    ctx.drawImage(imgRef, 0, 0);
    const imageDataUrl = canvas.toDataURL("image/jpeg");
    return imageDataUrl;
  } else {
    console.info("Image ref not found", imgRef);
    return null;
  }
}

async function downloadSingleCard({
  Element,
  cardData,
  secondaryImage,
  fileName,
}) {
  let container;
  let root;
  try {
    // Create a temporary container and render the React component into it
    container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px"; // Move off-screen
    document.body.appendChild(container);

    // Render the component into the container
    root = createRoot(container);
    // Render your component
    root.render(Element);

    const observer = new MutationObserver(async (mutationsList) => {
      // If any mutations are observed, assume rendering is complete
      observer.disconnect(); // Stop observing once rendering is detected
      // Wait for the component to be rendered
      await new Promise((resolve) => setTimeout(resolve, 500));
      var node = document.getElementById(`${cardData._id}-download`);
      const offsetHeight = node?.offsetHeight;
      const offsetWidth = node?.offsetWidth;

      const scale = 2;
      const fontPromise = document.fonts.ready;
      await fontPromise;
      // Convert the container to an image
      const dataUrl = await domtoimage.toJpeg(node, {
        height: offsetHeight * scale,
        style: {
          transform: `scale(${scale}) translate(${offsetWidth / 2 / scale}px, ${
            offsetHeight / 2 / scale
          }px)`,
        },
        width: offsetWidth * scale,
      });

      const doc = new jsPDF("p", "mm", "", true);

      // const width = doc.internal.pageSize.getWidth() * 0.4;
      // const height = doc.internal.pageSize.getHeight() * 0.3;
      const width = 87.6;
      const height = 57.6;

      const backImageWidth = 85.6;
      const backImageheight = 54;

      // doc.addImage(dataUrl, "PNG", 10, 10, width, height, "", "MEDIUM"); // Adjust position and size as needed

      doc.addImage(dataUrl, "PNG", 10, 10, width, height); // Adjust position and size as needed
      // doc.addImage(dataUrl, "PNG", 10, 80, width, height); // Adjust position and size as needed
      // doc.rect(10, 12, 85.6, 54);
      doc.addImage(
        secondaryImage,
        "JPEG",
        120,
        10,
        backImageWidth,
        backImageheight,
        "",
        "MEDIUM"
      ); // Adjust position and size as needed

      doc.save(fileName);
      // preview({ pdfBlob: doc.output("blob") });
      // Clean up
      ReactDOM?.unmountComponentAtNode(container);
      root.unmount();
      document.body.removeChild(container);
    });

    // Start observing the container for changes
    observer.observe(container, { childList: true, subtree: true });
  } catch (error) {
    // Clean up
    ReactDOM.unmountComponentAtNode(container);
    document.body.removeChild(container);
    console.error("oops, something went wrong!", error);
    return null;
  }
}

function getImageData({ Element, cardData = [], images }) {
  return new Promise(async (myResolve, myReject) => {
    try {
      // const elementData = [];
      let allPromises = [];
      for (let i = 0; i < cardData.length; i++) {
        allPromises.push(
          componentToImageData({ Element, data: cardData[i], images })
        );

        // let container;
        // let root;
        // container = document.createElement("div");
        // container.setAttribute("id", `${cardData[i]._id}-container`);
        // container.style.position = "absolute";
        // container.style.left = "-9999px"; // Move off-screen
        // document.body.appendChild(container);

        // Render the component into the container
        // root = createRoot(container);

        // root.render(
        //   <Element
        //     isPrint={true}
        //     showCardTag
        //     cardData={cardData[i]}
        //     images={images}
        //   />
        // );
        // console.time("exampleFunctionTime", cardData[i]._id);
        // const observer = new MutationObserver(async (mutationsList) => {
        //   // If any mutations are observed, assume rendering is complete
        //   observer.disconnect(); // Stop observing once rendering is detected
        //   // Wait for the component to be rendered'
        //   await new Promise((resolve) => setTimeout(resolve, 500));

        //   var node = document.getElementById(`${cardData[i]._id}-download`);
        //   const offsetHeight = node?.offsetHeight;
        //   const offsetWidth = node?.offsetWidth;
        //   const scale = 2;
        //   // Convert the container to an image
        //   const dataUrl = await domtoimage.toJpeg(node, {
        //     height: offsetHeight * scale,
        //     style: {
        //       transform: `scale(${scale}) translate(${
        //         offsetWidth / 2 / scale
        //       }px, ${offsetHeight / 2 / scale}px)`,
        //     },
        //     width: offsetWidth * scale,
        //     copyDefaultStyles: true,
        //   });

        //   elementData[i] = dataUrl;
        //   console.timeEnd("exampleFunctionTime", cardData[i]._id);
        //   // Clean up
        //   root.unmount();
        //   ReactDOM?.unmountComponentAtNode(container);
        //   document.body.removeChild(container);
        //   if (cardData.length === elementData.length) {
        //     await new Promise((resolve) => setTimeout(resolve, 500));
        //     return myResolve(elementData);
        //   }
        // });
        // Start observing the container for changes
        // observer.observe(container, { childList: true, subtree: true });
      }
      const elementData = await Promise.all(allPromises);
      return myResolve(elementData);
    } catch (error) {
      myReject(error);
    }
  });
}

function addBackSideImage({
  doc,
  imgUrl,
  count = 10,
  skipBackSide = [],
  xposition = 10,
}) {
  doc.addPage();
  const backImageWidth = 85.6;
  const backImageheight = 54;
  let yposition = 0;

  for (let i = 0; i < count; i++) {
    if (!skipBackSide.includes(i)) {
      doc.addImage(
        imgUrl,
        "JPEG",
        xposition,
        yposition + 6,
        backImageWidth,
        backImageheight,
        "",
        "MEDIUM"
      );
      // doc.rect(xposition + 3, yposition + 6, 85.6, 54);
    }
    if (xposition === 115) {
      yposition = yposition + 57;
    }
    xposition = xposition === 10 ? 115 : 10;
  }
  // doc.saveGraphicsState();
  // const pageWidth = doc.internal.pageSize.getWidth();
  // doc.transform(-1, 0, 0, 1, pageWidth, 0); // Mirroring horizontally
  // doc.restoreGraphicsState();
}

function preview({ pdfBlob }) {
  // Create a new div element
  var a4Div = document.createElement("iframe");

  // Set the styles to match the size of an A4 paper
  a4Div.style.width = "793.7px"; // A4 width in pixels (210mm)
  a4Div.style.height = "100%"; // A4 height in pixels (297mm)
  a4Div.style.backgroundColor = "white";
  a4Div.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
  a4Div.style.margin = "20px auto";
  a4Div.style.position = "fixed";
  a4Div.style["z-index"] = "5";
  a4Div.style.top = "0%";
  a4Div.style.left = "21%";

  const pdfUrl = URL.createObjectURL(pdfBlob);
  a4Div.src = pdfUrl;

  // Append the new div to the body
  document.body.appendChild(a4Div);
}

const addCardInDoc = ({
  doc,
  dataUrl,
  type = "JPEG",
  x,
  y,
  width = 87.6,
  height = 57.6,
  quality = "MEDIUM",
}) => {
  doc.addImage(dataUrl, type, x, y, width, height, "", quality);
  return { x, y };
};

const addCardCountText = ({ doc, text, x, y, xOffset = 90, yOffset = 30 }) => {
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(text, x + xOffset, y + yOffset, {
    angle: 90,
    rotationDirection: 1,
  });
};

async function downloadMultipleCard({
  Element,
  cardData,
  handleDownloadCompleted,
  images,
  agentDetails,
  tlDetails,
  secondaryImage,
}) {
  console.time("CardImagesData");
  // const caardImageData = await getCardImages({
  //   Element,
  //   cardsData: cardData,
  //   images,
  //   batchSize: 20,
  // });
  const caardImageData = await getImageData({
    Element,
    cardData,
    images,
  });
  console.timeEnd("CardImagesData");

  const imageBackSideUrl = getImageDataURLFromRef(secondaryImage);

  const doc = new jsPDF("p", "mm", "", true);
  const width = 87.6;
  const height = 57.6;
  let x = 8;
  let y = 5;
  let yIncrementValue = 57;
  let cardsPerPage = 10;
  let cardPositons = [];

  createAFENameTLName({
    doc,
    feName: agentDetails?.name,
    tlName: tlDetails?.name,
    count: caardImageData.length,
    startX: x,
    startY: y,
  });
  cardsPerPage -= 1;
  x = 113;
  caardImageData.forEach((url, index) => {
    // adding card on page
    const imagePosition = addCardInDoc({ doc, dataUrl: url, x, y });
    cardPositons.push(imagePosition);
    cardsPerPage -= 1;
    addCardCountText({ doc, x, y, text: String(cardPositons.length) });
    if (cardsPerPage === 0) {
      // add the backside of the page
      addCardBackSideImage({
        doc,
        cardPositons,
        backSideImage: imageBackSideUrl,
        addNewPage: true,
      });

      cardsPerPage = 10;
      x = 8;
      y = 5;
      cardPositons = [];
    } else if (caardImageData.length - 1 === index) {
      // add only backside and don't add another new page.
      addCardBackSideImage({
        doc,
        cardPositons,
        backSideImage: imageBackSideUrl,
        addNewPage: false,
      });
    } else {
      if (x === 113) {
        y += yIncrementValue;
        x = 8;
      } else {
        x = 113;
      }
    }
  });

  // const cardCount = cardData.length;
  // let imageData = (await getImageData({ Element, cardData, images })) || [];
  // let pageCardLimit = 9;
  // let skipBackSide = [];
  // createAFENameTLName({
  //   doc,
  //   feName: agentDetails?.name,
  //   tlName: tlDetails?.name,
  //   count: cardCount,
  //   startX: xposition,
  //   startY: yposition,
  // });
  // skipBackSide.push(1);
  // xposition = xposition === 10 ? 113 : 10;
  // count += 1;

  // imageData.forEach((dataUrl, index) => {
  //   // ADD IMAGE
  //   doc.addImage(
  //     dataUrl,
  //     "JPEG",
  //     xposition,
  //     yposition,
  //     width,
  //     height,
  //     "",
  //     "MEDIUM"
  //   );

  //   // doc.rect(xposition - 3, yposition, 85.6, 54);

  //   // ADD CARD COUNT TEXT
  //   doc.setFontSize(12);
  //   doc.setFont("helvetica", "bold");
  //   doc.text(`${index + 1}`, xposition + 90, yposition + 30, {
  //     angle: 90,
  //     rotationDirection: 1,
  //   });

  //   if (xposition === 113) {
  //     yposition = yposition + 57;
  //   }
  //   if (index === imageData.length - 1 && count != 9) {
  //     console.log("imageData.length", imageData.length);
  //     console.log("index", index);
  //     let par_count = count + 1;
  //     // skipBackSide.unshift(count);
  //     if (count === imageData.length) {
  //       console.log("BBBB Adding Back side page", skipBackSide);
  //       console.log("BBB count", count);
  //       par_count += 1;
  //       skipBackSide.push(imageData.length);
  //     }
  //     if (count === 0) {
  //       par_count += 1;
  //       skipBackSide.push(0);
  //     }
  //     console.log("Adding Back side page", skipBackSide);
  //     console.log("count", count);

  //     addBackSideImage({
  //       doc,
  //       imgUrl: imageBackSideUrl,
  //       count: par_count,
  //       skipBackSide,
  //     });
  //   }
  //   // ADD NEW PAGE
  //   if (count === 9) {
  //     console.log("Adding Back side page ---last");

  //     addBackSideImage({
  //       doc,
  //       imgUrl: imageBackSideUrl,
  //       count: count + 1,
  //       ...(pageCardLimit === 9 && { skipBackSide: [1] }),
  //     });
  //     xposition = 10;
  //     yposition = 5;
  //     console.log("Adding page");
  //     if (index != imageData.length - 1) {
  //       doc.addPage();
  //     }
  //     skipBackSide = [];
  //     count = 0;
  //     pageCardLimit = 10;
  //   } else {
  //     count += 1;
  //     xposition = xposition === 10 ? 113 : 10;
  //   }

  //   if (index == cardData.length - 1) {
  doc.save(
    `${tlDetails.name.replaceAll(" ", "_")}_${
      agentDetails?.name
        ? agentDetails.name.replaceAll(" ", "_")
        : agentDetails.id
    }#${caardImageData.length}_${moment().format("DD_MMM_YYYY_hh_mm")}.pdf`
  );
  // preview({ pdfBlob: doc.output("blob") });
  handleDownloadCompleted();
  //   }
  // });
}

function createAFENameTLName({ doc, feName, tlName, count, startX, startY }) {
  const pxToPt = (px) => px * 0.75;
  const boxWidth = pxToPt(111.8); // 340.5 pt
  const boxHeight = pxToPt(72); // 210.75 pt
  doc.rect(startX, startY, boxWidth, boxHeight);
  doc.setFont("helvetica", "Normal");
  doc.setFontSize(20);
  const combinedText = `${tlName}\n${feName}\n${count}`;
  const textWidth = doc.getTextWidth(
    combinedText.split("\n").reduce((a, b) => (a.length > b.length ? a : b))
  );
  const lineHeight = doc.getLineHeight() / doc.internal.scaleFactor;
  const textHeight = lineHeight * combinedText.split("\n").length;
  const textX = startX + (boxWidth - textWidth) / 2;
  const textY = startY + (boxHeight - textHeight) / 2 + lineHeight; // Adjust for vertical centering
  doc.text(combinedText, startX + boxWidth / 2, textY, {
    align: "center",
    maxWidth: boxWidth,
  });
  return { x: startX, y: startY };
}

async function downloadMultipleCardWithMultipleAgent({
  Element,
  cardData,
  handleDownloadCompleted = () => {},
  images,
  districtName,
  secondaryImage,
}) {
  console.log("secondaryImage", secondaryImage);

  const imageBackSideUrl = getImageDataURLFromRef(secondaryImage);
  const doc = new jsPDF("p", "mm", "", true);

  const width = 87.6;
  const height = 57.6;

  let cardCount = 0;
  let count = 0;
  let totalCardCount = 0;
  // ------------------------Card left
  // card on left side values
  // xposition = 10;
  // yposition = 0; incr by 54
  // ------------------------Card right
  // card on right side values
  // xposition = 120;
  // yposition = 0;  incr by 54

  // ------------------------Card Count right
  // card on right side values
  // textXposition = 215;
  // textYposition = 35; incr by 50
  // ------------------------Card Count left
  // textXposition = 105;
  // textYposition = 35; incr by 50

  const imageData = {};
  for (let i = 0; i < cardData.length; i++) {
    const key = cardData[i]._id.createdBy;

    imageData[key] = {
      feDetails: cardData[i].userDetails,
      tlDetails: cardData[i].teamLeaderDetails,
      url:
        (await getImageData({
          Element,
          cardData: cardData[i].cards,
          images,
        })) || "",
    };
    cardCount += imageData[key].length;
  }
  let xposition = 8;
  let yposition = 5;
  const imageDataKeys = Object.keys(imageData);
  let skipBackSide = [];
  for (let i = 0; i < imageDataKeys.length; i++) {
    const agentIdAndKey = imageDataKeys[i];
    const dataUrl = imageData[agentIdAndKey].url;
    const feDetails = imageData[agentIdAndKey].feDetails;
    const [tlDetails] = imageData[agentIdAndKey]?.tlDetails || [];

    let pageCardLimit = 9;
    totalCardCount += dataUrl.length;
    for (let j = 0; j < dataUrl.length; j++) {
      // ADD BOX WITH TLNAME/FENAME
      if (j === 0) {
        console.log("TLFE TEXTBOX -----------------------------", j);
        createAFENameTLName({
          doc,
          feName: feDetails?.name,
          tlName: tlDetails?.name,
          count: dataUrl.length,
          startX: xposition,
          startY: yposition,
        });
        skipBackSide.push(xposition === 8 ? count + 1 : count - 1);
        if (count === 9) {
          xposition = 8;
          yposition = 5;
          count = 0;
          doc.addPage();
        } else {
          if (xposition === 113) {
            yposition = yposition + 57;
          }
          xposition = xposition === 8 ? 113 : 8;
          count += 1;
        }
      }

      // ADD CARD IMAGE
      doc.addImage(
        dataUrl[j],
        "JPEG",
        xposition,
        yposition,
        width,
        height,
        "",
        "MEDIUM"
      );

      // ADD CARD COUNT TEXT
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`${j + 1}`, xposition + 95 - 3, yposition + 35, {
        angle: 90,
        rotationDirection: 1,
      });

      if (xposition === 113) {
        yposition = yposition + 57;
      }
      if (
        count < 9 &&
        j === dataUrl.length - 1 &&
        i === imageDataKeys.length - 1
      ) {
        if (count % 2 == 0) {
          skipBackSide.push(count);
        }
        addBackSideImage({
          doc,
          imgUrl: imageBackSideUrl,
          count: count % 2 == 0 ? count + 2 : count + 1,
          skipBackSide,
        });
        skipBackSide = [];
        count = 0;
      }
      // ADD NEW PAGE
      if (count === 9) {
        addBackSideImage({
          doc,
          imgUrl: imageBackSideUrl,
          count: count + 1,
          skipBackSide,
        });
        skipBackSide = [];
        xposition = 8;
        yposition = 5;
        if (j + 1 < dataUrl.length || i + 1 < imageDataKeys.length) {
          doc.addPage();
        }
        count = 0;
        pageCardLimit = 10;
      } else {
        count += 1;
        xposition = xposition === 8 ? 113 : 8;
      }
    }
  }
  doc.save(
    `${districtName?.trim()}#${totalCardCount}_${moment().format(
      "DD_MMM_YYYY_hh_mm"
    )}.pdf`
  );
  // preview({ pdfBlob: doc.output("blob") });

  handleDownloadCompleted();
}

async function downloadMultipleLevelCardData({
  Element,
  cardData,
  downloadCompleted,
  images,
  secondaryImage,
}) {
  try {
    const groupNamekeys = Object.keys(cardData);
    for (let i = 0; i < groupNamekeys.length; i++) {
      const splitName = groupNamekeys[i].split("/");
      const districtName = splitName[splitName.length - 1];

      await downloadMultipleCardWithMultipleAgent({
        Element,
        cardData: cardData[groupNamekeys[i]],
        images: images,
        districtName,
        secondaryImage,
      });
    }
    downloadCompleted({ downloadCompleted: true });
  } catch (error) {}
}
export default {
  downloadSingleCard,
  downloadMultipleCard,
  downloadMultipleLevelCardData,
  downloadMultipleCardWithMultipleAgent,
};
