import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Grid } from "@mui/material";
import { isEmpty } from "lodash";
import { useEffect } from "react";

const CustomAutocompleteDropDown = ({
  options,
  label,
  emitAutoCompleteChange,
  defaultValue,
  value,
  getOptionLabel,
}) => {
  return (
    <Autocomplete
      options={options}
      // {...(!isEmpty(defaultValue) && { defaultValue: defaultValue })}
      {...(!isEmpty(value) ? { value } : {})}
      {...(getOptionLabel && { getOptionLabel })}
      onChange={(e, newValue, value) => {
        emitAutoCompleteChange({ e, newValue });
      }}
      renderOption={(props, option) => {
        const { key, ...optionProps } = props;
        return (
          <Box key={key} sx={{ p: "3px", display: "block" }} {...optionProps}>
            <Grid container>
              <Typography fontSize={12} fontWeight={500}>
                {option.label}
              </Typography>
              {option.code && (
                <Typography fontSize={12} fontWeight={500} color="#000000b0">
                  ({`#${option.code}`})
                </Typography>
              )}
            </Grid>
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField {...params} label={label} variant="standard" />
      )}
    />
  );
};
export default CustomAutocompleteDropDown;
