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

      doc.addImage(dataUrl, "PNG", 10, 10, width, height, "", "MEDIUM"); // Adjust position and size as needed
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
              ? cardData.create_by_name
              : cardData.created_by_uid
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
    if (count == 0 || count == 1) {
      doc.setFontSize(12);
      doc.text(
        `${
          agentDetails?.name ? agentDetails.name : agentDetails.id
        }_${pageCount}/${cardCount}`,
        xposition - 3,
        50,
        {
          angle: 90,
          rotationDirection: 1,
        }
      );
    }
    count += 1;
    if (xposition == 10 && yposition == 0) {
      xposition = 120;
    } else {
      if (xposition == 120) {
        xposition = 10;
        yposition = yposition + 53;
      } else if (xposition == 10) {
        xposition = 120;
      }
    }
    if (count == 10 && index != cardData.length - 1) {
      xposition = 10;
      yposition = 0;
      doc.addPage();
      pageCount += 1;
      count = 0;
    }

    if (index == cardData.length - 1) {
      doc.save(
        `${
          agentDetails?.name ? agentDetails.name : agentDetails.id
        }#${cardCount}_${moment().format("DD_MMM_YYYY_HH_MM")}.pdf`
      );
      handleDownloadCompleted();
    }
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

  const cardDataKeys = Object.keys(cardData);

  const imageData = {};
  for (let i = 0; i < cardDataKeys.length; i++) {
    const key = cardDataKeys[i];

    imageData[key] =
      (await getImageData({ Element, cardData: cardData[key], images })) || [];
    cardCount += imageData[key].length;
  }

  const imageDataKeys = Object.keys(imageData);

  for (let i = 0; i < imageDataKeys.length; i++) {
    const agentIdAndKey = imageDataKeys[i];
    const dataUrl = imageData[agentIdAndKey];
    xposition = 10;
    yposition = 0;
    count = 0;
    if (i != 0 && imageDataKeys.length > 1) {
      doc.addPage();
    }
    for (let j = 0; j < dataUrl.length; j++) {
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
      // adding text
      if (count == 0 || count == 1) {
        doc.setFontSize(12);
        doc.text(`#${agentIdAndKey}`, xposition - 3, 50, {
          angle: 90,
          rotationDirection: 1,
        });
      }

      if (xposition == 10 && yposition == 0) {
        xposition = 120;
      } else {
        if (xposition == 120) {
          xposition = 10;
          yposition = yposition + 53;
        } else if (xposition == 10) {
          xposition = 120;
        }
      }
      count += 1;
      if (count == 10 && j < dataUrl.length - 1) {
        xposition = 10;
        yposition = 0;
        doc.addPage();
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
