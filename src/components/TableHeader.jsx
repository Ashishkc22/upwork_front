import React, { useMemo, useState } from "react";
import { TableHead, TableRow, TableCell, IconButton } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

const CustomTableHead = ({ headers, isSmallScreen, handleSort }) => {
  const [sortType, setSortType] = useState("acc");

  const memoizedTableHead = useMemo(() => {
    return (
      <TableHead sx={{ background: "#f3f3f3a1" }}>
        <TableRow>
          {headers.map((keymap, index) => (
            <TableCell
              key={keymap.label + keymap.key + index}
              sx={{
                whiteSpace: isSmallScreen ? "normal" : "nowrap",
                py: 1,
                pl: 1,
                px: {
                  lg: 1,
                  md: 0,
                  sm: 0,
                },
              }}
            >
              {keymap.label}
              {keymap.sort && (
                <IconButton
                  size="small"
                  onClick={() => {
                    setSortType((pre) => {
                      const type = pre === "acc" ? "des" : "acc";
                      if (handleSort) {
                        handleSort({ colName: keymap.key, type });
                      }
                      return type;
                    });
                  }}
                >
                  {sortType == "acc" ? (
                    <ArrowUpwardIcon />
                  ) : (
                    <ArrowDownwardIcon />
                  )}
                </IconButton>
              )}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    );
  }, [headers, isSmallScreen, sortType]);

  return memoizedTableHead;
};

export default CustomTableHead;
