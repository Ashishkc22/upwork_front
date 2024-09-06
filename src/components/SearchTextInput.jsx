import React, { useState, memo, useRef } from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import { styled } from "@mui/material/styles";
import ClearIcon from "@mui/icons-material/Clear";
import { IconButton } from "@mui/material";
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

const SearchInput = memo(
  ({ emitSearchChange, onLoadFocus = false, value }) => {
    const isFirstRender = storageUtil.getStorageData("firstHeaderRender");
    const [inputValue, setInputValue] = useState("");
    const searchRef = useRef("");
    return (
      <CustomTextField
        ref={searchRef}
        variant="outlined"
        placeholder="Search..."
        fullWidth
        value={inputValue}
        inputRef={
          onLoadFocus && isFirstRender
            ? (input) => input && input.focus()
            : null
        }
        onChange={(e) => {
          setInputValue(e?.target?.value || "");
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
                if (inputValue != "") {
                  setInputValue("");
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
  },
  (prevProps, nextProps) => {
    // Only re-render if the count prop has changed
    return false;
  }
);

export default SearchInput;
