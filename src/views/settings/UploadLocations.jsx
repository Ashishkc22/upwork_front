import { useEffect, useRef, useState } from "react";
import { Box, Grid, Button, Typography } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { read, utils } from "xlsx";
import { isEmpty } from "lodash";
import LocationList from "./LocationList";
import { enqueueSnackbar } from "notistack";
import Fab from "@mui/material/Fab";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import commonService from "../../services/common";

const UploadLocation = () => {
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [fileFormatedData, setFileFormatedData] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState();
  const [selectedJanpadPanchyat, setSelectedJanpadPanchyat] = useState(null);
  const [selectedGramPanchayat, setSelectedGramPanchayat] = useState(null);
  const [selectedJanpadPanchyatValue, setSelectedJanpadPanchyatValue] =
    useState(null);
  const [selectedGramPanchayatValue, setSelectedGramPanchayatValue] =
    useState(null);
  const [selectedGram, setSelectedGram] = useState(null);

  const handleFileChange = (event) => {
    console.log("hello", event?.target?.files?.[0]);

    if (event.target.files?.[0]) {
      setFile(event.target.files?.[0]);
    }
  };

  const arrangeExcelData = (data) => {
    const formatedData = [];
    let districtIndex = -1;
    let janpadIndex = 0;
    let gramPanchayatIndex = 0;
    let gramIndex = 0;
    for (let i = 0; i < data.length; i++) {
      const index = i;
      const row = data[index];
      let obj = {
        janpadPanchyat: [],
        gramPanchayat: [],
        gram: [],
      };
      if (row["S.No."] === 1 && !row?.District) {
        console.log("Incorrect data");
        enqueueSnackbar("Incorrect Data.", {
          variant: "error",
          autoHideDuration: 2000,
        });
        return;
      }

      if (row.District) {
        obj = {
          district: row?.District || "",
          janpadPanchyat: [],
        };
        // formatedData.push();
        districtIndex += 1;
        janpadIndex = -1;
        gramPanchayatIndex = -1;
        gramIndex = -1;
      } else {
        obj = formatedData[districtIndex];
      }
      if (row["Janpad Panchayat"]) {
        obj.janpadPanchyat.push({
          name: row["Janpad Panchayat"],
        });
        janpadIndex += 1;
      }
      if (row["Gram Panchayat"]) {
        if (!obj.janpadPanchyat[janpadIndex]?.gramPanchayat)
          obj.janpadPanchyat[janpadIndex].gramPanchayat = [];
        obj.janpadPanchyat[janpadIndex].gramPanchayat.push({
          name: row["Gram Panchayat"],
          rojgar_sahayak: {
            name: row["Rojgar Sahayak"],
            phone: row["Mob No._2"],
          },
          sachiv: {
            name: row.Sachiv,
            phone: row["Mob No._1"],
          },
          sarpanch: { name: row.Sarpanch, phone: row["Mob No."] },
          pincode: "",
        });
        gramPanchayatIndex += 1;
      }
      if (row.Gram) {
        if (
          !obj.janpadPanchyat[janpadIndex]?.gramPanchayat[gramPanchayatIndex]
            ?.gram
        )
          obj.janpadPanchyat[janpadIndex].gramPanchayat[
            gramPanchayatIndex
          ].gram = [];
        obj.janpadPanchyat[janpadIndex].gramPanchayat[
          gramPanchayatIndex
        ].gram.push({
          name: row.Gram,
        });
        gramIndex += 1;
      }
      formatedData[districtIndex] = obj;
    }
    setFileFormatedData(formatedData);
  };

  const handleItemClick = (data, title, value) => {
    if (title === "District") {
      setSelectedDistrict(value);
      setSelectedJanpadPanchyat(data);
    } else if (title === "Janpad Panchyat") {
      setSelectedJanpadPanchyatValue(value);
      setSelectedGramPanchayat(data);
    } else if (title === "Gram Panchyat") {
      setSelectedGramPanchayatValue(value);
      setSelectedGram([...data]);
    }
  };

  useEffect(() => {
    if (file) {
      const reader = new FileReader();

      reader.onload = function (e) {
        const arrayBuffer = e.target.result;
        const wb = read(arrayBuffer);
        const ws = wb.Sheets[wb.SheetNames[0]]; // get the first worksheet
        const data = utils.sheet_to_json(ws); //
        if (data) {
          console.log("data", data);
          const formatedData = arrangeExcelData(data);
          console.log("formatedData", formatedData);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  }, [file]);

  const uploadLocation = () => {
    commonService.uploadLocation(fileFormatedData).then(() => {
      setFileFormatedData(null);
      setSelectedDistrict(null);
      setSelectedJanpadPanchyat(null);
      setSelectedGramPanchayat(null);
      setSelectedJanpadPanchyatValue(null);
      setSelectedGramPanchayatValue(null);
      setSelectedGram(null);
      setFile(null);
      fileRef.current.value = "";
      console.log("fileRef", fileRef.current);
    });
  };

  return (
    <Grid container columnGap={1}>
      <Grid
        item
        sx={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          alignItems: "center",
        }}
      >
        {fileRef && (
          <Button
            onClick={() => fileRef.current.click()}
            startIcon={<UploadFileIcon />}
          >
            Select file
          </Button>
        )}
        <Box>{file && <Typography>{file.name}</Typography>}</Box>
        <input
          type="file"
          accept=".xlsx"
          ref={fileRef}
          multiple={false}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </Grid>
      {!isEmpty(fileFormatedData) && (
        <Fab
          variant="extended"
          size="large"
          onClick={uploadLocation}
          sx={{
            position: "absolute",
            right: 20,
            bottom: 20,
            background: "#ff5722",
            color: "white",
            ":hover": {
              background: "#e83c05",
            },
          }}
        >
          <CheckCircleOutlineIcon sx={{ marginRight: "8px" }} />
          Upload
        </Fab>
      )}
      <Box>
        {!isEmpty(fileFormatedData) && (
          <LocationList
            title={"District"}
            initialItems={fileFormatedData}
            innerKey={"district"}
            clickDataKey="janpadPanchyat"
            handleItemClick={handleItemClick}
            selectedValue={selectedDistrict}
          />
        )}
      </Box>
      <Box>
        {!isEmpty(selectedJanpadPanchyat) && (
          <LocationList
            title={"Janpad Panchyat"}
            initialItems={selectedJanpadPanchyat}
            innerKey={"name"}
            clickDataKey="gramPanchayat"
            handleItemClick={handleItemClick}
            selectedValue={selectedJanpadPanchyatValue}
          />
        )}
      </Box>
      <Box>
        {!isEmpty(selectedGramPanchayat) && (
          <LocationList
            title={"Gram Panchyat"}
            initialItems={selectedGramPanchayat}
            innerKey={"name"}
            clickDataKey="gram"
            handleItemClick={handleItemClick}
            selectedValue={selectedGramPanchayatValue}
          />
        )}
      </Box>
      <Box>
        {!isEmpty(selectedGram) && (
          <LocationList
            title={"Gram"}
            initialItems={selectedGram}
            innerKey={"name"}
          />
        )}
      </Box>
    </Grid>
  );
};

export default UploadLocation;
