import "./ArogyaCard_v2.css";
import moment from "moment";
import React, { useEffect } from "react";
import clsx from "clsx";
import { useRef } from "react";
import Barcode from "react-barcode";

const ArogyamComponent = ({
  cardData,
  isPrint = false,
  enableClick = false,
  handleClick,
  images,
  passRef,
  style,
  members = [],
}) => {
  function calculateAge(birthYear) {
    const currentYear = new Date().getFullYear();
    const birthYearNumber = parseInt(birthYear, 10);
    return birthYearNumber ? currentYear - birthYearNumber : null;
  }
  const divRef = useRef(null);
  const isIndividual = () => cardData.card_type !== "Family";
  const charLimit = (str = "", limit = 20) =>
    str.length > limit ? str.slice(0, limit) : str;
  const getGenderInitial = (str = "") => str[0].toUpperCase();
  const formatNumberWithSpaces = (number = 0) => {
    // Convert the number to a string
    const numberStr = number.toString();
    return numberStr.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1 ");
  };

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
        style={{
          position: "absolute",
          zIndex: 1,
          fontSize: "8.4px",
          opacity: 0.3,
          width: "461px",
        }}
      >
        {Array.from({ length: 21 }, (_, index) => (
          <p key={`water_mark_${index}`}>
            © 7ROGYAM HEALTHCARE PVT. LTD © 7ROGYAM HEALTHCARE PVT. LTD ©
            7ROGYAM HEALTHCARE PVT. LTD ©
          </p>
        ))}
      </div>
      <div
        style={{
          ...(style && style),
          // backgroundImage: `url(/card_water_mark.svg)`,
          backgroundSize: "120%",
        }}
        className={"card-container " + clsx(enableClick && "cursor")}
        onClick={() => {
          if (enableClick) {
            handleClick(cardData);
          }
        }}
      >
        <div className="support-header">
          <div style={{ position: "relative", top: "8px", opacity: "0.7" }}>
            <img
              id={`${cardData._id}-support`}
              src={images?.support || "/v1cardImages/support.png"}
              alt="support"
              style={{ width: "40px" }}
              className="support-image"
            />
          </div>
          <div className="header-text">
            <div style={{ marginLeft: "6px" }}>
              हेल्पलाइन नंबर (10 AM - 6 PM)
            </div>
            <div className="header-phone">011-69290540, 8181819718</div>
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
                  height: "105%",
                  background: "rgb(253, 163, 48)",
                  clipPath: "ellipse(70.6% 85% at 70% -1%)",
                  top: "-3px",
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
                clipPath: "ellipse(61% 80% at 73% 7%)",
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
          Printed on :{" "}
          <span style={{ fontWeight: "bold" }}>
            {moment(cardData.issue_date, "DD/MM/YYYY").format("MMM/YY")}
          </span>
        </div>
        <img
          id={`${cardData._id}-profile`}
          src={cardData?.image}
          alt="Profile"
          className="profile-image"
        />

        <div className="text-container">
          <div className="text-group">
            <div style={{ color: "#666666", fontSize: "9px" }}>
              {isIndividual() ? "Name" : "Primary menber"}
            </div>
            <div style={{ width: "max-content" }}>
              {charLimit(cardData.name, 50)}
            </div>
          </div>
          {isIndividual() ? (
            <div className="text-group">
              <div style={{ color: "#666666", fontSize: "9px" }}>
                Father/Husband
              </div>
              <div style={{ width: "max-content" }}>
                {charLimit(cardData.father_husband_name, 28)}
              </div>
            </div>
          ) : (
            <div className="text-group" style={{ width: "300px" }}>
              <div style={{ color: "#666666", fontSize: "9px" }}>Members</div>
              <div
                style={{
                  display: "flex",
                  // justifyContent: "space-between",
                  columnGap: "14px",
                  rowGap: "1px",
                  flexWrap: "wrap",
                }}
              >
                {cardData?.family_members?.map((member) => (
                  <div
                    key={member?._id || member?.name + member?.gender}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      columnGap: "8px",
                    }}
                  >
                    <span>{charLimit(member.name, 18)}</span>
                    <span>
                      {getGenderInitial(member.gender) +
                        "/" +
                        (calculateAge(member?.birth_year) || "NA")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Contact */}
        <div
          className="contact-container"
          style={{ ...(!isIndividual() && { top: "168px" }) }}
        >
          <div
            style={{
              display: "inline-flex",
              // marginTop: "3px",
              width: "90px",
              alignItems: "center",
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
              style={{
                width: "10px",
                height: "10px",
                marginRight: "9px",
                marginTop: "7px",
              }}
            />

            <div className="user-loc">
              {`${getGramAddress(cardData?.area)}, ${cardData?.tehsil}`}
            </div>
            <div className="user-loc-2">
              {`${cardData?.district}, ${cardData?.state}`}
            </div>
          </div>
        </div>

        <img
          id={`${cardData._id}-waterMark`}
          src={images?.waterMark || "/v1cardImages/waterMark.svg"}
          alt="Watermark"
          style={{
            width: "97px",
            right: "53px",
            top: "108px",
            zIndex: 2,
            opacity: "0.5",
          }}
          className="water-mark"
        />

        {isIndividual() && (
          <div className="gender-blood-info">
            <div className="gender-text-group">
              <div style={{ color: "#666666", fontSize: "9px" }}>Gender</div>
              <div style={{ fontSize: "11px", color: "Black" }}>{`${
                cardData.gender || ""
              }/${
                cardData?.birth_year &&
                calculateAge(cardData?.birth_year) + "Yrs"
              }`}</div>
            </div>
            {cardData?.blood_group && cardData?.blood_group != "null" && (
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
        )}

        {cardData?.emergency_contact &&
          cardData.emergency_contact !== cardData.phone && (
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
                    style={{
                      width: "10px",
                      height: "10px",
                      marginRight: "5px",
                    }}
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
          {cardData?.unique_number && (
            <div
              style={{
                fontFamily: "Inter",
                fontSize: "11px",
                fontWeight: "600",
                // position: "absolute",
                // right: "83px",
                // bottom: "49px",
              }}
            >
              {"BH" + formatNumberWithSpaces(cardData.unique_number)}
            </div>
          )}
          <div>
            {cardData?.unique_number && (
              <Barcode
                value={cardData.unique_number}
                displayValue={false}
                width={1.5}
                height={25}
                margin={0}
              />
            )}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            display: "flex",
            justifyContent: "end",
            // alignItems: "center",
            // width: "fit-content",
            right: "0px",
            bottom: "45px",
            width: "46px",
            transform: "rotate(90deg)",
          }}
        >
          <div className="opp_vertical-text">{cardData?.s_no}</div>
        </div>
        <div
          className="footer"
          style={{
            ...(isPrint && {
              bottom: "-14px",
              height: "38.4px",
              width: "102%",
            }),
          }}
        >
          ।। खुश है वही जिसने पाया, स्वस्थ मन और निरोगी काया ।।
        </div>
      </div>
    </div>
  );
};

export default ArogyamComponent;
