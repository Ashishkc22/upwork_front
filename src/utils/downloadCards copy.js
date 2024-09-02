import domtoimage from "dom-to-image";
import jsPDF from "jspdf";
import { createRoot } from "react-dom/client";
import ReactDOM from "react-dom";
import moment from "moment";
import Compressor from "compressorjs";

// images: {
//   SupportImage: <SupportImage />,
//   LogoImage: <LogoImage />,
// }

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
      var node = document.getElementById(cardData._id);
      const offsetHeight = node?.offsetWidth;
      const offsetWidth = node?.offsetWidth;

      const scale = 2;

      // Convert the container to an image
      const dataUrl = await domtoimage.toPng(node, {
        height: offsetHeight * scale,
        style: {
          transform: `scale(${scale}) translate(${offsetWidth / 2 / scale}px, ${
            offsetHeight / 2 / scale
          }px)`,
        },
        width: offsetWidth * scale,
      });

      const doc = new jsPDF("p", "mm", "letter", true);

      const width = doc.internal.pageSize.getWidth() * 0.4;
      const height = doc.internal.pageSize.getHeight() * 0.3;

      const backImageWidth = doc.internal.pageSize.getWidth() * 0.4;
      const backImageheight = doc.internal.pageSize.getHeight() * 0.18;

      // doc.addImage(dataUrl, "PNG", 10, 10, width, height, "", "MEDIUM"); // Adjust position and size as needed

      doc.addImage(dataUrl, "PNG", 10, 10, width, height); // Adjust position and size as needed
      doc.addImage(
        secondaryImage,
        "JPEG",
        120,
        19,
        backImageWidth,
        backImageheight,
        "",
        "MEDIUM"
      ); // Adjust position and size as needed

      doc.save(
        fileName ||
          `${
            cardData?.create_by_name
              ? cardData.create_by_name.replaceAll(" ", "_")
              : cardData.created_by_uid.replaceAll(" ", "_")
          }#${1}_${moment().format("DD_MMM_YYYY_HH_MM")}.pdf`
      );
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
      const elementData = [];
      for (let i = 0; i < cardData.length; i++) {
        let container;
        let root;
        container = document.createElement("div");
        container.setAttribute("id", `${cardData[i]._id}-container`);
        container.style.position = "absolute";
        container.style.left = "-9999px"; // Move off-screen
        document.body.appendChild(container);

        // Render the component into the container
        root = createRoot(container);

        root.render(
          <Element showCardTag cardData={cardData[i]} images={images} />
        );
        console.time("exampleFunctionTime", cardData[i]._id);
        const observer = new MutationObserver(async (mutationsList) => {
          // If any mutations are observed, assume rendering is complete
          observer.disconnect(); // Stop observing once rendering is detected
          // Wait for the component to be rendered'
          await new Promise((resolve) => setTimeout(resolve, 500));

          var node = document.getElementById(cardData[i]._id);
          const offsetHeight = node?.offsetWidth;
          const offsetWidth = node?.offsetWidth;
          const scale = 2;
          // Convert the container to an image
          const dataUrl = await domtoimage.toPng(node, {
            height: offsetHeight * scale,
            style: {
              transform: `scale(${scale}) translate(${
                offsetWidth / 2 / scale
              }px, ${offsetHeight / 2 / scale}px)`,
            },
            width: offsetWidth * scale,
          });
          elementData.push(dataUrl);
          console.timeEnd("exampleFunctionTime", cardData[i]._id);
          // Clean up
          root.unmount();
          ReactDOM?.unmountComponentAtNode(container);
          document.body.removeChild(container);
          if (cardData.length === elementData.length) {
            return myResolve(elementData);
          }
        });
        // Start observing the container for changes
        observer.observe(container, { childList: true, subtree: true });
      }
    } catch (error) {
      myReject(error);
    }
  });
}

async function downloadMultipleCard({
  Element,
  cardData,
  handleDownloadCompleted,
  images,
  agentDetails,
  tlDetails,
}) {
  const doc = new jsPDF("p", "mm", "letter", true);
  const width = doc.internal.pageSize.getWidth() * 0.4;
  const height = doc.internal.pageSize.getHeight() * 0.3;
  let xposition = 10;
  let yposition = 0;
  let count = 0;
  const cardCount = cardData.length;
  let pageCount = 1;
  const imageData = (await getImageData({ Element, cardData, images })) || [];

  let pageLimit = 9;

  createAFENameTLName({
    doc,
    feName: agentDetails?.name,
    tlName: tlDetails?.name,
    count: cardCount,
    // startX: i == 0 ? 10 : 130,
    // startY: 10,
    startX: xposition,
    startY: yposition + 10,
  });

  if (xposition == 10 && yposition == 0) {
    xposition = 120;
  } else {
    if (xposition == 120) {
      xposition = 10;
      yposition = yposition + 54;
    } else if (xposition == 10) {
      xposition = 120;
    }
  }
  let textXposition = 215;
  let textYposition = 35;

  imageData.forEach((dataUrl, index) => {
    doc.addImage(
      dataUrl,
      "PNG",
      xposition,
      yposition,
      width,
      height,
      "",
      "MEDIUM"
    );
    // if (count == 0 || count == 1) {
    //   doc.setFontSize(12);
    //   doc.text(
    //     `${
    //       agentDetails?.name
    //         ? agentDetails.name.replaceAll(" ", "_")
    //         : agentDetails.id
    //     }_${pageCount}/${cardCount}`,
    //     xposition - 3,
    //     50,
    //     {
    //       angle: 90,
    //       rotationDirection: 1,
    //     }
    //   );
    // }
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`${index + 1}`, textXposition - 3, textYposition, {
      angle: 90,
      rotationDirection: 1,
    });
    if (
      (index / 2 - parseInt(index / 2) === 0 && textXposition === 215) ||
      (index === 0 && textXposition === 215) ||
      index === imageData.length - 1
    ) {
      textYposition += 50;
    }
    if (index != imageData.length - 1) {
      textXposition = textXposition === 105 ? 215 : 105;
    }
    count += 1;

    if (xposition == 10 && yposition == 0) {
      xposition = 120;
    } else {
      if (xposition == 120) {
        xposition = 10;
        yposition = yposition + 54;
      } else if (xposition == 10) {
        xposition = 120;
      }
    }
    if (index === pageLimit) {
      pageLimit = 10;
    }
    if (count == pageLimit && index != cardData.length - 1) {
      xposition = 10;
      yposition = 0;
      doc.addPage();
      textXposition = 105;
      textYposition = 35;
      pageCount += 1;
      count = 0;
    }

    if (index == cardData.length - 1) {
      doc.save(
        `${tlDetails.name.replaceAll(" ", "_")}_${
          agentDetails?.name
            ? agentDetails.name.replaceAll(" ", "_")
            : agentDetails.id
        }#${cardCount}_${moment().format("DD_MMM_YYYY_HH_MM")}.pdf`
      );
      handleDownloadCompleted();
    }
  });
}

