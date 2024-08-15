import domtoimage from "dom-to-image";
import jsPDF from "jspdf";
import { createRoot } from "react-dom/client";
import ReactDOM from "react-dom";

async function downloadSingleCard({ Element, cardData }) {
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
      await new Promise((resolve) => setTimeout(resolve, 200));
      var node = document.getElementById(cardData._id);
      const nodeHeight = node.offsetHeight;
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

      const doc = new jsPDF("p", "mm", "letter");

      var width = doc.internal.pageSize.getWidth() * 0.4;
      var height = doc.internal.pageSize.getHeight() * 0.3;

      doc.addImage(dataUrl, "PNG", 10, 10, width, height); // Adjust position and size as needed

      doc.save("pdfDocument.pdf");
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

function getImageData({ Element, cardData = [] }) {
  return new Promise((myResolve, myReject) => {
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
        root.render(<Element cardData={cardData[i]} />);

        const observer = new MutationObserver(async (mutationsList) => {
          // If any mutations are observed, assume rendering is complete
          observer.disconnect(); // Stop observing once rendering is detected
          // Wait for the component to be rendered'
          await new Promise((resolve) => setTimeout(resolve, 200));

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
            console.log("elementData", elementData);

            return myResolve(elementData);
          }
        });
        // Start observing the container for changes
        observer.observe(container, { childList: true, subtree: true });
      }
    } catch (error) {
      console.log("error", error);
      myReject(error);
    }
  });
}

async function downloadMultipleCard({
  Element,
  cardData,
  handleDownloadCompleted,
}) {
  const doc = new jsPDF("p", "mm", "letter");
  const width = doc.internal.pageSize.getWidth() * 0.4;
  const height = doc.internal.pageSize.getHeight() * 0.3;
  let xposition = 10;
  let yposition = 0;
  let count = 0;
  const imageData = (await getImageData({ Element, cardData })) || [];

  imageData.forEach((dataUrl, index) => {
    doc.addImage(dataUrl, "PNG", xposition, yposition, width, height);
    if (count == 0 || count == 1) {
      doc.setFontSize(12);
      doc.text("agent id", xposition - 3, 50, {
        angle: 90,
        rotationDirection: 1,
      });
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
    if (count == 10) {
      xposition = 10;
      yposition = 0;
      doc.addPage();
      count = 0;
    }
    console.log("index", index);

    if (index == cardData.length - 1) {
      doc.save("pdfDocument.pdf");
      handleDownloadCompleted();
    }
  });
}

async function downloadMultipleCardWithMultipleAgent({
  Element,
  cardData,
  handleDownloadCompleted = () => {},
}) {
  const doc = new jsPDF("p", "mm", "letter");
  const width = doc.internal.pageSize.getWidth() * 0.4;
  const height = doc.internal.pageSize.getHeight() * 0.3;
  let xposition = 10;
  let yposition = 0;
  let count = 0;

  const cardDataKeys = Object.keys(cardData);
  const imageData = {};
  for (let i = 0; i < cardDataKeys.length; i++) {
    const key = cardDataKeys[i];

    imageData[key] =
      (await getImageData({ Element, cardData: cardData[key] })) || [];
  }

  console.log("imageData", imageData);

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
      doc.addImage(dataUrl[j], "PNG", xposition, yposition, width, height);
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
      console.log("index", j);
    }
  }
  doc.save("pdfDocument.pdf");
  handleDownloadCompleted();
}

