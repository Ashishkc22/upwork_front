import { CssBaseline, ThemeProvider } from "@mui/material";
import { useEffect } from "react";
import { ColorModeContext, useMode } from "./theme";
import { Routes, Route } from "react-router-dom";
import { Blank } from "./views/layout/blank.layout";
import { HomeLayout } from "./views/layout/home.loayout";
import LoginPage from "./views/login/Login";
import Protected from "./routes/Protected";
import Public from "./routes/Public";
import Dashboard from "./views/dashboard/Dashboard";
import Cards from "./views/cards/Cards";
import InfoCard from "./views/cards/InfoCard";
import PageNotFound from "./components/PageNotFound";
import HospitalPage from "./views/hospitals/Hospitals";
import InfoHospital from "./views/hospitals/InfoHospital";
import FieldExecutives from "./views/field_executives/FieldExecutives";
import UserInfo from "./views/field_executives/UserInfo";
import Settings from "./views/settings/Settings";
import RouteWrapper from "./components/RedirectionMonitor";
import Bin from "./views/bin/Bin";
// import { loadFontFromCache, cacheGoogleFont } from "./utils/cache.util";

// const loadGoogleFonts = async () => {
//   const googleFontUrls = [
//     // "https://fonts.googleapis.com/css2?family=Source+Code+Pro:ital,wght@400:600:700&display=swap",
//     "https://fonts.googleapis.com/css2?family=Libre+Barcode+39&family=Source+Code+Pro:ital,wght@0,200..900;1,200..900&display=swap",
//     "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,600;1,14..32,600&display=swap",
//     "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,500;1,14..32,500&display=swap",
//   ];

//   for (const url of googleFontUrls) {
//     const cssText = await cacheGoogleFont(url);
//     if (cssText) {
//       const style = document.createElement("style");
//       style.innerHTML = cssText;
//       document.head.appendChild(style);
//     }
//   }
// };

// const loadFonts = async () => {
//   const addFontToHeader = (name, fontUrl, wight = "normal") => {
//     const style = document.createElement("style");
//     style.innerHTML = `
//       @font-face {
//         font-family:${name};
//         src: url(${fontUrl}) format('truetype');
//         font-weight: ${wight};
//         font-style: normal;
//       }
//     `;
//     document.head.appendChild(style);
//   };
//   loadFontFromCache("/fonts/Poppins-Regular.ttf").then((url) =>
//     addFontToHeader("Poppins-regular", url)
//   );
//   loadFontFromCache("/fonts/Poppins-Light.ttf").then((url) =>
//     addFontToHeader("Poppins-light", url, 300)
//   );
// };

function App() {
  // useEffect(() => {
  //   // loadGoogleFonts();
  //   // loadFonts();
  // }, []);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      // For most modern browsers, a string needs to be assigned to event.returnValue
      event.returnValue = ""; // This triggers the browser's default confirmation dialog
    };

    // Add the beforeunload event listener
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup function to remove the event listener when the component is unmounted
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const [theme, colorMode] = useMode();
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route element={<Public />}>
            <Route element={<Blank />}>
              <Route path="/" element={<LoginPage />} />
            </Route>
          </Route>
          <Route element={<Protected />}>
            <Route element={<HomeLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/cards" element={<Cards />} />
              <Route path="/cards/:id" element={<InfoCard />} />
              <Route path="/hospitals" element={<HospitalPage />} />
              <Route path="/hospitals/:id" element={<InfoHospital />} />
              <Route path="/field-executives" element={<FieldExecutives />} />
              <Route path="/field-executives/:id" element={<UserInfo />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/bin" element={<Bin />} />
            </Route>
          </Route>
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
