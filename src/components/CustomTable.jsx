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
  Box,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
} from "@mui/material";
import moment from "moment";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const DynamicTable = ({ headers, rows, actions, rowClick }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isWideScreen = useMediaQuery("(min-width:1200px)");

  function calculateAge({ row, keymap, birthYear }) {
    const currentYear = new Date().getFullYear(); // Get the current year
    const birthYearNumber = parseInt(birthYear, 10); // Convert birth year to a number
    return birthYearNumber ? currentYear - birthYearNumber : null; // Calculate and return age, or null if birth year is invalid
  }

  const getCellValue = ({ keymap = "", row = {} }) => {
    if (keymap.key === "created_at" || keymap.key === "expiry_date") {
      return (
        <Typography variant="body2">
          {moment(row?.[keymap.key]).format(
            keymap.key === "expiry_date" ? "MMM YYYY" : "DD-MM-YYYY"
          )}
        </Typography>
      );
    }
    if (keymap.label !== "ACTION") {
      if (isSmallScreen) {
        if (keymap.isFunction) {
          return calculateAge({ keymap, row, birthYear: row[keymap.key] });
        }
        return (
          <Typography variant="body2" noWrap>
            {row[keymap.key]}
          </Typography>
        );
      } else {
        if (keymap.isFunction) {
          return calculateAge({ keymap, row, birthYear: row[keymap.key] });
        }
        return row[keymap.key];
      }
    } else {
      return actions?.map((action, actionIndex) => (
        <IconButton
          key={action.label + actionIndex}
          onClick={(e) => {
            e.stopPropagation();
            action.handler(row);
          }}
          aria-label={action.label}
          color="primary"
          sx={{ padding: isSmallScreen ? "4px" : "8px" }}
        >
          {action.icon}
        </IconButton>
      ));
    }
  };

  return (
    <TableContainer
      component={Paper}
      sx={{
        maxWidth: {
          lg: "100%",
          md: "90%",
          sm: "95%",
        },
        overflowX: "auto",
      }}
    >
      {isWideScreen ? (
        <Table sx={{ minWidth: isSmallScreen ? "auto" : "100%" }}>
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
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow
                key={row._id + rowIndex}
                onClick={() => rowClick && rowClick(row)}
                sx={{ ":hover": { background: "#f3f3f3a1" } }}
              >
                {headers.map((keymap, cellIndex) => (
                  <TableCell
                    key={row._id + keymap.label + cellIndex}
                    sx={{
                      whiteSpace: "nowrap",
                      py: 0,
                      px: {
                        lg: 1,
                        md: "2px",
                        sm: 0,
                      },
                    }}
                  >
                    {getCellValue({ keymap, row })}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Box>
          {rows.map((row, rowIndex) => (
            <Accordion key={row._id + rowIndex} sx={{ mb: 1 }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel${rowIndex}-content`}
                id={`panel${rowIndex}-header`}
              >
                <Typography variant="h6">
                  {`${row?.name} - ${row.unique_number} - ${row.father_husband_name} - ${row.status}` ||
                    "Unknown Name"}
                </Typography>
                {actions?.map((action, actionIndex) => (
                  <IconButton
                    key={row._id + action.label + actionIndex}
                    onClick={(e) => {
                      e.stopPropagation();
                      action.handler(row);
                    }}
                    aria-label={action.label}
                    color="primary"
                    sx={{
                      padding: isSmallScreen ? "4px" : "8px",
                    }}
                  >
                    {action.smallIcon}
                  </IconButton>
                ))}
              </AccordionSummary>
              <AccordionDetails>
                <Grid
                  container
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2, // Adjust spacing between label and value
                  }}
                >
                  {headers?.map(
                    (keymap, index) =>
                      keymap.key && (
                        <Grid
                          key={keymap.label + index + "headers"}
                          item
                          xs={12}
                          sm={4}
                          md={2}
                          sx={{ mr: 1 }}
                          display="inline-flex"
                        >
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            sx={{ mr: 1 }} // Margin to create space between label and value
                          >
                            {keymap.label}:
                          </Typography>
                          <Typography variant="body2">
                            {keymap.key === "created_at" ||
                            keymap.key === "expiry_date"
                              ? moment(row?.[keymap.key]).format(
                                  "YYYY-MM-DD HH:mm:ss"
                                )
                              : row?.[keymap.key] || "N/A"}
                          </Typography>
                        </Grid>
                      )
                    //  : (
                    //   <Box key={key} sx={{ mb: 1 }}>
                    //     <Typography variant="body2" fontWeight="bold">
                    //       {key
                    //         ?.replace(/_/g, " ")
                    //         ?.replace(/\b\w/g, (char) => char.toUpperCase())}
                    //       :
                    //     </Typography>
                    //     <img
                    //       src={row?.[key]}
                    //       alt="Profile"
                    //       style={{ maxWidth: "100%", height: "auto" }}
                    //     />
                    //   </Box>
                    // )
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </TableContainer>
  );
};

export default DynamicTable;