// {
//     "MP/Raisen/Begumganj": {
//         "FE84115": [
//             {
//                 "_id": "66891b06173e6b8a1bf1ff55",
//                 "image": "https://storage.googleapis.com/download/storage/v1/b/arogyam-super.appspot.com/o/1720261371987.png?generation=1720261381428143&alt=media",
//                 "name": "Rakesh ",
//                 "birth_year": "1993",
//                 "gender": "Male",
//                 "id_proof": {
//                     "type": "Aadhaar",
//                     "value": "798044282756"
//                 },
//                 "state": "MP",
//                 "district": "Raisen",
//                 "tehsil": "Begumganj",
//                 "area": "Umarhari Ta.Silwani ( उमरहारी ता सिलवानी ) , UMARHARI",
//                 "phone": "7843034587",
//                 "father_husband_name": "Balkishan ",
//                 "blood_group": "",
//                 "emergency_contact": "",
//                 "status": "SUBMITTED",
//                 "created_by": "66821fd6d638341accab6bf9",
//                 "created_by_uid": "FE84115",
//                 "created_at": 1720261382535,
//                 "issue_date": "06/07/2024",
//                 "unique_number": "3686029",
//                 "expiry_date": 1783333382535,
//                 "expiry_years": 2,
//                 "s_no": "5",
//                 "__v": 0
//             },
//             {
//                 "_id": "66891a77173e6b8a1bf1ff28",
//                 "image": "https://storage.googleapis.com/download/storage/v1/b/arogyam-super.appspot.com/o/1720261230218.png?generation=1720261236172443&alt=media",
//                 "name": "Arti",
//                 "birth_year": "2004",
//                 "gender": "Female",
//                 "id_proof": {
//                     "type": "Aadhaar",
//                     "value": "472027824407"
//                 },
//                 "state": "MP",
//                 "district": "Raisen",
//                 "tehsil": "Begumganj",
//                 "area": "Umarhari Ta.Silwani ( उमरहारी ता सिलवानी ) , UMARHARI",
//                 "phone": "7843034587",
//                 "father_husband_name": "Rakesh ",
//                 "blood_group": "",
//                 "emergency_contact": "",
//                 "status": "SUBMITTED",
//                 "created_by": "66821fd6d638341accab6bf9",
//                 "created_by_uid": "FE84115",
//                 "created_at": 1720261239368,
//                 "issue_date": "06/07/2024",
//                 "unique_number": "7025484",
//                 "expiry_date": 1783333239368,
//                 "expiry_years": 2,
//                 "s_no": "6",
//                 "__v": 0
//             },
//             {
//                 "_id": "6687aee504294682075de025",
//                 "image": "https://storage.googleapis.com/download/storage/v1/b/arogyam-super.appspot.com/o/1720168160975.png?generation=1720168164202462&alt=media",
//                 "name": "Amit Sahu",
//                 "birth_year": "2007",
//                 "gender": "Male",
//                 "id_proof": {
//                     "type": "Aadhaar",
//                     "value": "423219706987"
//                 },
//                 "state": "MP",
//                 "district": "Raisen",
//                 "tehsil": "Begumganj",
//                 "area": "Beelkheda Jagir ( बीलखेडा जगीर ) , BICHHUWA JAGIR",
//                 "phone": "8253085141",
//                 "father_husband_name": "RamGopal  Sahu",
//                 "blood_group": "",
//                 "emergency_contact": "",
//                 "status": "SUBMITTED",
//                 "created_by": "66821fd6d638341accab6bf9",
//                 "created_by_uid": "FE84115",
//                 "created_at": 1720168165367,
//                 "issue_date": "05/07/2024",
//                 "unique_number": "4254822",
//                 "expiry_date": 1783240165367,
//                 "expiry_years": 2,
//                 "s_no": "4",
//                 "__v": 0
//             },
//             {
//                 "_id": "66865c0909765c5dd677056c",
//                 "image": "https://storage.googleapis.com/download/storage/v1/b/arogyam-super.appspot.com/o/1720081414050.png?generation=1720081416920654&alt=media",
//                 "name": "Krishn Kumar",
//                 "birth_year": "2000",
//                 "gender": "Male",
//                 "id_proof": {
//                     "type": "Aadhaar",
//                     "value": "975604815015"
//                 },
//                 "state": "MP",
//                 "district": "Raisen",
//                 "tehsil": "Begumganj",
//                 "area": "Bichhuwa Jagir ( बिछुआ जागीर ) , BICHHUWA JAGIR",
//                 "phone": "6260859884",
//                 "father_husband_name": "Ramesh Singh ",
//                 "blood_group": "",
//                 "emergency_contact": "",
//                 "status": "SUBMITTED",
//                 "created_by": "66821fd6d638341accab6bf9",
//                 "created_by_uid": "FE84115",
//                 "created_at": 1720081417988,
//                 "issue_date": "04/07/2024",
//                 "unique_number": "4649189",
//                 "expiry_date": 1783153417988,
//                 "expiry_years": 2,
//                 "s_no": "3",
//                 "__v": 0
//             }
//         ]
//     },
//     "MP/Raisen/Gairatganj": {}
// }

async function downloadMultipleLevelCardData({
  Element,
  cardData,
  downloadCompleted,
}) {
  try {
    const groupNamekeys = Object.keys(cardData);
    for (let i = 0; i < groupNamekeys.length; i++) {
      //   console.log("data", cardData[groupNamekeys[i]]);
      await downloadMultipleCardWithMultipleAgent({
        Element,
        cardData: cardData[groupNamekeys[i]],
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
