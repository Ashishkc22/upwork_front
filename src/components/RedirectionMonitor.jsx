import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function RouteWrapper({ element, redirectTo }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Example logic: redirect based on conditions
    // if (redirectTo && location.pathname === redirectTo) {
    //   navigate("/home");
    // }
    console.log("redirectTo", redirectTo);
    console.log("location.pathname", location.pathname);
  }, [location, navigate, redirectTo]);

  return element;
}

export default RouteWrapper;
