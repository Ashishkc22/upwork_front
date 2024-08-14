import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  useTheme,
  useMediaQuery,
  Typography,
} from "@mui/material";
import { grey } from "@mui/material/colors";

const DynamicTable = ({ headers, rows, actions, rowClick }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <TableContainer
      component={Paper}
      sx={{ maxWidth: "99%", overflowX: "auto" }}
    >
      <Table>
        <TableHead sx={{ background: "#f3f3f3a1" }}>
          <TableRow>
            {headers.map((keymap, index) => (
              <TableCell key={index} sx={{ whiteSpace: "nowrap" }}>
                {keymap.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {/* {JSON.stringify(rows)} */}
          {rows.map((row, rowIndex) => {
            return (
              <TableRow
                key={rowIndex}
                onClick={rowClick}
                sx={{ ":hover": { background: "#f3f3f3a1" } }}
              >
                {headers.map((keymap) => (
                  <>
                    {keymap.label != "ACTION" ? (
                      <TableCell
                        key={rowIndex}
                        sx={{
                          whiteSpace: "nowrap",
                          py: 0,
                        }}
                      >
                        {isSmallScreen ? (
                          <Typography variant="body2" noWrap>
                            {row[keymap.key]}
                          </Typography>
                        ) : (
                          row[keymap.key]
                        )}
                      </TableCell>
                    ) : (
                      <TableCell sx={{ py: 0 }}>
                        {actions.map((action, actionIndex) => (
                          <IconButton
                            key={actionIndex}
                            onClick={() => action.handler(row)}
                            aria-label={action.label}
                            color="primary"
                          >
                            {action.icon}
                          </IconButton>
                        ))}
                      </TableCell>
                    )}
                  </>
                ))}
              </TableRow>
            );
          })}
          {/* {rows.map((row, rowIndex) => {
            return headers.map((keymap) => (
              <TableRow
                key={rowIndex}
                onClick={rowClick}
                sx={{ ":hover": { background: "#f3f3f3a1" } }}
              >
                <TableCell
                  key={rowIndex}
                  sx={{
                    whiteSpace: "nowrap",
                    py: 0,
                  }}
                >
                  {isSmallScreen ? (
                    <Typography variant="body2" noWrap>
                      {row[keymap.key]}
                    </Typography>
                  ) : (
                    row[keymap.key]
                  )}
                </TableCell>
                {Object.values(row).map((value, cellIndex) => (
                  <TableCell
                    key={cellIndex}
                    sx={{
                      whiteSpace: "nowrap",
                      py: 0,
                    }}
                  >
                    {isSmallScreen ? (
                      <Typography variant="body2" noWrap>
                        {value}
                      </Typography>
                    ) : (
                      value
                    )}
                  </TableCell>
                ))}
                Action Buttons
                <TableCell sx={{ py: 0 }}>
                  {actions.map((action, actionIndex) => (
                    <IconButton
                      key={actionIndex}
                      onClick={() => action.handler(row)}
                      aria-label={action.label}
                      color="primary"
                    >
                      {action.icon}
                    </IconButton>
                  ))}
                </TableCell>
              </TableRow>
            ));
          })} */}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DynamicTable;
