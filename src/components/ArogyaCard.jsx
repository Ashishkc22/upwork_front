import React, { useRef } from "react";
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
  // var node = document.getElementById(cardData._id);
  // const offsetHeight = node?.offsetWidth;
  // const offsetWidth = node?.offsetWidth;

  // console.log("offsetHeight", offsetHeight);
  // console.log("node", node);
  // calculate age
  function calculateAge({ row, keymap, birthYear }) {
    const currentYear = new Date().getFullYear(); // Get the current year
    const birthYearNumber = parseInt(birthYear, 10); // Convert birth year to a number
    return birthYearNumber ? currentYear - birthYearNumber : null; // Calculate and return age, or null if birth year is invalid
  }

  // const scale = 2;
  // domtoimage
  // .toPng(node, {
  // height: offsetHeight * scale,
  // style: {
  // transform: `scale(${scale}) translate(${offsetWidth / 2 / scale}px, ${
  // offsetHeight / 2 / scale
  // }px)`,
  // },
  // width: offsetWidth * scale,
  // })
  // .then((dataUrl) => {
  // const doc = new jsPDF("p", "mm", "letter");
  // var width = doc.internal.pageSize.getWidth() * 0.4;
  // var height = doc.internal.pageSize.getHeight() * 0.3;
  // doc.addImage(dataUrl, "PNG", 10, 0, width, height);
  // doc.save("pdfDocument.pdf");
  // })
  // .catch((error) => {
  // console.error("oops, something went wrong!", error);
  // });

  return (
    <div
      id={cardData._id}
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
          {/* <img src="/cardImages/arlogoLight.png" alt="logo" />
           */}
          <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAeCAYAAAA2Lt7lAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAIRSURBVHgB7VPNSxtBFH9vs7q7KSmh9IMUqSn0UApC6aHWnkJ77bmU9lQKLaGH2q800lLS9lA/EQUxQfADRETEP0BUAh707FnwAyF+R0VNNLszzqzZZIOzRu/7O8x78+a99/vNYwbAhQsXyJfdrkf3VFmRL1Jwe0sRxiUEfaMhOS8kyCaeLDA3COXUIPbfSWvXWdULh4QUUDqSkQ//7n2Z2TaJ4RIgBvkjy0dfGUFGmEBpgK2fNN077Y+F/DxkjkX9MHtXlJ9N1LGbQdCsBUho4dnF/JHXnhdofVatGxiSkLawa9xgoQeVmlTPbMzxBpn407dWc0TYAUIbnXJT36aWNn5MDrCB/C8EEV5x40iASH/btp029Y6gQCuK/dEco/DlZHrq3gE5VQ9IV46Nwy44B9eaQlWy5HnJ3AY+y9MyHBISbHXWXkUCv2yhZl94bl3U+GbT80E2vjd5+UUQ6FiNTrRw98yIrmjIC4L57aKSU/vAAZQYsZI9xTFAo2YtOllvxUoI0u0P/UAwYgu14cfkvhMB/1gINF5ohvTx0QGs2HNKCDRNeV2iPqXEoQwoys3MZE0foEr14mchwX5P7S1AKVIshH8YS+rlCNa+j/O/MlqoAykSaA3dP0NQQTxhZqot9dr7mV64II4J/mTqLTEqIZ5u66zwinJ6Lk4IGea+r9K3CZdAOjqxzFTXgAsXLoQ4AaqmomXW42E6AAAAAElFTkSuQmCC" />
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
            {/* <img
              src="/cardImages/supportSmall.png"
              width="30px"
              alt="support-icon"
            /> */}
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAMAAAC7IEhfAAAAV1BMVEVHcExWVWlaWW1PTmNPTmNPTmNPTmNhYHNvbn9PTmNQT2RcXG9UU2hWVWpSUWVXVmpRUGVVVWlXVmpYV2tUU2dRUGVXVmpTUmdTUmZSUWZXVmpRUGVOTWK6xRS/AAAAHHRSTlMAXybq++D3Dgbx1hZUHrx0y2pLQ4ikL32dlDixMiTPfAAAAfZJREFUOMvNVNuypCAMlJsCIoLcvOT/v3MRHGc8Oqf2Zau2H6Y00yZNJ6Rp/jG6ONnkfbIq9t9ZfPWGwAEhl6l75q1BANHLiJRC46IZUD09pbMEzIg573GMuOd8QJoKf0vKEyVj18SkJRGCMO0d50hC+Mm0VLoGz6fELHLLAQ0Lv+ojxDWThAuIbbCh6FI4wNhMBH6gzUFhPn1ahemwhBvE1MzwmdLnhDM8wHSObm+VnRFxLYWpphciRZ1h+CRiYjp/1ArXlJrP8Lbd0dCbEpd9Hy45CR6zrBcU+ChKfMk6bDnVi47yn2+3wY8lyuL+OqCNCZ82todmu39d0W/QtkXhywmOrdp/sp5WgIxHeDmqSJUppxMlRfVM14b31Wljh6ZBus4Ltzrt30xFqlgLcShaytn2R7XHIoHWncTyeCVKoC9iSfNELCZMYax6VEB7afVJPDSGp+tRXWurRr4d/X8g1obKob5Fsxdo0Z1XVFGmTscnhDSQsY5ohwd+tkxapPDlY5V7Y5LDvTKEhVorT0q67wid73zbEimO4chIIPFdjxPUu3He3kQlwD5ZkcpQ8LO0Y/dbXYvPIFJ3HgYx0MOXVZZnZVvrifHSgsZfl17KayqgNaolr6h5+GU/Op1dEiI3wCD++yadZsOYDKj/i607DH3zP+EP/z42JH14Mu8AAAAASUVORK5CYII=" />
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
                alt="loc"
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
