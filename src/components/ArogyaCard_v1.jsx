import "./ArogyaCard_v1.css";
import moment from "moment";
import React from "react";
import clsx from "clsx";

const ArogyamComponent = ({
  cardData,
  showCardTag = false,
  isPrint = false,
  enableClick = false,
  handleClick,
  images,
}) => {
  function calculateAge({ row, keymap, birthYear }) {
    const currentYear = new Date().getFullYear(); // Get the current year
    const birthYearNumber = parseInt(birthYear, 10); // Convert birth year to a number
    return birthYearNumber ? currentYear - birthYearNumber : null; // Calculate and return age, or null if birth year is invalid
  }

  return (
    // <div>
    <div
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
          <div>
            {images.Support && images.Support}
            {/* <svg
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              width="54px"
              height="54px"
              viewBox="0 0 35 27"
              fill="none"
            >
              <rect
                x="0.125"
                y="0.5"
                width="34"
                height="26.2727"
                fill="url(#pattern0_149_24)"
                fill-opacity="0.4"
              />
              <defs>
                <pattern
                  id="pattern0_149_24"
                  patternContentUnits="objectBoundingBox"
                  width="1"
                  height="1"
                >
                  <use
                    xlinkHref="#image0_149_24"
                    transform="matrix(0.00150923 0 0 0.00195312 0.113636 0)"
                  />
                </pattern>
                <image
                  id="image0_149_24"
                  width="512"
                  height="512"
                  xlinkHref="data:image/png;base64,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"
                />
              </defs>
            </svg> */}
          </div>
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
            Issued on : {moment(cardData.issue_date).format("MMM / YYYY")}
          </div>
          <img
            src={cardData.image}
            alt="Profile"
            style={{
              width: "105px",
              height: "125px",
              position: "relative",
              right: "184px",
              top: "19px",
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
              }}
            >
              {/* <img
                src="./phone.png"
                alt="Phone"
                style={{ width: "10px", height: "10px", marginRight: "9px" }}
              /> */}
              {images.Phone && images.Phone}
              <span style={{ fontSize: "9px" }}>{cardData.phone}</span>
            </div>
            <div
              style={{
                display: "inline-flex",
                marginTop: "5px",
                fontSize: "6px",
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
                <div style={{ fontSize: "9px" }}>{`${cardData.gender || ""}/${
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
                right: "43px",
                bottom: "10px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "8px", fontWeight: "600" }}>
                {cardData.unique_number}
              </div>
              <div>
                <span className="barcode">{cardData.unique_number}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="footer">
        ।। खुश है वही जिसने पाया, स्वस्थ मन और निरोगी काया ।।
      </div>
    </div>
    // </div>
  );
};

export default ArogyamComponent;
