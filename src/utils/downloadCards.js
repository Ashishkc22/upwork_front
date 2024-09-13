import domtoimage from "dom-to-image-more";
import jsPDF from "jspdf";
import { createRoot } from "react-dom/client";
import ReactDOM from "react-dom";
import moment from "moment";

// images: {
//   SupportImage: <SupportImage />,
//   LogoImage: <LogoImage />,
// }

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
          <Element
            isPrint={true}
            showCardTag
            cardData={cardData[i]}
            images={images}
          />
        );
        console.time("exampleFunctionTime", cardData[i]._id);
        const observer = new MutationObserver(async (mutationsList) => {
          // If any mutations are observed, assume rendering is complete
          observer.disconnect(); // Stop observing once rendering is detected
          // Wait for the component to be rendered'
          await new Promise((resolve) => setTimeout(resolve, 500));

          var node = document.getElementById(`${cardData[i]._id}-download`);
          const offsetHeight = node?.offsetHeight;
          const offsetWidth = node?.offsetWidth;
          const scale = 2;
          // Convert the container to an image
          const dataUrl = await domtoimage.toJpeg(node, {
            height: offsetHeight * scale,
            style: {
              transform: `scale(${scale}) translate(${
                offsetWidth / 2 / scale
              }px, ${offsetHeight / 2 / scale}px)`,
            },
            width: offsetWidth * scale,
            copyDefaultStyles: true,
          });

          elementData[i] = dataUrl;
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

async function downloadMultipleCard({
  Element,
  cardData,
  handleDownloadCompleted,
  images,
  agentDetails,
  tlDetails,
  secondaryImage,
}) {
  const imageBackSideUrl = getImageDataURLFromRef(secondaryImage);

  const doc = new jsPDF("p", "mm", "", true);
  const width = 87.6;
  const height = 57.6;
  let xposition = 10;
  let yposition = 5;
  let count = 0;
  const cardCount = cardData.length;
  const imageData = (await getImageData({ Element, cardData, images })) || [];

  let pageCardLimit = 9;

  createAFENameTLName({
    doc,
    feName: agentDetails?.name,
    tlName: tlDetails?.name,
    count: cardCount,
    startX: xposition,
    startY: yposition,
  });
  xposition = xposition === 10 ? 113 : 10;
  count += 1;

  imageData.forEach((dataUrl, index) => {
    // ADD IMAGE
    doc.addImage(
      dataUrl,
      "JPEG",
      xposition,
      yposition,
      width,
      height,
      "",
      "MEDIUM"
    );

    // doc.rect(xposition - 3, yposition, 85.6, 54);

    // ADD CARD COUNT TEXT
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`${index + 1}`, xposition + 90, yposition + 30, {
      angle: 90,
      rotationDirection: 1,
    });

    if (xposition === 113) {
      yposition = yposition + 57;
    }
    if (index === imageData.length - 1) {
      console.log("imageData.length", imageData.length);
      console.log("count", count);
      console.log("index", index);

      let skipBackSide = [count];
      if (index < 9) {
        skipBackSide.push(1);
      }
      addBackSideImage({
        doc,
        imgUrl: imageBackSideUrl,
        count: count + 2,
        skipBackSide,
      });
    }
    // ADD NEW PAGE
    if (count === 9) {
      addBackSideImage({
        doc,
        imgUrl: imageBackSideUrl,
        count: count + 2,
        ...(pageCardLimit === 9 && { skipBackSide: [1] }),
      });
      xposition = 10;
      yposition = 5;
      doc.addPage();
      count = 0;
      pageCardLimit = 10;
    } else {
      count += 1;
      xposition = xposition === 10 ? 113 : 10;
    }

    if (index == cardData.length - 1) {
      doc.save(
        `${tlDetails.name.replaceAll(" ", "_")}_${
          agentDetails?.name
            ? agentDetails.name.replaceAll(" ", "_")
            : agentDetails.id
        }#${cardCount}_${moment().format("DD_MMM_YYYY_HH_MM")}.pdf`
      );
      // preview({ pdfBlob: doc.output("blob") });
      handleDownloadCompleted();
    }
  });
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
  let xposition = 10;
  let yposition = 5;
  const imageDataKeys = Object.keys(imageData);
  let skipBackSide = [];
  for (let i = 0; i < imageDataKeys.length; i++) {
    const agentIdAndKey = imageDataKeys[i];
    const dataUrl = imageData[agentIdAndKey].url;
    const feDetails = imageData[agentIdAndKey].feDetails;
    const [tlDetails] = imageData[agentIdAndKey]?.tlDetails || [];

    let pageCardLimit = 9;

    console.log("xposition", xposition);
    console.log("xposition", yposition);
    console.log("xposition count text", xposition + 95);
    console.log("xposition count text", yposition + 35);
    console.log("i -----------------------------", i);
    console.log("pageCardLimit -----------------------------", pageCardLimit);
    console.log("count -----------------------------", count);
    totalCardCount += dataUrl.length;
    debugger;
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
        skipBackSide.push(xposition === 10 ? count + 1 : count - 1);
        if (count === 9) {
          xposition = 10;
          yposition = 5;
          count = 0;
          doc.addPage();
        } else {
          if (xposition === 113) {
            yposition = yposition + 57;
          }
          xposition = xposition === 10 ? 113 : 10;
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
        debugger;
        console.log("adding back side", skipBackSide);
        console.log("count", count);
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
        xposition = 10;
        yposition = 5;
        console.log("&& i != imageDataKeys.length - 1", imageDataKeys.length);
        console.log("j", j);
        console.log("i", i);
        if (j + 1 < dataUrl.length || i + 1 < imageDataKeys.length) {
          doc.addPage();
        }
        count = 0;
        pageCardLimit = 10;
      } else {
        count += 1;
        xposition = xposition === 10 ? 113 : 10;
      }
    }
  }
  doc.save(
    `${districtName?.trim()}#${totalCardCount}_${moment().format(
      "DD_MMM_YYYY_HH_MM"
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
