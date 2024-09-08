import React, { useState, memo, useRef, useEffect } from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import { styled } from "@mui/material/styles";
import ClearIcon from "@mui/icons-material/Clear";
import { IconButton } from "@mui/material";
import { useSearchParams } from "react-router-dom";

import storageUtil from "../utils/storage.util";

const CustomTextField = styled(TextField)(({ theme }) => ({
  backgroundColor: "#f0f0f0", // Light grey background
  borderRadius: 50,
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      border: "none", // Remove border
    },
    "&:hover fieldset": {
      border: "none",
      borderRadius: 50,
    },
    "&.Mui-focused fieldset": {
      border: "none",
      borderRadius: 50,
    },
  },
}));

const SearchInput = ({
  emitSearchChange,
  onLoadFocus = false,
  value,
  setSearchTerm,
}) => {
  const isFirstRender = storageUtil.getStorageData("firstHeaderRender");
  let [urlDateType, setUrlDateType] = useSearchParams();
  // const [inputValue, setInputValue] = useState(null);
  // useEffect(() => {
  //   setInputValue(value);
  // }, [value]);
  const searchRef = useRef("");
  return (
    <CustomTextField
      ref={searchRef}
      variant="outlined"
      placeholder="Search..."
      fullWidth
      value={value}
      inputRef={
        onLoadFocus && isFirstRender ? (input) => input && input.focus() : null
      }
      onChange={(e) => {
        // setInputValue(e?.target?.value || "");
        emitSearchChange(e);
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
        endAdornment: (
          <IconButton
            position="start"
            onClick={(e) => {
              if (value != "") {
                setSearchTerm();
                emitSearchChange("");
              }
            }}
          >
            <ClearIcon />
          </IconButton>
        ),
      }}
    />
  );
};

export default SearchInput;
