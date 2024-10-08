import React, { useState } from "react";
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
  Divider,
  Button,
} from "@mui/material";
import moment from "moment";
import { isEmpty } from "lodash";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ThreeDotsDynamicMenu from "./DynamicMenu";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

const DynamicTable = ({
  headers = [],
  rows = [],
  actions = [],
  rowClick,
  tbCellStyle = {},
  dataForSmallScreen,
  handleMenuSelect,
  highlightedRow = "",
  handleSort,
  showActionMenu = true,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isWideScreen = useMediaQuery("(min-width:1200px)");
  const [sortType, setSortType] = useState("acc");

  function calculateAge({ row, keymap, birthYear }) {
    const currentYear = new Date().getFullYear(); // Get the current year
    const birthYearNumber = parseInt(birthYear, 10); // Convert birth year to a number
    return birthYearNumber ? currentYear - birthYearNumber : null; // Calculate and return age, or null if birth year is invalid
  }

  const getCellValue = ({
    keymap = "",
    row = {},
    rowIndex,
    showActionMenu,
  }) => {
    if (keymap.label == "RATIO") {
      return (
        <Typography variant="body2">
          {row[keymap.key].toFixed(2) + " %"}
        </Typography>
      );
    }
    if (
      keymap.key === "created_at" ||
      keymap.key === "expiry_date" ||
      keymap.key === "deleted_at"
    ) {
      return (
        <Typography variant="body2">
          {moment(row?.[keymap.key]).format(
            keymap.key === "expiry_date" ? "MMM YYYY" : "DD-MM-YYYY HH:mm:ss"
          )}
        </Typography>
      );
    }
    if (keymap.key === "index") {
      return (
        <Typography variant="body2" noWrap>
          {rowIndex + 1}
        </Typography>
      );
    }
    if (
      !(isEmpty(keymap.label) && keymap.label !== "ACTION") ||
      keymap?.key !== "ACTION"
    ) {
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
      return (
        <Box display="flex">
          {actions?.map((action, actionIndex) => (
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
          ))}
          {showActionMenu && (
            <ThreeDotsDynamicMenu
              row={row}
              handleMenuSelect={handleMenuSelect}
            />
          )}
        </Box>
      );
    }
  };

  return (
    <TableContainer
      component={Paper}
      sx={{
        maxWidth: {
          lg: "98%",
          md: "98%",
          sm: "99%",
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
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow
                key={row._id + rowIndex}
                onClick={() => rowClick && rowClick(row)}
                sx={{
                  ":hover": { background: "#f3f3f3a1" },
                  ...(row?._id === highlightedRow && { background: "#d1efd1" }),
                }}
              >
                {headers.map((keymap, cellIndex) => (
                  <TableCell
                    key={row._id + keymap?.label + cellIndex}
                    sx={{
                      whiteSpace: "nowrap",
                      py: 0,
                      px: {
                        lg: 1,
                        md: "2px",
                        sm: 0,
                      },
                      ...(!isEmpty(tbCellStyle) && tbCellStyle),
                    }}
                  >
                    {getCellValue({ keymap, row, rowIndex, showActionMenu })}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <>
          {rows.map((row, rowIndex) => (
            <Accordion
              key={row._id + rowIndex}
              sx={{
                mb: 1,
                ...(row?._id === highlightedRow && { background: "#d1efd1" }),
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel${rowIndex}-content`}
                id={`panel${rowIndex}-header`}
              >
                <Box
                  display="inline-flex"
                  justifyContent="space-between"
                  sx={{ width: "100%", mr: 3 }}
                >
                  <Typography variant="h6">
                    {!dataForSmallScreen?.use ? (
                      `${row?.name} - ${row.unique_number} - ${row.father_husband_name} - ${row.status}` ||
                      "Unknown Name"
                    ) : (
                      <Box display="inline-flex" sx={{ width: "100%" }}>
                        {dataForSmallScreen.title.keys.map((key, index) => {
                          return (
                            <div>
                              {row[key] && (
                                <div style={{ display: "inline-flex" }}>
                                  <Typography
                                    variant="h6"
                                    sx={{ mx: 1, fontWeight: 500 }}
                                  >
                                    {key === "deleted_at"
                                      ? moment(row[key]).format(
                                          "DD-MM-YYYY HH:mm:ss"
                                        )
                                      : row[key]}
                                  </Typography>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </Box>
                    )}
                  </Typography>
                  <Box display="flex">
                    {rowClick && (
                      <Button variant="text" onClick={() => rowClick(row)}>
                        Details
                      </Button>
                    )}
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
                    {showActionMenu && (
                      <ThreeDotsDynamicMenu
                        row={row}
                        handleMenuSelect={handleMenuSelect}
                      />
                    )}
                  </Box>
                </Box>
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
                        <Box
                          key={keymap.label + index + "headers"}
                          // item
                          // xs={12}
                          // sm={4}
                          // md={3}
                          // sx={{ mr: 1 }}
                          // display="inline-flex"
                        >
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            sx={{ m: 1 }} // Margin to create space between label and value
                          >
                            {keymap.label}:
                          </Typography>
                          <Typography variant="body2" sx={{ m: 1 }}>
                            {keymap.key === "created_at" ||
                            keymap.key === "expiry_date"
                              ? moment(row?.[keymap.key]).format(
                                  "YYYY-MM-DD HH:mm:ss"
                                )
                              : row?.[keymap.key] || "N/A"}
                          </Typography>
                        </Box>
                      )
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </>
      )}
    </TableContainer>
  );
};

export default DynamicTable;
