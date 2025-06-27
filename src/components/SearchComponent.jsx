import { useState, memo } from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Search as SearchIcon, Clear as ClearIcon } from "@mui/icons-material";
import { debounce } from "lodash";

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

let timeInstance = null;

const searchComponent = ({ selectedCardType, handleSearchChanges }) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [search, setSearch] = useState("");
  const handleSearch = (value) => {
    if (timeInstance) {
      clearTimeout(timeInstance);
    }
    timeInstance = setTimeout(() => handleSearchChanges(value), 500);
  };
  return (
    <CustomTextField
      variant="outlined"
      placeholder="Search..."
      fullWidth
      value={search}
      inputRef={
        selectedCardType === "totalCards"
          ? (input) => input && input.focus()
          : null
      }
      onChange={(e) => {
        setSearch(e.target?.value ? e.target.value : "");
        handleSearch(e.target.value);
      }}
      // setSearchInputValue(e?.target?.value || "");
      // emitSearchChange(e);

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
              if (search !== "") {
                setSearch(e.target?.value ? e.target.value : "");

                handleSearch("");
                // setTimeout(() => callBackFunction({ callAPI: true }), 1000);
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

export default memo(searchComponent);
