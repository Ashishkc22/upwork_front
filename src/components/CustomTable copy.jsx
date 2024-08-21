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
  MenuItem,
  Menu,
} from "@mui/material";
import moment from "moment";
import { isEmpty } from "lodash";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TablePagination from "@mui/material/TablePagination";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const DynamicTable = ({
  headers = [],
  rows = [],
  actions = [],
  rowClick = () => {},
  tbCellStyle = {},
  dataForSmallScreen,
  showPagiantion = false,
  isMenu = false,
  menuActionHandlers = {},
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isWideScreen = useMediaQuery("(min-width:1200px)");
  const [anchorEl, setAnchorEl] = useState(null);

  // Handle Pagination
  const [page, setPage] = React.useState(2);
  const [rowsPerPage, setRowsPerPage] = React.useState(100);
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  function calculateAge({ row, keymap, birthYear }) {
    const currentYear = new Date().getFullYear(); // Get the current year
    const birthYearNumber = parseInt(birthYear, 10); // Convert birth year to a number
    return birthYearNumber ? currentYear - birthYearNumber : null; // Calculate and return age, or null if birth year is invalid
  }

  const getCellValue = ({ keymap = "", row = {}, rowIndex }) => {
    function handleOptionsClick(e) {
      debugger;
      e.stopPropagation();
      console.log("e", e.target.value);
      console.log("row-------", row);

      if (!isEmpty(menuActionHandlers)) {
        // menuActionHandlers.handleMenuItemClick(, row, e);
      }
      setAnchorEl(null);
    }
    if (keymap.key === "created_at" || keymap.key === "expiry_date") {
      return (
        <Typography variant="body2">
          {moment(row?.[keymap.key]).format(
            keymap.key === "expiry_date" ? "MMM YYYY" : "DD-MM-YYYY"
          )}
        </Typography>
      );
    }
    if (keymap.key === "index") {
      return (
        <Typography variant="body2" noWrap>
          {rowIndex}
        </Typography>
      );
    }
    if (keymap.key === "ratio") {
      return (
        <Typography variant="body2" noWrap>
          {`${Number(row[keymap.key]).toFixed(2)}%`}
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
      return (
        <Box display="flex" key={keymap.key + rowIndex + row.name}>
          {/* {actions?.map((action, actionIndex) => (
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
          ))} */}
          <div>
            {/* {isMenu && ( */}
            <IconButton
              onClick={(event) => {
                event.stopPropagation();
                setAnchorEl(event.currentTarget);
              }}
              aria-controls="simple-menu"
              aria-haspopup="true"
            >
              <MoreVertIcon />
            </IconButton>
            {/* )} */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={(e) => {
                e.stopPropagation();
                setAnchorEl(null);
              }}
              sx={{
                "& .MuiPaper-root": {
                  backgroundColor: "white", // Set background color to white
                  boxShadow: "none", // Remove any box shadow
                  borderRadius: "4px", // Optional: Set border radius
                  border: "2px black solid",
                  borderWidth: "1px",
                },
              }}
            >
              {menuActionHandlers?.options.map((option, index) => {
                return (
                  <MenuItem
                    key={option + index + "Options"}
                    value={option}
                    onClick={handleOptionsClick}
                  >
                    {option}
                  </MenuItem>
                );
              })}
            </Menu>
          </div>
        </Box>
      );
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
                      ...(!isEmpty(tbCellStyle) && tbCellStyle),
                    }}
                  >
                    {getCellValue({ keymap, row, rowIndex })}
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
                <Box
                  display="inline-flex"
                  justifyContent="space-between"
                  sx={{ width: "100%" }}
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
                                  {/* <Typography
                                    variant="body"
                                    sx={{ fontWeight: 600 }}
                                  >
                                    {key.replaceAll("_", " ")}
                                  </Typography> */}
                                  <Typography
                                    variant="h6"
                                    sx={{ mx: 1, fontWeight: 500 }}
                                  >
                                    {row[key]}
                                  </Typography>
                                  {" - "}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </Box>
                    )}
                  </Typography>
                  <div>
                    <Button variant="text" onClick={() => rowClick(row)}>
                      Details
                    </Button>
                    <Box display="flex">
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
                      {isMenu && (
                        <div>
                          <IconButton
                            onClick={(event) => {
                              event.stopPropagation();
                              setAnchorEl(event.currentTarget);
                            }}
                            aria-controls="simple-menu"
                            aria-haspopup="true"
                          >
                            <MoreVertIcon />
                          </IconButton>
                          <Menu
                            id="simple-menu"
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={(e) => {
                              e.stopPropagation();
                              setAnchorEl(null);
                            }}
                            MenuListProps={{
                              "aria-labelledby": "basic-button",
                            }}
                            sx={{
                              "& .MuiPaper-root": {
                                backgroundColor: "white", // Set background color to white
                                boxShadow: "none", // Remove any box shadow
                                borderRadius: "4px", // Optional: Set border radius
                                border: "2px black solid",
                                borderWidth: "1px",
                              },
                            }}
                          >
                            {menuActionHandlers.options.map((option) => (
                              <MenuItem
                                key={option}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  menuActionHandlers.handleMenuItemClick(
                                    option,
                                    row,
                                    e
                                  );
                                  setAnchorEl(null);
                                }}
                              >
                                {option}
                              </MenuItem>
                            ))}
                          </Menu>
                        </div>
                      )}
                    </Box>
                  </div>
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
                          {keymap.key === "ratio" ? (
                            <Typography variant="body2" sx={{ m: 1 }}>
                              {`${Number(row?.[keymap.key]).toFixed(2)}%`}
                            </Typography>
                          ) : (
                            <Typography variant="body2" sx={{ m: 1 }}>
                              {keymap.key === "created_at" ||
                              keymap.key === "expiry_date"
                                ? moment(row?.[keymap.key]).format(
                                    "YYYY-MM-DD HH:mm:ss"
                                  )
                                : row?.[keymap.key] || "N/A"}
                            </Typography>
                          )}
                        </Box>
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
      {showPagiantion && (
        <TablePagination
          component="div"
          count={100}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
    </TableContainer>
  );
};

export default DynamicTable;
