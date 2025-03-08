import React, { useEffect, useState } from "react";
import { Grid, Card, TablePagination, Box, Button, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { getUsers } from "../../services/users";
import { isEmpty } from "lodash";
import { useNavigate } from "react-router-dom";
import CustomTable from "../../components/CustomTable";
import LinearIndeterminate from "../../components/LinearProgress";

const tableHeaders = [
  { label: "SNO", key: "index" },
  { label: "NAME", key: "name" },
  { label: "EMAIL", key: "email" },
  { label: "STATUS", key: "status" }
];

const Users = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [usersList, setUsersList] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    setIsPageLoading(true);
    getUsers({
        params: {
          limit: rowsPerPage,
          page: page + 1,
        },
      })
      .then((response) => {
        console.log("response", response);
        if (!isEmpty(response)) {
          setUsersList(response.data);
          setTotalUsers(response.total_results);
        }
        setIsPageLoading(false);
      });
  }, [page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRowClick = (rowData) => {
    navigate(`/users/${rowData._id}`);
  };

  return (
    <Grid container spacing={2} sx={{ height: "100vh" }}>
      <Grid item xs={12} sx={{ height: "100%" }}>
        <Card sx={{ height: "100%" }}>
          <Box sx={{ p: 2, display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h5">Users</Typography>
          </Box>
          <Box sx={{ p: 2, height: "calc(100% - 100px)" }}>
            <CustomTable
              rows={usersList}
              headers={tableHeaders}
              rowClick={handleRowClick}
              tbCellStyle={{ p: 1,px:1 }}
              sx={{ height: "100%" }}
            />
          </Box>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={totalUsers}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
          {isPageLoading && <LinearIndeterminate />}
        </Card>
      </Grid>
    </Grid>
  );
};

export default Users;
