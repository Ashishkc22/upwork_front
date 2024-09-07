import "./ArogyaCard_v2.css";
import moment from "moment";
import React, { useEffect } from "react";
import clsx from "clsx";
import { useRef } from "react";
import { DrawBarcode_Code39 } from "../utils/barcode.util";

const ArogyamComponent = ({
  cardData,
  showCardTag = false,
  isPrint = false,
  enableClick = false,
  handleClick,
  images,
  passRef,
  style,
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

  function limitCharacters(text, maxLength) {
    // Check if the text length exceeds the maximum length
    if (text.length > maxLength) {
      // Truncate the text and append ellipsis
      return text.slice(0, maxLength);
    }

    // Return the text as is if it doesn't exceed the maximum length
    return text;
  }

  useEffect(() => {
    if (divRef.current && passRef) {
      passRef(divRef.current);
    }
  }, [divRef]);

  const getGramAddress = (address = "") => {
    return address?.split(",")?.[0] || "";
  };

  return (
    <div
      id={isPrint ? `${cardData._id}-download` : cardData._id}
      ref={divRef}
      className="wrapper"
    >
      <div
        style={{ ...(style && style) }}
        className={"card-container " + clsx(enableClick && "cursor")}
        onClick={() => {
          if (enableClick) {
            handleClick(cardData);
          }
        }}
      >
        <div className="support-header">
          <img
            id={`${cardData._id}-support`}
            src={images?.support || "/v1cardImages/support.png"}
            alt="support"
            style={{ width: "54px", height: "54px" }}
            className="support-image"
          />
          <div className="header-text">
            <div>कोई भी जानकारी, सलाह या</div>
            <div>समस्या के लिए संपर्क करें ।</div>
            <div className="header-phone">81 81 81 9718</div>
          </div>
        </div>

        {/* logo */}
        <div>
          <div className="clip-path-container">
            {/* printMode */}
            {isPrint && (
              <div
                style={{
                  position: "absolute",
                  width: "92.7%",
                  height: "114%",
                  background: "rgb(253, 163, 48)",
                  clipPath: "ellipse(70.6% 95% at 70% -1%)",
                  top: "-10px",
                  left: "26.8px",
                }}
              ></div>
            )}

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
              <img
                id={`${cardData._id}-logo`}
                src={images?.logo || "/v1cardImages/cardLogo.png"}
                alt="Card Logo"
              />
            </div>
            {/* <img
            id={`${cardData._id}-logo`}
            src={images?.logo || "/v1cardImages/cardLogo.png"}
            alt="Card Logo"
            style={{
              width: "26px",
              position: "absolute",
              right: "166px",
              top: "42px",
              zIndex: "1",
            }}
          /> */}
          </div>
        </div>

        {/* User details and issue date */}

        <div className="vertical-text">
          Issued on :{" "}
          {moment(cardData.issue_date, "DD/MM/YYYY").format("MMM/YY")}
        </div>
        <img
          id={`${cardData._id}-profile`}
          src={cardData?.image}
          alt="Profile"
          className="profile-image"
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

        {/* Contact */}

        <div className="contact-container">
          <div
            style={{
              display: "inline-flex",
              // marginTop: "3px",
              width: "90px",
              "align-items": "center",
            }}
          >
            <img
              id={`${cardData._id}-phone-1`}
              src={images?.phone || "/v1cardImages/phone.png"}
              alt="Phone"
              style={{ width: "10px", height: "10px", marginRight: "9px" }}
            />
            <span
              style={{
                fontSize: "11px",
                fontWeight: 500,
                position: "absolute",
                left: "19px",
              }}
            >
              {cardData.phone}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              // marginTop: "5px",
              // fontSize: "10px",
              fontWeight: 500,
              color: "black",
            }}
          >
            <img
              id={`${cardData._id}-loc`}
              src={images?.loc || "/v1cardImages/loc.png"}
              alt="Location"
              style={{ width: "10px", height: "10px", marginRight: "9px" }}
            />

            <div className="user-loc">
              {`${getGramAddress(cardData?.area)}, ${cardData?.tehsil}`}
            </div>
            <div className="user-loc-2">
              {`${cardData?.district}, ${cardData?.state}`}
            </div>
          </div>
        </div>

        <div className="water-mark">
          <img
            id={`${cardData._id}-waterMark`}
            src={images?.waterMark || "/v1cardImages/waterMark.png"}
            alt="Watermark"
            style={{
              width: "118px",
              right: "29px",
              "z-index": 0,
            }}
          />
        </div>

        <div className="gender-blood-info">
          <div className="gender-text-group">
            <div style={{ color: "#666666", fontSize: "9px" }}>Gender</div>
            <div style={{ fontSize: "11px", color: "Black" }}>{`${
              cardData.gender || ""
            }/${
              cardData?.birth_year &&
              calculateAge({ birthYear: cardData?.birth_year }) + "Yrs"
            }`}</div>
          </div>
          {cardData?.blood_group && (
            <div className="gender-text-group">
              <div style={{ color: "#666666", fontSize: "9px" }}>
                Blood group
              </div>
              <div style={{ fontSize: "11px", color: "Black" }}>
                {cardData?.blood_group}
              </div>
            </div>
          )}
        </div>

        {cardData?.emergency_contact && (
          <div className="emergence-contact">
            <div>
              <div style={{ fontSize: "10px", color: "Black" }}>
                Emergency contact
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  id={`${cardData._id}-phone-2`}
                  src={images?.phone || "/v1cardImages/phone.png"}
                  alt="Phone"
                  style={{ width: "10px", height: "10px", marginRight: "5px" }}
                />
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "red",
                  }}
                >
                  {cardData.emergency_contact}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* barcode */}
        <div className="barcode-container">
          <div
            style={{
              fontFamily: "Inter",
              fontSize: "11px",
              fontWeight: "600",
            }}
          >
            {formatNumberWithSpaces(cardData.unique_number)}
          </div>
          <div>
            {cardData?.unique_number && (
              <div
                dangerouslySetInnerHTML={{
                  __html: DrawBarcode_Code39(
                    cardData.unique_number,
                    0,
                    "no",
                    "cm",
                    0.02,
                    3,
                    0.5,
                    4,
                    "bottom",
                    "center",
                    "",
                    "black",
                    "white",
                    "html"
                  ),
                }}
              />
            )}
            <div className="opp_vertical-text">{cardData.s_no}</div>
          </div>
        </div>

        <div
          className="footer"
          style={{
            ...(isPrint && { bottom: "-4px", height: "28.4px", width: "102%" }),
          }}
        >
          ।। खुश है वही जिसने पाया, स्वस्थ मन और निरोगी काया ।।
        </div>
      </div>
    </div>
  );
};

export default ArogyamComponent;