function createAFENameTLName({ doc, feName, tlName, count, startX, startY }) {
  const pxToPt = (px) => px * 0.75;
  const boxWidth = pxToPt(115); // 340.5 pt
  const boxHeight = pxToPt(65); // 210.75 pt
  doc.rect(startX, startY, boxWidth, boxHeight);
  doc.setFontSize(20);
  const combinedText = `${feName}\n${tlName}\n${count}`;
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
}

async function downloadMultipleCardWithMultipleAgent({
  Element,
  cardData,
  handleDownloadCompleted = () => {},
  images,
  districtName,
}) {
  const doc = new jsPDF("p", "mm", "letter", true);
  const width = doc.internal.pageSize.getWidth() * 0.4;
  const height = doc.internal.pageSize.getHeight() * 0.3;
  let xposition = 10;
  let yposition = 0;
  let cardCount = 0;
  let count = 0;

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

  let textXposition = 215;
  let textYposition = 35;

  const imageDataKeys = Object.keys(imageData);
  for (let i = 0; i < imageDataKeys.length; i++) {
    const agentIdAndKey = imageDataKeys[i];
    const dataUrl = imageData[agentIdAndKey].url;
    const feDetails = imageData[agentIdAndKey].feDetails;
    const [tlDetails] = imageData[agentIdAndKey]?.tlDetails || [];

    // textXposition = 215;
    // textYposition = 35;
    let pageLimit = 10;

    for (let j = 0; j < dataUrl.length; j++) {
      // adding text
      if (j == 0) {
        pageLimit = 9;
        createAFENameTLName({
          doc,
          feName: feDetails?.name,
          tlName: tlDetails?.name,
          count: dataUrl.length,
          startX: xposition,
          startY: yposition + 10,
        });
        console.log("xposition New Table ----", xposition);
        console.log("yposition New Table ----", xposition);
        console.log("textXposition New Table ----", textXposition);
        console.log("textYposition New Table ----", textYposition);
        if (xposition == 10 && yposition == 0) {
          xposition = 120;
        } else {
          if (xposition == 120) {
            xposition = 10;
            yposition = yposition + 54;
            textXposition = 105;
          } else if (xposition == 10) {
            xposition = 120;
          }
        }
      }
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`${j + 1}`, textXposition - 3, textYposition, {
        angle: 90,
        rotationDirection: 1,
      });

      // console.log("textXposition", textXposition);
      // console.log("textYposition", textYposition);
      // console.log("index ----------------------", j);
      // console.log("pageLimit ----------------------", pageLimit);

      if (
        (j / 2 - parseInt(j / 2) === 0 && textXposition === 215) ||
        (j === 0 && textXposition === 215) ||
        j === dataUrl.length - 1
      ) {
        textYposition += 50;
      }
      if (j != dataUrl.length - 1) {
        textXposition = textXposition === 105 ? 215 : 105;
      }
      doc.addImage(
        dataUrl[j],
        "PNG",
        xposition,
        yposition,
        width,
        height,
        "",
        "MEDIUM"
      );
      if (xposition == pageLimit && yposition == 0) {
        xposition = 120;
      } else {
        if (xposition == 120) {
          xposition = 10;
          yposition = yposition + 54;
        } else if (xposition == 10) {
          xposition = 120;
        }
      }
      if (pageLimit === j) {
        pageLimit = 10;
      }
      count += 1;
      if (count == pageLimit && j < dataUrl.length - 1) {
        xposition = 10;
        yposition = 0;
        doc.addPage();
        textXposition = 105;
        textYposition = 35;
        count = 0;
      }
    }
  }
  doc.save(
    `${districtName}#${cardCount}_${moment().format("DD_MMM_YYYY_HH_MM")}.pdf`
  );
  handleDownloadCompleted();
}

async function downloadMultipleLevelCardData({
  Element,
  cardData,
  downloadCompleted,
  images,
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
