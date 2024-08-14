import { Outlet } from "react-router-dom";
import Slidebar from "../../components/Sidebar.jsx";
import { Box } from "@mui/material";

export function HomeLayout() {
  return (
    // <div className="app">
    <Slidebar>
      <Outlet />
    </Slidebar>
    // </div>
  );
}
