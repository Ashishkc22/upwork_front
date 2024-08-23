import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import { styled } from "@mui/material/styles";
import ClearIcon from "@mui/icons-material/Clear";
import { IconButton } from "@mui/material";

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

const SearchInput = ({ emitSearchChange, onLoadFocus = false, value }) => {
  const [inputValue, setInputValue] = useState("");
  return (
    <CustomTextField
      variant="outlined"
      placeholder="Search..."
      fullWidth
      value={inputValue}
      inputRef={onLoadFocus ? (input) => input && input.focus() : null}
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
              setInputValue("");
              emitSearchChange("");
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
