import React, { useEffect } from "react";

import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";

import { isEmpty } from "lodash";

const ChipStack = ({ chipData = [] }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  useEffect(() => {
    console.log("chipData ===========", chipData);
  }, [chipData]);
  return (
    <Stack direction="row" spacing={1}>
      {!isEmpty(chipData) &&
        chipData.map((data, index) => (
          <Chip
            label={data.label}
            variant="outlined"
            sx={{
              background: colors.primary[200],
            }}
            onDelete={() => data.onDelete(data, index)}
          />
        ))}
    </Stack>
  );
};

export default ChipStack;
