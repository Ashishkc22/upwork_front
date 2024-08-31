import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { SnackbarProvider } from "notistack";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // <React.StrictMode>
  <SnackbarProvider
    maxSnack={4}
    anchorOrigin={{ horizontal: "right", vertical: "top" }}
    autoHideDuration="2000"
  >
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </SnackbarProvider>
  // </React.StrictMode>
);
