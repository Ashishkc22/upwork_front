import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import { Routes, Route, useLocation } from "react-router-dom";
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

function App() {
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
            </Route>
          </Route>
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
