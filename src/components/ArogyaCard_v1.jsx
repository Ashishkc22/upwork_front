import "./ArogyaCard_v1.css";
import moment from "moment";
import React, { useEffect } from "react";
import clsx from "clsx";
import { useRef } from "react";

const ArogyamComponent = ({
  cardData,
  showCardTag = false,
  isPrint = false,
  enableClick = false,
  handleClick,
  images,
  passRef,
}) => {
  function calculateAge({ row, keymap, birthYear }) {
    const currentYear = new Date().getFullYear(); // Get the current year
    const birthYearNumber = parseInt(birthYear, 10); // Convert birth year to a number
    return birthYearNumber ? currentYear - birthYearNumber : null; // Calculate and return age, or null if birth year is invalid
  }
  const divRef = useRef(null);
  console.log("date", cardData.issue_date);

  function formatNumberWithSpaces(number = 0) {
    // Convert the number to a string
    const numberStr = number.toString();
    const formattedStr = numberStr.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1 ");

    return formattedStr;
  }

  useEffect(() => {
    if (divRef.current && passRef) {
      passRef(divRef.current);
    }
  }, [divRef]);

  return (
    <div
      ref={divRef}
      className={"card-container " + clsx(enableClick && "cursor")}
      id={cardData._id}
      onClick={() => {
        if (enableClick) {
          handleClick(cardData);
        }
      }}
    >
      <div className="header-container">
        <div className="support-header">
          <div>{images.Support && images.Support}</div>
          <div className="header-text">
            <div>कोई भी जानकारी, सलाह या</div>
            <div>समस्या के लिए संपर्क करें ।</div>
            <div className="header-phone">81 81 81 9718</div>
          </div>
        </div>
        <div className="clip-path-container">
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              background: "#fda330",
              clipPath: "ellipse(61% 92% at 73% 7%)",
              zIndex: 1,
            }}
          ></div>
          <div className="text-in-fill">आरोग्यम् भारत</div>
          <div className="text-in-fill-sub">हेल्थ कार्ड</div>
          <div className="circle-container">
            {/* <img src="./cardLogo.png" alt="Card Logo" /> */}
            {images.LogoImage && images.LogoImage}
          </div>
        </div>
      </div>
      <div className="user-details-container">
        <div style={{ display: "flex" }}>
          <div className="vertical-text">
            Issued on :{" "}
            {moment(cardData.issue_date, "DD/MM/YYYY").format("MMM/YYYY")}
          </div>
          <img
            src={cardData.image}
            alt="Profile"
            style={{
              width: "105px",
              height: "125px",
              position: "relative",
              right: "184px",
              top: "6px",
            }}
          />
          <div className="text-container">
            <div className="text-group">
              <div style={{ color: "#666666", fontSize: "9px" }}>Name</div>
              <div>{cardData.name}</div>
            </div>
            <div className="text-group">
              <div style={{ color: "#666666", fontSize: "9px" }}>
                Father/Husband
              </div>
              <div> {cardData.father_husband_name}</div>
            </div>
          </div>
          <div className="contact-container">
            <div
              style={{
                display: "inline-flex",
                marginTop: "3px",
                width: "90px",
                "align-items": "center",
              }}
            >
              {/* <img
                src="./phone.png"
                alt="Phone"
                style={{ width: "10px", height: "10px", marginRight: "9px" }}
              /> */}
              {images.Phone && images.Phone}
              <span style={{ fontSize: "11px", fontWeight: 500 }}>
                {cardData.phone}
              </span>
            </div>
            <div
              style={{
                display: "inline-flex",
                marginTop: "5px",
                fontSize: "9px",
                fontWeight: 500,
                color: "black",
              }}
            >
              {/* <img
                src="./loc.png"
                alt="Location"
                style={{ width: "10px", height: "10px", marginRight: "9px" }}
              /> */}
              {images.Loc && images.Loc}

              <span>{`${cardData?.area || ""} ${cardData?.state || ""}`}</span>
            </div>
          </div>
          <div className="water-mark">
            <div
              style={{
                display: "inline-flex",
                marginTop: "3px",
                right: "27px",
                top: "24px",
                position: "relative",
              }}
            >
              <div className="text-group">
                <div style={{ color: "#666666", fontSize: "9px" }}>Gender</div>
                <div style={{ fontSize: "11px", color: "Black" }}>{`${
                  cardData.gender || ""
                }/${
                  cardData?.birth_year &&
                  calculateAge({ birthYear: cardData?.birth_year }) + "Yrs"
                }`}</div>
              </div>
            </div>
            <div style={{ position: "relative", right: "15px" }}>
              {/* <img
                src="waterMark.png"
                alt="Watermark"
                style={{
                  width: "118px",
                  right: "29px",
                  position: "relative",
                  bottom: "47px",
                }}
              /> */}
              {images.WaterMark && images.WaterMark}
            </div>
            <div
              style={{
                position: "absolute",
                right: "10px",
                top: "102px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "Inter",
                  fontSize: "11px",
                  fontWeight: "600",
                  position: "relative",
                  top: "9px",
                }}
              >
                {formatNumberWithSpaces(cardData.unique_number)}
              </div>
              <div>
                <span className="barcode">{cardData.unique_number}</span>
                <div className="opp_vertical-text">{cardData.s_no}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="footer">
        ।। खुश है वही जिसने पाया, स्वस्थ मन और निरोगी काया ।।
      </div>
    </div>
  );
};

export default ArogyamComponent;
