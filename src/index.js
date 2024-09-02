import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { SnackbarProvider } from "notistack";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const swUrl = `/service-worker.js`;
    console.log("swUrl", swUrl);

    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        console.log(
          "Service Worker registered with scope: ",
          registration.scope
        );
      })
      .catch((error) => {
        console.error("Service Worker registration failed: ", error);
      });
  });
}

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
