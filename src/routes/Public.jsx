import { Navigate, Outlet } from "react-router-dom";
import tokenUtil from "../utils/token.util";

const Public = () => {
  const token = tokenUtil.getAuthToken();
  return !token ? <Outlet /> : <Navigate to="/dashboard" />;
};

export default Public;
