import React, { useRef } from "react";
import "./ArogyaCard.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const ArogyamComponent = () => {
  const cardRef = useRef();

  return (
    <div
      ref={cardRef}
      style={{
        minWidth: "470px",
        maxWidth: "470px",
        minHeight: "305px",
        maxHeight: "305px",
        margin: 2,
        position: "relative",
        height: "239px",
        overflow: "hidden",
        "-ms-overflow-style": "none" /* IE and Edge */,
        "scrollbar-width": "none",
      }}
    >
      <div class="circle-container">
        <img src="cardImages/arlogo.png" alt="Image" />
      </div>
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background: "#fda330" /* Example background color */,
          "clip-path": "ellipse(35% 33% at 93% 1%)",
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
          <img src="cardImages/support.png" width="30px" alt="" srcset="" />
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
        {/* <Grid item xs={1}> */}
        <div style={{ marginTop: "20px" }}>
          <p
            style={{
              ml: 1,
              fontSize: "x-small",
              textAlign: "center",
              "writing-mode": "vertical-lr",
              "text-orientation": "mixed",
              transform: "rotate(181deg)",
              margin: 0,
            }}
          >
            Issued on: 05/08/2024
          </p>
        </div>
        <div
          style={{
            marginTop: "20px",
            marginRight: "10px",
            marginLeft: "10px",
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1551963831-b3b1ca40c98e"
            style={{ borderRadius: "20px" }}
            width="100px"
            height="121px"
            alt="Profile-img"
          />
        </div>
        <div
          style={{
            marginTop: "20px",
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
                marginTop: "2px",
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
              Ashish Choudhari
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
              Krishna Choudhari
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
              src="cardImages/call.png"
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
              8149441677
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
              src="cardImages/loc.png"
              alt=""
              srcset=""
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
                maxWidth: "95px",
              }}
            >
              Beelkheda Jagir ( बीलखेडा Raisen, MP)
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
              Male/17Yrs
            </p>
          </div>
        </div>
      </div>
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
          py: "3px",
          fontSize: "12px",
          paddingTop: "4px",
          paddingBottom: "4px",
        }}
      >
        || खुश है वही जिसने पाया, स्वस्थ मन और निरोगी काया ||
      </div>
    </div>
  );
};

export default ArogyamComponent;
