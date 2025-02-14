import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import List from "./pages/list/List";
import Single from "./pages/single/Single";
import New from "./pages/new/New";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { productInputs, userInputs } from "./formSource";
import "./style/dark.scss";
import { useContext } from "react";
import { DarkModeContext } from "./context/darkModeContext";
import { AuthContext } from "./context/AuthContext";
import Register from "./pages/login/Register";
import Hotel from "./pages/Hotel/Hotel";
import Add_hotel from "./pages/Hotel/Add_hotel";

import Landing_page from "./pages/home/Landing_page";

function App() {
  const { darkMode } = useContext(DarkModeContext);
  const { currentUser } = useContext(AuthContext);
  
  // Protect routes for authenticated users
  const RequireAuth = ({ children }) => {
    return currentUser ? children : <Navigate to="/login" />;
  };

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <BrowserRouter>
        <Routes>
          {/* Set the landing page as the default route */}
          <Route path="/" element={<Landing_page />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes - users need to be authenticated to access these */}
          <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
          <Route path="/users">
            <Route index element={<RequireAuth><List /></RequireAuth>} />
            <Route path=":userId" element={<RequireAuth><Single /></RequireAuth>} />
            <Route
              path="new"
              element={<RequireAuth><New inputs={userInputs} title="Add New User" /></RequireAuth>}
            />
          </Route>

          <Route path="/products">
            <Route index element={<RequireAuth><List /></RequireAuth>} />
            <Route path=":productId" element={<RequireAuth><Single /></RequireAuth>} />
            <Route
              path="new"
              element={<RequireAuth><New inputs={productInputs} title="Add New Product" /></RequireAuth>}
            />
          </Route>

          {/* Hotel routes */}
          <Route path="/hotel" element={<RequireAuth><Hotel /></RequireAuth>} />
          <Route path="/addhotel" element={<RequireAuth><Add_hotel /></RequireAuth>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
