import React, { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./ArogyaCard.css";
import domtoimage from "dom-to-image";
import Barcode from "react-barcode";
import clsx from "clsx";

const BarcodeComponent = ({
  value,
  format = "CODE128",
  width = 1.3,
  height = 20,
  displayValue = false,
}) => {
  return (
    <div style={{ textAlign: "center" }}>
      <Barcode
        value={value}
        format={format}
        width={width}
        height={height}
        displayValue={displayValue}
        background="#fff"
        lineColor="#000"
      />
    </div>
  );
};

const ArogyamComponent = ({
  cardData,
  showCardTag = false,
  isPrint = false,
  enableClick = false,
  handleClick,
}) => {
  const cardRef = useRef();
  //   dom to img
  var node = document.getElementById("container");
  const offsetHeight = node?.offsetWidth;
  const offsetWidth = node?.offsetWidth;
  // calculate age
  function calculateAge({ row, keymap, birthYear }) {
    const currentYear = new Date().getFullYear(); // Get the current year
    const birthYearNumber = parseInt(birthYear, 10); // Convert birth year to a number
    return birthYearNumber ? currentYear - birthYearNumber : null; // Calculate and return age, or null if birth year is invalid
  }

  const scale = 2;
  domtoimage
    .toPng(node, {
      height: offsetHeight * scale,
      style: {
        transform: `scale(${scale}) translate(${offsetWidth / 2 / scale}px, ${
          offsetHeight / 2 / scale
        }px)`,
      },
      width: offsetWidth * scale,
    })
    .then((dataUrl) => {
      const doc = new jsPDF("p", "mm", "letter");
      var width = doc.internal.pageSize.getWidth() * 0.4;
      var height = doc.internal.pageSize.getHeight() * 0.3;
      doc.addImage(dataUrl, "PNG", 10, 0, width, height);
      //   doc.save("pdfDocument.pdf");
    })
    .catch((error) => {
      console.error("oops, something went wrong!", error);
    });

  return (
    <div
      id="container"
      className={clsx(enableClick && "cursor")}
      style={{
        display: "inline-flex",
      }}
      onClick={() => {
        if (enableClick) {
          handleClick(cardData);
        }
      }}
    >
      {showCardTag && (
        <p
          style={{
            fontSize: "large",
            fontWeight: "600",
            textAlign: "center",
            writingMode: "vertical-lr",
            textOrientation: "mixed",
            transform: "rotate(181deg)",
            margin: 0,
          }}
        >
          agentId name value
        </p>
      )}
      <div
        ref={cardRef}
        style={{
          minWidth: "470px",
          maxWidth: "470px",
          minHeight: "295px",
          maxHeight: "305px",
          margin: 2,
          position: "relative",
          height: "239px",
          overflow: "hidden",
          "-ms-overflow-style": "none",
          scrollbarWidth: "none",
          "border-style": "solid",
          "border-width": "1px",
          "border-color": "whitesmoke",
        }}
      >
        <div className="circle-container">
          <img src="/cardImages/arlogo.png" alt="arlogo" />
        </div>
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            background: "#fda330",
            clipPath: "ellipse(35% 33% at 93% 1%)",
          }}
        />
        <h6
          style={{
            position: "absolute",
            right: "41px",
            top: "30px",
            fontSize: "26px",
            color: "#cc0000",
            fontWeight: "500",
            lineHeight: 1,
            margin: "0px",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          आरोग्यम्
        </h6>
        <p
          style={{
            position: "absolute",
            right: "15px",
            top: "33px",
            fontSize: "13px",
            color: "#779538",
            fontWeight: "500",
            lineHeight: 1,
            fontFamily: "Poppins, sans-serif",
          }}
        >
          TM
        </p>
        <div>
          <p
            style={{
              position: "absolute",
              right: "50px",
              top: "65px",
              fontSize: "15px",
              color: "#ffffff",
              fontWeight: "500",
              lineHeight: 1,
              fontFamily: "Poppins, sans-serif",
              margin: "0px",
            }}
          >
            हेल्थ कार्ड
          </p>
        </div>
        <div
          style={{
            display: "flex",
            marginRight: "24px",
            marginLeft: "17px",
            marginTop: "22px",
            marginBottom: "12px",
          }}
        >
          <div style={{ alignContent: "center", marginRight: "5px" }}>
            <img src="/cardImages/support.png" width="30px" alt="" />
          </div>
          <div>
            <p
              style={{
                fontSize: "x-small",
                width: "50px",
                display: "block",
                minWidth: "139px",
                textAlign: "center",
                margin: 0,
              }}
            >
              कोई भी जानकारी, सलाह या समस्या
            </p>
            <p
              style={{
                fontSize: "x-small",
                width: "50px",
                display: "block",
                minWidth: "126px",
                textAlign: "center",
                margin: 0,
              }}
            >
              के लिए नि:शुल्क संपर्क करे
            </p>
            <p
              style={{
                color: "blue",
                width: "119px",
                fontWeight: 600,
                textAlign: "center",
                margin: 0,
              }}
            >
              81818 19718
            </p>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "start",
            alignItems: "center",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "x-small",
                textAlign: "center",
                writingMode: "vertical-lr",
                textOrientation: "mixed",
                transform: "rotate(181deg)",
                margin: 0,
                marginLeft: "5px",
              }}
            >
              Issued on: {cardData.issue_date} {isPrint && "000"}
            </p>
          </div>
          <div
            style={{
              marginRight: "10px",
              marginLeft: "6px",
            }}
          >
            <img
              src={cardData.image}
              style={{ borderRadius: "20px" }}
              width="100px"
              height="121px"
              alt="Profile-img"
            />
          </div>
          <div
            style={{
              marginRight: "10px",
              marginLeft: "10px",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "x-small",
                  padding: 0,
                  margin: 0,
                  marginBottom: "2px",
                  color: "#00000070",
                }}
              >
                Name
              </p>
            </div>
            <div>
              <p
                style={{
                  fontSize: "x-small",
                  padding: 0,
                  margin: 0,
                  marginTop: "2px",
                  marginBottom: "2px",
                }}
              >
                {cardData.name}
              </p>
            </div>
            <div>
              <p
                style={{
                  fontSize: "x-small",
                  padding: 0,
                  margin: 0,
                  marginTop: "2px",
                  marginBottom: "2px",
                  color: "#00000070",
                }}
              >
                Father/Husband
              </p>
            </div>
            <div>
              <p
                style={{
                  fontSize: "x-small",
                  padding: 0,
                  margin: 0,
                  mx: "2px",
                }}
              >
                {cardData.father_husband_name}
              </p>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: "2px",
              }}
            >
              <img
                width="15px"
                height="16px"
                src="/cardImages/call.png"
                style={{ marginRight: "2px" }}
                alt="Phone-icon"
              />
              <p
                style={{
                  fontSize: "x-small",
                  padding: 0,
                  margin: 0,
                  marginTop: "2px",
                  marginBottom: "2px",
                  alignItems: "center",
                }}
              >
                {cardData.phone}
              </p>
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              <img
                width="15px"
                height="16px"
                src="/cardImages/loc.png"
                alt=""
                style={{ marginRight: "3px" }}
              />
              <p
                style={{
                  fontSize: "x-small",
                  padding: 0,
                  margin: 0,
                  marginTop: "2px",
                  marginBottom: "2px",
                  alignContent: "center",
                  maxWidth: "182px",
                }}
              >
                {`${cardData?.area || ""} ${cardData?.state || ""}`}
              </p>
            </div>
          </div>
          <div>
            <div>
              <p
                style={{
                  fontSize: "x-small",
                  padding: 0,
                  margin: 0,
                  marginTop: "2px",
                  marginBottom: "2px",
                  color: "#00000070",
                }}
              >
                Gender
              </p>
            </div>
            <div>
              <p
                style={{
                  fontSize: "x-small",
                  padding: 0,
                  margin: 0,
                  marginTop: "2px",
                  marginBottom: "2px",
                }}
              >
                {`${cardData.gender || ""}/${
                  cardData?.birth_year &&
                  calculateAge({ birthYear: cardData?.birth_year }) + "Yrs"
                }`}
              </p>
            </div>
          </div>
        </div>
        {cardData?.unique_number && (
          <div
            style={{
              display: "flex",
              flexDirection: "row-reverse",
              marginRight: "20%",
            }}
          >
            <p style={{ margin: "0px" }}>{cardData.unique_number}</p>
          </div>
        )}
        {cardData?.unique_number && (
          <div
            style={{
              display: "flex",
              flexDirection: "row-reverse",
              marginRight: "10%",
            }}
          >
            <BarcodeComponent value={cardData.unique_number} />
          </div>
        )}
        <div
          style={{
            flexGrow: 1,
            width: "100%",
            background: "green",
            position: "absolute",
            bottom: "0px",
            textAlign: "center",
            fontWeight: "600",
            color: "white",
            padding: "4px 0",
            fontSize: "12px",
          }}
        >
          || खुश है वही जिसने पाया, स्वस्थ मन और निरोगी काया ||
        </div>
      </div>
    </div>
  );
};

export default ArogyamComponent;
