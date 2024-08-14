import { Navigate, Outlet } from "react-router-dom";
import tokenUtil from "../utils/token.util";

const Protected = () => {
  const token = tokenUtil.getAuthToken();
  return token ? <Outlet /> : <Navigate to="/" />;
};

export default Protected;
