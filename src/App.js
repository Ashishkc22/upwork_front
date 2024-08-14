import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import { Routes, Route } from "react-router-dom";
import { Blank } from "./views/layout/blank.layout";
import { HomeLayout } from "./views/layout/home.loayout";
import LoginPage from "./views/login/Login";
import Protected from "./routes/Protected";
import Public from "./routes/Public";
import Dashboard from "./views/dashboard/Dashboard";
import Cards from "./views/cards/Cards";
import PageNotFound from "./components/PageNotFound";

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
            </Route>
          </Route>
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
